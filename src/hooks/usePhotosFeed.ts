import { useInfiniteQuery } from "@tanstack/react-query";
import { photosApi } from "../api/photos";
import type { PhotoSort } from "../types/api";

// Seção 5.6 — feed paginado por cursor, abas Recentes/Mais curtidas (`sort=recent|top`).
export function usePhotosFeed(sort: PhotoSort) {
  return useInfiniteQuery({
    queryKey: ["photos", "feed", sort],
    queryFn: ({ pageParam }) => photosApi.list({ sort, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}
