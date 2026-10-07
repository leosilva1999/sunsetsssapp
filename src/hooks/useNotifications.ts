import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications";
import { useAuthStore } from "../stores/authStore";

const UNREAD_COUNT_POLL_MS = 45_000; // mesmo intervalo da web (seção 5.11) — sem push nativo por ora.

export function useUnreadCount() {
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: notificationsApi.unreadCount,
    enabled: isSignedIn,
    refetchInterval: UNREAD_COUNT_POLL_MS,
  });
}

export function useNotificationsList() {
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  return useInfiniteQuery({
    queryKey: ["notifications", "list"],
    queryFn: ({ pageParam }) => notificationsApi.list(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: isSignedIn,
  });
}

function invalidateNotifications(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["notifications"] });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}
