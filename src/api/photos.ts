import { apiFetch } from "./client";
import type { CursorPage, Photo } from "../types/entities";
import type { PhotoSort } from "../types/api";

// Ver seções 5.2, 5.6 e 8.
export const photosApi = {
  list: (params: { sort: PhotoSort; cursor?: string | null }) => {
    const qs = new URLSearchParams({ sort: params.sort });
    if (params.cursor) qs.set("cursor", params.cursor);
    return apiFetch<CursorPage<Photo>>(`/photos?${qs.toString()}`, { auth: false });
  },

  count: () => apiFetch<{ count: number }>("/photos/count", { auth: false }),

  get: (id: string) => apiFetch<Photo>(`/photos/${id}`, { auth: false }),

  like: (id: string) => apiFetch<void>(`/photos/${id}/likes`, { method: "POST" }),
  unlike: (id: string) => apiFetch<void>(`/photos/${id}/likes`, { method: "DELETE" }),
};
