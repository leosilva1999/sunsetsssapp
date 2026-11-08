import { apiFetch } from "./client";
import type { City, CursorPage, NearestCitiesResponse } from "../types/entities";

// docs/API.md, "Cities". Públicos; `q` e `/geo/cities` contam no limite de buscas (40/10s por IP)
// — por isso o chamador debouncea e cancela via `signal`.
export const citiesApi = {
  // Autocomplete do cadastro de local: catálogo inteiro (municípios + localidades), mais populosos
  // primeiro — `kind=any&includeEmpty=true&sort=population` é exigido pela API pra isso.
  search: (params: { q: string; limit?: number; signal?: AbortSignal }) => {
    const qs = new URLSearchParams({
      q: params.q,
      kind: "any",
      includeEmpty: "true",
      sort: "population",
      limit: String(params.limit ?? 8),
    });
    return apiFetch<CursorPage<City>>(`/cities?${qs.toString()}`, { auth: false, signal: params.signal });
  },

  // Lugares do catálogo mais perto de um ponto (sugestão de cidade ao marcar o pino). Com
  // `cityId` devolve também `chosenCity.farAway` (pino a >150 km da cidade escolhida).
  nearest: (params: { lat: number; lng: number; limit?: number; cityId?: string | null; signal?: AbortSignal }) => {
    const qs = new URLSearchParams({ lat: String(params.lat), lng: String(params.lng), limit: String(params.limit ?? 3) });
    if (params.cityId) qs.set("cityId", params.cityId);
    return apiFetch<NearestCitiesResponse>(`/geo/cities?${qs.toString()}`, { auth: false, signal: params.signal });
  },
};
