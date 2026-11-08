import { useQuery } from "@tanstack/react-query";
import { locationsApi } from "../api/locations";
import type { LocationRankingPeriod } from "../types/api";

// Seção 5.5 — não paginado, array simples capado por `limit` (docs/API.md, clamp 1–50).
export function useLocationsRanking(period: LocationRankingPeriod, state?: string | null) {
  return useQuery({
    queryKey: ["locations", "ranking", period, state ?? null],
    queryFn: () => locationsApi.ranking(period, 50, state ? { state } : undefined),
  });
}
