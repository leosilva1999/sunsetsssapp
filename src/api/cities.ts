import { apiFetch } from "./client";
import type {
  City,
  CityDetail,
  CityRankingItem,
  CursorPage,
  Location,
  NearestCitiesResponse,
  Photo,
} from "../types/entities";
import type { LocationRankingPeriod, SunsetInfo } from "../types/api";

// docs/API.md, "Cities". Públicos; `q` e `/geo/cities` contam no limite de buscas (40/10s por IP)
// — por isso o chamador debouncea e cancela via `signal`. Respostas anônimas são cacheadas 60 s.
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

  // Índice "Cidades": por padrão só as que têm ao menos um local, mais locais primeiro. Com `q`
  // (≥2 caracteres) busca por nome/alternativo, incluindo localidades que já têm página.
  list: (params: { q?: string; cursor?: string | null; limit?: number; signal?: AbortSignal }) => {
    const qs = new URLSearchParams({ limit: String(params.limit ?? 20) });
    if (params.q) {
      qs.set("q", params.q);
      qs.set("kind", "any");
    }
    if (params.cursor) qs.set("cursor", params.cursor);
    return apiFetch<CursorPage<City>>(`/cities?${qs.toString()}`, { auth: false, signal: params.signal });
  },

  // Página completa da cidade (ou localidade) numa chamada só; 404 se não houver o que mostrar.
  get: (slug: string) => apiFetch<CityDetail>(`/cities/${slug}`, { auth: false }),

  getLocations: (slug: string, cursor?: string | null) => {
    const qs = new URLSearchParams({ sort: "rating" });
    if (cursor) qs.set("cursor", cursor);
    return apiFetch<CursorPage<Location>>(`/cities/${slug}/locations?${qs.toString()}`, { auth: false });
  },

  // Fotos de todos os locais da cidade numa lista só. `likedByCurrentUser` só é correto com o
  // token (o apiFetch já o envia quando existe).
  getPhotos: (slug: string, cursor?: string | null) => {
    const qs = new URLSearchParams({ sort: "top" });
    if (cursor) qs.set("cursor", cursor);
    return apiFetch<CursorPage<Photo>>(`/cities/${slug}/photos?${qs.toString()}`);
  },

  // Calculado pro centro da cidade; 502 se o serviço externo cair (a tela só omite o bloco).
  getSunset: (slug: string) => apiFetch<SunsetInfo>(`/cities/${slug}/sunset`, { auth: false }),

  // Municípios ranqueados pela média das notas recebidas no período. Array simples (não paginado).
  ranking: (period: LocationRankingPeriod, limit = 50) =>
    apiFetch<CityRankingItem[]>(`/cities/ranking?period=${period}&limit=${limit}`, { auth: false }),
};
