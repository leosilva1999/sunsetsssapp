import type { QueryClient } from "@tanstack/react-query";
import type { CursorPage, Photo } from "../types/entities";

function toggleInPage(page: CursorPage<Photo>, photoId: string): CursorPage<Photo> {
  return {
    ...page,
    items: page.items.map((p) =>
      p.id === photoId
        ? { ...p, likedByCurrentUser: !p.likedByCurrentUser, likesCount: p.likesCount + (p.likedByCurrentUser ? -1 : 1) }
        : p
    ),
  };
}

// Curtir é otimista em todo canto onde uma foto aparece em lista (seção 5.6). O cache de uma
// `useQuery` normal guarda `{ items, nextCursor, hasMore }`; o de uma `useInfiniteQuery` guarda
// `{ pages: [...esse mesmo shape], pageParams }` — essa função decide qual é qual.
export function togglePhotoLikeInCache(queryClient: QueryClient, queryKey: readonly unknown[], photoId: string) {
  queryClient.setQueryData(queryKey, (data: unknown) => {
    if (!data || typeof data !== "object") return data;
    if (Array.isArray((data as { pages?: unknown }).pages)) {
      const infinite = data as { pages: CursorPage<Photo>[] };
      return { ...infinite, pages: infinite.pages.map((page) => toggleInPage(page, photoId)) };
    }
    if (Array.isArray((data as { items?: unknown }).items)) {
      return toggleInPage(data as CursorPage<Photo>, photoId);
    }
    return data;
  });
}
