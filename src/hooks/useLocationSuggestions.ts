import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ApiError } from "../api/client";
import { locationsApi } from "../api/locations";
import { useDebouncedValue } from "./useDebouncedValue";

export const SUGGESTIONS_MIN_CHARS = 3;
const SUGGESTIONS_LIMIT = 5;
const DEBOUNCE_MS = 400;
// `Retry-After` da API é 10s (docs/API.md, rate limit de GET /locations: 40 req/10s por IP).
const RATE_LIMIT_PAUSE_MS = 10_000;

export type SuggestionsError = "rateLimited" | "failed" | null;

// Sugestões instantâneas da Home. Proteções pro banco, em camadas:
//  - 3+ caracteres: abaixo disso o backend cai de FULLTEXT (índice) pra `LIKE '%q%'` (varredura);
//  - debounce — só busca quando a pessoa para de digitar;
//  - a requisição anterior é cancelada (AbortSignal do React Query) se a chave mudar;
//  - cache de 60s por termo (digitar de novo o mesmo texto não vai ao servidor);
//  - `limit=5`, sem paginação, sem retentativa automática;
//  - um 429 desliga as sugestões por 10s em vez de insistir (o botão "Buscar" segue funcionando).
export function useLocationSuggestions(text: string, enabled: boolean) {
  const trimmed = text.trim();
  const term = useDebouncedValue(trimmed, DEBOUNCE_MS);
  const [rateLimitedPause, setRateLimitedPause] = useState(false);

  const query = useQuery({
    queryKey: ["locations", "suggest", term.toLowerCase()],
    queryFn: ({ signal }) => locationsApi.search({ q: term, limit: SUGGESTIONS_LIMIT, signal }),
    enabled: enabled && term.length >= SUGGESTIONS_MIN_CHARS && !rateLimitedPause,
    staleTime: 60_000,
    retry: false,
    placeholderData: keepPreviousData,
  });

  const isRateLimited = query.error instanceof ApiError && query.error.status === 429;
  useEffect(() => {
    if (!isRateLimited) return;
    setRateLimitedPause(true);
    const timeout = setTimeout(() => setRateLimitedPause(false), RATE_LIMIT_PAUSE_MS);
    return () => clearTimeout(timeout);
  }, [isRateLimited, query.errorUpdatedAt]);

  const longEnough = trimmed.length >= SUGGESTIONS_MIN_CHARS;
  const error: SuggestionsError = !query.isError ? null : isRateLimited ? "rateLimited" : "failed";

  return {
    /** o dropdown só faz sentido a partir de 3 caracteres. */
    visible: longEnough,
    // Com `term` ainda < 3 (debounce pendente) o `data` em cache é de um termo antigo — não mostra.
    locations: term.length >= SUGGESTIONS_MIN_CHARS ? (query.data?.items ?? []) : [],
    // Debounce pendente ou requisição em voo.
    isSearching: longEnough && !error && (trimmed !== term || query.isFetching),
    error,
  };
}
