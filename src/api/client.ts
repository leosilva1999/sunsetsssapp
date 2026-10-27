import { API_BASE_URL, API_PREFIX } from "../lib/env";
import { rewriteDevStorageUrls } from "../lib/devStorageUrls";
import { useAuthStore } from "../stores/authStore";
import type { AuthUser } from "../types/entities";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  /** Id opaco da requisição (docs/API.md, "Error format") — útil pra achar o erro nos logs da API. */
  get requestId(): string | undefined {
    const id = (this.payload as { requestId?: unknown } | null | undefined)?.requestId;
    return typeof id === "string" ? id : undefined;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /**
   * Objeto, ou função que o monta a CADA tentativa. A função existe pro caso em que o corpo
   * carrega o refresh token (ex.: `PUT /users/me/password`): se um 401 dispara refresh+retry, o
   * token gira, e repetir o corpo antigo faria o servidor tratá-lo como inativo e derrubar todas
   * as sessões.
   */
  body?: unknown;
  /**
   * false pra endpoints onde um 401 não deve disparar o fluxo de refresh+retry: os sem 🔒 em
   * `docs/API.md` (ex.: `/auth/login`, `/photos`, `/locations/{id}`). O token é anexado de
   * qualquer forma quando existe — vários desses endpoints "leem o bearer se presente" pra
   * resolver `likedByCurrentUser`/`isFollowedByCurrentUser` sem exigi-lo (ver seção "Common
   * conventions" da doc). Default `true`, para os 🔒.
   */
  auth?: boolean;
  /** pra cancelar a requisição em voo (ex.: sugestões de busca superadas por uma digitação mais nova). */
  signal?: AbortSignal;
  /** uso interno: evita loop infinito de retry após um refresh malsucedido. */
  _isRetry?: boolean;
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.title === "string") return obj.title; // ProblemDetails (ASP.NET)
    if (typeof obj.message === "string") return obj.message;
  }
  return fallback;
}

// Garante no máximo UMA chamada de refresh em voo mesmo que várias requisições
// batam em 401 ao mesmo tempo (ex.: várias queries disparadas juntas na Home).
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) throw new ApiError(401, "Sem refresh token.");

    const res = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      useAuthStore.getState().signOut();
      throw new ApiError(res.status, "Falha ao renovar sessão.");
    }

    // Mesmo shape de AuthResponse (accessToken/refreshToken/expiresAt/user) — docs/API.md,
    // seção Auth. Atualiza também o `user` (papel, avatar, `hasPassword`...) pra não ficar
    // defasado em relação ao servidor.
    const data = (await parseBody(res)) as { accessToken: string; refreshToken: string; user?: AuthUser };
    const store = useAuthStore.getState();
    store.setTokens(data);
    if (data.user) store.setUser(data.user);
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body: rawBody, auth = true, signal, _isRetry = false } = options;
  const body = typeof rawBody === "function" ? (rawBody as () => unknown)() : rawBody;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const { accessToken } = useAuthStore.getState();
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.ok) return rewriteDevStorageUrls(await parseBody(res)) as T;

  const payload = await parseBody(res);

  // 401 num endpoint 🔒: tenta renovar o token uma vez e repete a chamada original.
  // docs/API.md, gotcha #1 — 401 em delete de recurso de terceiro ("not the owner") não é sessão
  // expirada, é só o backend ainda não ter sido migrado pra 403 nesses casos específicos
  // (pré-existentes a roles). O retry aqui é inofensivo mesmo nesse caso: o refresh funciona
  // normalmente (a sessão está válida), a chamada original repete e falha de novo com o mesmo
  // 401 — que sobe pro caller como está, sem mascarar o erro real.
  if (res.status === 401 && auth && !_isRetry) {
    try {
      await refreshAccessToken();
      return apiFetch<T>(path, { ...options, _isRetry: true });
    } catch {
      throw new ApiError(401, extractErrorMessage(payload, "Sessão expirada."), payload);
    }
  }

  throw new ApiError(res.status, extractErrorMessage(payload, res.statusText), payload);
}
