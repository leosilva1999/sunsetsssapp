import { apiFetch } from "./client";
import type { CursorPage, Location, Photo } from "../types/entities";
import type { LocationRankingPeriod } from "../types/api";

// Ver docs/API.md, seção Locations. Busca é FULLTEXT por prefixo de palavra com 3+ caracteres
// (não é substring — "osa" não casa com "Rosa"), substring simples com menos — debounce no
// client é obrigatório, o rate limit de 40 req/10s é só rede de segurança. Paginada por cursor,
// diferente do ranking abaixo.
export const locationsApi = {
  search: (params: { q?: string; lat?: number; lng?: number; radius?: number; cursor?: string | null; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set("q", params.q);
    if (params.lat !== undefined) qs.set("lat", String(params.lat));
    if (params.lng !== undefined) qs.set("lng", String(params.lng));
    if (params.radius !== undefined) qs.set("radius", String(params.radius));
    if (params.cursor) qs.set("cursor", params.cursor);
    if (params.limit !== undefined) qs.set("limit", String(params.limit));
    return apiFetch<CursorPage<Location>>(`/locations?${qs.toString()}`, { auth: false });
  },

  // Não paginado — array plano, capado por `limit` (default 20, clamp 1–50 no servidor).
  ranking: (period: LocationRankingPeriod, limit?: number) => {
    const qs = new URLSearchParams({ period });
    if (limit !== undefined) qs.set("limit", String(limit));
    return apiFetch<Location[]>(`/locations/ranking?${qs.toString()}`, { auth: false });
  },

  get: (id: string) => apiFetch<Location>(`/locations/${id}`, { auth: false }),

  // likedByCurrentUser vem sempre false aqui, independente do token — não resolvido pra esta
  // listagem (docs/API.md, gotcha #3).
  getPhotos: (id: string, cursor?: string | null) => {
    const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    return apiFetch<CursorPage<Photo>>(`/locations/${id}/photos${qs}`, { auth: false });
  },
};
