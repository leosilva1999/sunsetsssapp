import { apiFetch } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/api";

// Ver seção 4 e 8 de `web_app_docs/mobile-app-spec.md`.
export const authApi = {
  register: (payload: RegisterPayload) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: payload, auth: false }),

  login: (payload: LoginPayload) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: payload, auth: false }),

  // `idToken` vem do SDK nativo de Google Sign-In (ver seção 4 — substitui o GIS web).
  loginWithGoogle: (idToken: string) =>
    apiFetch<AuthResponse>("/auth/google", { method: "POST", body: { idToken }, auth: false }),

  // Sempre 204, independente de o e-mail existir — não diferenciar na UI (seção 5.1).
  forgotPassword: (email: string) =>
    apiFetch<void>("/auth/forgot-password", { method: "POST", body: { email }, auth: false }),

  resetPassword: (payload: { token: string; newPassword: string }) =>
    apiFetch<void>("/auth/reset-password", { method: "POST", body: payload, auth: false }),

  // Passa o refresh token (não o access token) — revoga a sessão no servidor.
  logout: (refreshToken: string) =>
    apiFetch<void>("/auth/logout", { method: "POST", body: { refreshToken } }),
};
