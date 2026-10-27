import { apiFetch } from "./client";
import { useAuthStore } from "../stores/authStore";
import type { AuthUser, CursorPage, Photo, User } from "../types/entities";
import type { AvatarUploadUrlResponse } from "../types/api";

// Ver docs/API.md, seção Users. `GET /users/{id}` é público mas lê o bearer se presente pra
// resolver `isFollowedByCurrentUser` — client.ts já anexa o token automaticamente quando existe.
export const usersApi = {
  get: (id: string) => apiFetch<User>(`/users/${id}`, { auth: false }),

  follow: (id: string) => apiFetch<void>(`/users/${id}/follow`, { method: "POST" }),
  unfollow: (id: string) => apiFetch<void>(`/users/${id}/follow`, { method: "DELETE" }),

  getFollowers: (id: string, cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<User>>(`/users/${id}/followers${qs}`, { auth: false });
  },

  getFollowing: (id: string, cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<User>>(`/users/${id}/following${qs}`, { auth: false });
  },

  // likedByCurrentUser sempre false aqui, independente do token (gotcha #3 — igual
  // `locationsApi.getPhotos`).
  getPhotos: (id: string, cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<Photo>>(`/users/${id}/photos${qs}`, { auth: false });
  },

  // Partial update de verdade (JSON Merge Patch — seção Users): só os campos presentes no body
  // são tocados. Omitir = mantém, `null` = limpa (só avatarUrl/bio — name não pode ser null),
  // valor = substitui. O caller decide o que entra no objeto, não essa função.
  updateMe: (payload: { name?: string; avatarUrl?: string | null; bio?: string | null }) =>
    apiFetch<AuthUser>("/users/me", { method: "PATCH", body: payload }),

  // `PUT /users/me/password` → 204. O servidor revoga todos os refresh tokens do usuário EXCETO o
  // enviado em `refreshToken` — sem ele (ou com um inativo) derruba até esta sessão. Por isso o
  // corpo é uma função: lê o refresh token vigente a cada tentativa (um 401 → refresh+retry gira
  // o token, e o antigo seria tratado como inativo).
  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    apiFetch<void>("/users/me/password", {
      method: "PUT",
      body: () => ({ ...payload, refreshToken: useAuthStore.getState().refreshToken ?? undefined }),
    }),

  // Mesmo padrão de upload em 2 passos das fotos (seção 5.8) — devolve `avatarUrl`, não
  // `imageUrl`. `avatarUrl` só é aceito por `updateMe` se vier exatamente desta resposta (tem
  // que apontar pro nosso bucket).
  requestAvatarUploadUrl: (contentType: "image/jpeg" | "image/png") =>
    apiFetch<AvatarUploadUrlResponse>("/users/me/avatar-upload-url", { method: "POST", body: { contentType } }),
};
