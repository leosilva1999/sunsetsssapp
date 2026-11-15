import { useInfiniteQuery } from "@tanstack/react-query";
import { photosApi } from "../api/photos";
import { useAuthStore } from "../stores/authStore";
import type { PhotosFeedTab } from "../types/api";

// Seção 5.6 — feed paginado por cursor, abas Recentes/Mais curtidas (`sort=recent|top`) e, pra quem
// está logado, "Seguindo" (`GET /photos/following`, que exige login).
export function usePhotosFeed(tab: PhotosFeedTab) {
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  return useInfiniteQuery({
    queryKey: ["photos", "feed", tab],
    queryFn: ({ pageParam }) =>
      tab === "following" ? photosApi.following({ cursor: pageParam }) : photosApi.list({ sort: tab, cursor: pageParam }),
    enabled: tab !== "following" || isSignedIn,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}
