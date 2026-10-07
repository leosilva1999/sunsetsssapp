import { apiFetch } from "./client";
import type { Report, ReportReason } from "../types/entities";

// 🔒🐌 10 req/60s por IP (mais apertado que busca — denunciar é ação deliberada e pouco
// frequente). Mesmo alvo duas vezes → 409 (seção Moderation).
export const moderationApi = {
  reportPhoto: (photoId: string, payload: { reason: ReportReason; details?: string }) =>
    apiFetch<Report>(`/photos/${photoId}/reports`, { method: "POST", body: payload }),

  reportComment: (commentId: string, payload: { reason: ReportReason; details?: string }) =>
    apiFetch<Report>(`/comments/${commentId}/reports`, { method: "POST", body: payload }),
};
