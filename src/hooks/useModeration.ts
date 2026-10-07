import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moderationApi } from "../api/moderation";
import type { ReportStatus, UserRole } from "../types/entities";

export function useModerationReports(status: ReportStatus) {
  return useInfiniteQuery({
    queryKey: ["moderation", "reports", status],
    queryFn: ({ pageParam }) => moderationApi.getReports(status, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; status: "Resolved" | "Dismissed" }) =>
      moderationApi.updateReportStatus(vars.id, vars.status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["moderation", "reports"] });
      void queryClient.invalidateQueries({ queryKey: ["moderation", "actions"] });
    },
  });
}

export function useModerationActions() {
  return useInfiniteQuery({
    queryKey: ["moderation", "actions"],
    queryFn: ({ pageParam }) => moderationApi.getActions(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useUserSearch(q: string) {
  return useInfiniteQuery({
    queryKey: ["moderation", "users", q],
    queryFn: ({ pageParam }) => moderationApi.searchUsers(q, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; role: UserRole }) => moderationApi.updateUserRole(vars.id, vars.role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["moderation", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["moderation", "actions"] });
    },
  });
}
