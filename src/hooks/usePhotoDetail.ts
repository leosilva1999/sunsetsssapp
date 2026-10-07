import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { photosApi } from "../api/photos";
import { commentsApi } from "../api/comments";
import type { Photo } from "../types/entities";

export function usePhoto(id: string) {
  return useQuery({ queryKey: ["photos", id], queryFn: () => photosApi.get(id) });
}

// Otimista no objeto único de `GET /photos/{id}` (diferente das listas — ver
// src/lib/photoLikeCache.ts, que cobre o shape de lista/página). Lê o estado atual (curtido ou
// não) direto do cache em vez de receber o objeto `Photo` por fora — assim o hook pode ser
// chamado incondicionalmente mesmo antes dos dados carregarem, sem precisar de um objeto fake.
export function useTogglePhotoLike(photoId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["photos", photoId] as const;

  return useMutation({
    mutationFn: () => {
      const current = queryClient.getQueryData<Photo>(queryKey);
      return current?.likedByCurrentUser ? photosApi.unlike(photoId) : photosApi.like(photoId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Photo>(queryKey);
      queryClient.setQueryData<Photo>(queryKey, (p) =>
        p
          ? { ...p, likedByCurrentUser: !p.likedByCurrentUser, likesCount: p.likesCount + (p.likedByCurrentUser ? -1 : 1) }
          : p
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });
}

export function useDeletePhoto() {
  return useMutation({ mutationFn: (photoId: string) => photosApi.delete(photoId) });
}

export function usePhotoComments(photoId: string) {
  return useInfiniteQuery({
    queryKey: ["photos", photoId, "comments"],
    queryFn: ({ pageParam }) => photosApi.getComments(photoId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}

// Carregadas sob demanda (toque em "Ver respostas"), não junto com a lista principal.
export function useCommentReplies(commentId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["comments", commentId, "replies"],
    queryFn: () => commentsApi.getReplies(commentId),
    enabled,
  });
}

export function useCreateComment(photoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { content: string; parentCommentId?: string | null }) =>
      photosApi.createComment(photoId, payload),
    onSuccess: (_comment, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["photos", photoId, "comments"] });
      if (variables.parentCommentId) {
        void queryClient.invalidateQueries({ queryKey: ["comments", variables.parentCommentId, "replies"] });
      }
    },
  });
}

export function useDeleteComment(photoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { commentId: string; parentCommentId?: string | null }) => commentsApi.delete(vars.commentId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["photos", photoId, "comments"] });
      if (variables.parentCommentId) {
        void queryClient.invalidateQueries({ queryKey: ["comments", variables.parentCommentId, "replies"] });
      }
    },
  });
}
