import { useQuery } from "@tanstack/react-query";
import { locationsApi } from "../api/locations";
import type { LocationRankingPeriod } from "../types/api";

// Seção 5.5 — não paginado, array simples capado por `limit` (docs/API.md, clamp 1–50).
export function useLocationsRanking(period: LocationRankingPeriod) {
  return useQuery({
    queryKey: ["locations", "ranking", period],
    queryFn: () => locationsApi.ranking(period, 50),
  });
}
