import { apiFetch } from "./client";
import type { CursorPage, User } from "../types/entities";

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
};
