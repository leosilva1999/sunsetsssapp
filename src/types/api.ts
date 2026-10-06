import type { AuthUser } from "./entities";

// DTOs de request/response que não mapeiam 1:1 pras entidades — conferidos contra
// `docs/API.md` do repositório `sunsetapi` (seção Auth).
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type LocationRankingPeriod = "week" | "month" | "all";
// `sort=recent|top` na API (não "mostLiked") — ver docs/API.md, seção Photos.
export type PhotoSort = "recent" | "top";
