import { apiFetch } from "./client";
import type { CursorPage, Location, Photo, Rating } from "../types/entities";
import type { LocationRankingPeriod, SunsetInfo } from "../types/api";

// Ver docs/API.md, seção Locations. Busca é FULLTEXT por prefixo de palavra com 3+ caracteres
// (não é substring — "osa" não casa com "Rosa"), substring simples com menos — debounce no
// client é obrigatório, o rate limit de 40 req/10s é só rede de segurança. Paginada por cursor,
// diferente do ranking abaixo.
export const locationsApi = {
  search: (params: { q?: string; lat?: number; lng?: number; radius?: number; cursor?: string | null; limit?: number; signal?: AbortSignal }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.lat !== undefined) qs.set("lat", String(params.lat));
    if (params.lng !== undefined) qs.set("lng", String(params.lng));
    if (params.radius !== undefined) qs.set("radius", String(params.radius));
    if (params.cursor) qs.set("cursor", params.cursor);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    return apiFetch<CursorPage<Location>>(`/locations?${qs.toString()}`, { auth: false, signal: params.signal });
  },

  // Não paginado — array plano, capado por `limit` (default 20, clamp 1–50 no servidor).
  ranking: (period: LocationRankingPeriod, limit?: number) => {
    const qs = new URLSearchParams({ period });
    if (limit !== undefined) qs.set("limit", String(limit));
    return apiFetch<Location[]>(`/locations/ranking?${qs.toString()}`, { auth: false });
  },

  get: (id: string) => apiFetch<Location>(`/locations/${id}`, { auth: false }),

  // Seção 5.8 — cadastrar local novo direto do fluxo de postar foto, quando a busca não acha.
  create: (payload: { name: string; latitude: number; longitude: number; city: string }) =>
    apiFetch<Location>("/locations", { method: "POST", body: payload }),

  // likedByCurrentUser vem sempre false aqui, independente do token — não resolvido pra esta
  // listagem (docs/API.md, gotcha #3).
  getPhotos: (id: string, cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<Photo>>(`/locations/${id}/photos${qs}`, { auth: false });
  },

  // Live, sem cache, via sunrise-sunset.org — pode falhar (502) independente do resto do local
  // estar OK; a UI deve só omitir o bloco, não quebrar a tela (seção 5.4).
  getSunset: (id: string, date?: string) => {
    const qs = date ? `?date=${date}` : "";
    return apiFetch<SunsetInfo>(`/locations/${id}/sunset${qs}`, { auth: false });
  },

  getRatings: (id: string, cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<Rating>>(`/locations/${id}/ratings${qs}`, { auth: false });
  },

  // 404 se o usuário autenticado ainda não avaliou — não é erro, é sinal pra UI decidir entre
  // "Avaliar" e "Editar avaliação" (seção 5.4). Ver src/hooks/useLocationDetail.ts, que
  // converte esse 404 em `null`.
  getMyRating: (id: string) => apiFetch<Rating>(`/locations/${id}/ratings/me`),

  // Upsert: avaliar de novo substitui nota E comentário por inteiro (não é partial update).
  upsertRating: (id: string, payload: { score: number; comment?: string | null }) =>
    apiFetch<Rating>(`/locations/${id}/ratings`, { method: "POST", body: payload }),

  deleteRating: (id: string) => apiFetch<void>(`/locations/${id}/ratings`, { method: "DELETE" }),
};
