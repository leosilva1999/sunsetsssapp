import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { citiesApi } from "../api/cities";
import { useDebouncedValue } from "./useDebouncedValue";
import type { LocationRankingPeriod } from "../types/api";

const MIN_SEARCH_CHARS = 2; // `q` com menos de 2 caracteres é 400 na API

// Índice de cidades da aba Explorar: sem busca, as cidades com locais (mais locais primeiro); com
// busca (debounce, ≥2 caracteres), por nome. Cancelável e sem retry — `q` conta no limite de buscas.
export function useCitiesList(text: string) {
  const term = useDebouncedValue(text.trim(), 400);
  const q = term.length >= MIN_SEARCH_CHARS ? term : "";
  return useInfiniteQuery({
    queryKey: ["cities", "list", q.toLowerCase()],
    queryFn: ({ pageParam, signal }) => citiesApi.list({ q: q || undefined, cursor: pageParam, signal }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    // Texto de 1 caractere não busca nada novo: continua mostrando a lista padrão.
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useCity(slug: string) {
  return useQuery({ queryKey: ["cities", "detail", slug], queryFn: () => citiesApi.get(slug), retry: false });
}

export function useCityLocations(slug: string) {
  return useInfiniteQuery({
    queryKey: ["cities", "detail", slug, "locations"],
    queryFn: ({ pageParam }) => citiesApi.getLocations(slug, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
  });
}

export function useCityPhotos(slug: string, enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ["cities", "detail", slug, "photos"],
    queryFn: ({ pageParam }) => citiesApi.getPhotos(slug, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled,
  });
}

// Falha (502) é esperada e só omite o bloco — mesmo tratamento do pôr do sol de um local.
export function useCitySunset(slug: string) {
  return useQuery({ queryKey: ["cities", "detail", slug, "sunset"], queryFn: () => citiesApi.getSunset(slug), retry: false });
}

export function useCitiesRanking(period: LocationRankingPeriod) {
  return useQuery({ queryKey: ["cities", "ranking", period], queryFn: () => citiesApi.ranking(period) });
}
