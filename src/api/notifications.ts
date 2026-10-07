import { apiFetch } from "./client";
import type { AppNotification, CursorPage } from "../types/entities";

// Tudo 🔒 — sempre "minhas notificações", sem {userId} na URL (seção Notifications).
export const notificationsApi = {
  list: (cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<AppNotification>>(`/notifications${qs}`);
  },

  unreadCount: () => apiFetch<{ count: number }>("/notifications/unread-count"),

  // Idempotente — marcar de novo uma já lida continua 204 (seção 5.11).
  markRead: (id: string) => apiFetch<void>(`/notifications/${id}/read`, { method: "POST" }),

  markAllRead: () => apiFetch<void>("/notifications/read-all", { method: "POST" }),
};
