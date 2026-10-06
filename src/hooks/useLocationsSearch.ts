import { useInfiniteQuery } from "@tanstack/react-query";
import { locationsApi } from "../api/locations";

// Seção 5.3 / docs/API.md — busca paginada por cursor. `q` vazio ainda lista locais (sem
// filtro), então a tela de Explorar funciona como "navegar" quando o campo está em branco.
export function useLocationsSearch(q: string) {
  return useInfiniteQuery({
    queryKey: ["locations", "search", q],
    queryFn: ({ pageParam }) => locationsApi.search({ q: q || undefined, cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}
