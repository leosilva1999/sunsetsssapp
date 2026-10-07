import { apiFetch } from "./client";
import type {
  AuthUser,
  CursorPage,
  ModerationAction,
  Report,
  ReportReason,
  ReportStatus,
  UserRole,
} from "../types/entities";

// Seção Moderation. 🛡️ = exige Moderator/Admin (algumas, Admin only — anotado em cada método).
export const moderationApi = {
  // 🔒🐌 10 req/60s por IP — denunciar é ação deliberada e pouco frequente. Mesmo alvo duas
  // vezes → 409.
  reportPhoto: (photoId: string, payload: { reason: ReportReason; details?: string }) =>
    apiFetch<Report>(`/photos/${photoId}/reports`, { method: "POST", body: payload }),

  reportComment: (commentId: string, payload: { reason: ReportReason; details?: string }) =>
    apiFetch<Report>(`/comments/${commentId}/reports`, { method: "POST", body: payload }),

  // 🛡️ Moderator ou Admin. `status` default `Pending` no servidor se omitido.
  getReports: (status: ReportStatus, cursor?: string | null) => {
    const qs = new URLSearchParams({ status });
    if (cursor) qs.set("cursor", cursor);
    return apiFetch<CursorPage<Report>>(`/moderation/reports?${qs.toString()}`);
  },

  // 🛡️ Moderator ou Admin. `status` só pode ser Resolved/Dismissed (Pending é só o estado
  // inicial, não algo que se define daqui pra frente — 400 caso contrário).
  updateReportStatus: (id: string, status: Extract<ReportStatus, "Resolved" | "Dismissed">) =>
    apiFetch<Report>(`/moderation/reports/${id}`, { method: "PATCH", body: { status } }),

  // 🛡️ Moderator ou Admin — log auditável, só leitura.
  getActions: (cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<ModerationAction>>(`/moderation/actions${qs}`);
  },

  // 🛡️ Admin only — existe só pra achar o id de um usuário antes de promovê-lo/rebaixá-lo
  // (não há busca/listagem pública de usuários). Devolve o shape "completo" (com email/role),
  // mesmo motivo do PATCH abaixo.
  searchUsers: (q: string, cursor?: string | null) => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (cursor) qs.set("cursor", cursor);
    return apiFetch<CursorPage<AuthUser>>(`/moderation/users?${qs.toString()}`);
  },

  // 🛡️ Admin only. Sem proteção contra rebaixar a si mesmo ou o último Admin — a API confia
  // no caller (seção Moderation). Resposta inclui email (diferente do GET /users/{id} público).
  updateUserRole: (id: string, role: UserRole) =>
    apiFetch<AuthUser>(`/moderation/users/${id}/role`, { method: "PATCH", body: { role } }),
};
