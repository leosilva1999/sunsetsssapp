import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import type { User } from "../types/entities";

export function useUserProfile(id: string | undefined) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => usersApi.get(id!),
    enabled: !!id,
  });
}

export function useUserPhotos(id: string | undefined) {
  return useInfiniteQuery({
    queryKey: ["users", id, "photos"],
    queryFn: ({ pageParam }) => usersApi.getPhotos(id!, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!id,
  });
}

export function useFollowers(id: string) {
  return useInfiniteQuery({
    queryKey: ["users", id, "followers"],
    queryFn: ({ pageParam }) => usersApi.getFollowers(id, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useFollowing(id: string) {
  return useInfiniteQuery({
    queryKey: ["users", id, "following"],
    queryFn: ({ pageParam }) => usersApi.getFollowing(id, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}

// Seguir/deixar de seguir é idempotente no servidor (seção 6) — aqui é só otimista no cache de
// `GET /users/{id}` (o único lugar onde `isFollowedByCurrentUser` vem resolvido de verdade,
// gotcha #3 da API).
export function useToggleFollow(userId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["users", userId] as const;

  const setFollowed = (followed: boolean) => {
    queryClient.setQueryData<User>(queryKey, (user) =>
      user
        ? {
            ...user,
            isFollowedByCurrentUser: followed,
            followersCount: user.followersCount + (followed ? 1 : -1),
          }
        : user
    );
  };

  return useMutation({
    mutationFn: (follow: boolean) => (follow ? usersApi.follow(userId) : usersApi.unfollow(userId)),
    onMutate: async (follow) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<User>(queryKey);
      setFollowed(follow);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });
}
