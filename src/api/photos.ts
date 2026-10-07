import { apiFetch } from "./client";
import type { Comment, CursorPage, Photo } from "../types/entities";
import type { PhotoSort } from "../types/api";

// Ver seções 5.2, 5.6, 5.7 e 8.
export const photosApi = {
  list: (params: { sort: PhotoSort; cursor?: string | null }) => {
    const qs = new URLSearchParams({ sort: params.sort });
    if (params.cursor) qs.set("cursor", params.cursor);
    return apiFetch<CursorPage<Photo>>(`/photos?${qs.toString()}`, { auth: false });
  },

  count: () => apiFetch<{ count: number }>("/photos/count", { auth: false }),

  get: (id: string) => apiFetch<Photo>(`/photos/${id}`, { auth: false }),

  // Autor ou Moderator/Admin → 204; outro caller → 401 (não 403 — checagem antiga de "não é o
  // dono", seção 6 / gotcha #1).
  delete: (id: string) => apiFetch<void>(`/photos/${id}`, { method: "DELETE" }),

  like: (id: string) => apiFetch<void>(`/photos/${id}/likes`, { method: "POST" }),
  unlike: (id: string) => apiFetch<void>(`/photos/${id}/likes`, { method: "DELETE" }),

  // Raízes só (parentCommentId sempre null aqui), mais recentes primeiro.
  getComments: (id: string, cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<Comment>>(`/photos/${id}/comments${qs}`, { auth: false });
  },

  // `parentCommentId` omitido/null = comentário raiz; só pode referenciar uma RAIZ (responder a
  // uma resposta → 409). 200, não 201 (sem header Location) — docs/API.md.
  createComment: (id: string, payload: { content: string; parentCommentId?: string | null }) =>
    apiFetch<Comment>(`/photos/${id}/comments`, { method: "POST", body: payload }),
};
