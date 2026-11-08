import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { citiesApi } from "../api/cities";
import { useDebouncedValue } from "./useDebouncedValue";
import type { LatLng } from "../lib/geo";

const CITY_SEARCH_MIN_CHARS = 2; // a API devolve 400 (errors.Q) com menos de 2 caracteres

// Autocomplete de cidade (debounce + mínimo de 2 caracteres + cancelamento + cache; sem retry —
// mesmo cuidado com o limite de buscas das sugestões da Home).
export function useCitySearch(text: string) {
  const term = useDebouncedValue(text.trim(), 400);
  const query = useQuery({
    queryKey: ["cities", "search", term.toLowerCase()],
    queryFn: ({ signal }) => citiesApi.search({ q: term, signal }),
    enabled: term.length >= CITY_SEARCH_MIN_CHARS,
    staleTime: 60_000,
    retry: false,
    placeholderData: keepPreviousData,
  });
  const active = text.trim().length >= CITY_SEARCH_MIN_CHARS;
  return {
    cities: active && term.length >= CITY_SEARCH_MIN_CHARS ? (query.data?.items ?? []) : [],
    isSearching: active && (text.trim() !== term || query.isFetching),
    isError: query.isError,
  };
}

// Lugares mais próximos do pino (e, com `cityId`, o aviso "longe da cidade"). A chave é uma string
// com o ponto arredondado (~10 m) — um objeto novo a cada render reiniciaria o debounce sem fim.
export function useNearestCities(point: LatLng | null, cityId: string | null) {
  const key = point ? `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}` : null;
  const debouncedKey = useDebouncedValue(key, 500);
  return useQuery({
    queryKey: ["geo", "cities", debouncedKey, cityId],
    queryFn: ({ signal }) => {
      const [lat, lng] = debouncedKey!.split(",").map(Number);
      return citiesApi.nearest({ lat, lng, cityId, signal });
    },
    enabled: debouncedKey !== null,
    staleTime: 60_000,
    retry: false,
    placeholderData: keepPreviousData,
  });
}
