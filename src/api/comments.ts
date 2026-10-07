import { apiFetch } from "./client";
import type { Comment, CursorPage } from "../types/entities";

// `/comments/{id}` é top-level, não aninhado sob `/photos/{id}/comments/{id}` (docs/API.md).
export const commentsApi = {
  get: (id: string) => apiFetch<Comment>(`/comments/${id}`, { auth: false }),

  // Respostas diretas da raiz `id`, mais antigas primeiro (ordem cronológica de conversa —
  // oposto da listagem principal). `id` precisa ser uma raiz; se for resposta ou não existir,
  // 404 nos dois casos (seção Photos).
  getReplies: (id: string, cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<Comment>>(`/comments/${id}/replies${qs}`, { auth: false });
  },

  // Autor ou Moderator/Admin → 204; outro → 401. Excluir uma raiz com repliesCount > 0 leva as
  // respostas junto em cascata — avisar antes (seção 5.7).
  delete: (id: string) => apiFetch<void>(`/comments/${id}`, { method: "DELETE" }),
};
