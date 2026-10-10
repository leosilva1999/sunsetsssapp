import { useInfiniteQuery } from "@tanstack/react-query";
import { locationsApi } from "../api/locations";

export interface NearbyParams {
  lat: number;
  lng: number;
  radius: number;
}

// Seção 5.3 / docs/API.md — busca paginada por cursor. `q` vazio ainda lista locais (sem
// filtro), então a tela de Explorar funciona como "navegar" quando o campo está em branco.
// Com `nearby`, vira "perto de mim" (ordenado por distância); lat/lng/radius entram na queryKey
// porque o nextCursor só vale pra mesma combinação — mudar qualquer um reinicia a paginação.
export function useLocationsSearch(q: string, nearby?: NearbyParams | null) {
  return useInfiniteQuery({
    queryKey: ["locations", "search", q, nearby?.lat ?? null, nearby?.lng ?? null, nearby?.radius ?? null],
    queryFn: ({ pageParam }) =>
      locationsApi.search({ q: q || undefined, ...(nearby ?? {}), cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}
