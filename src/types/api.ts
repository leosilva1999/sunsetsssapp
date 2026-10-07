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

// `POST /photos/upload-url` — padrão de upload em 2 passos (seção 5.8): pede a URL pré-assinada
// aqui, PUT os bytes direto nela, só então manda o `imageUrl` resultante pra `POST /photos`.
// `POST /users/me/avatar-upload-url` segue o mesmo padrão mas devolve `avatarUrl`, não
// `imageUrl` — shape própria quando formos implementar editar perfil.
export interface PhotoUploadUrlResponse {
  uploadUrl: string;
  imageUrl: string;
}

// `GET /locations/{id}/sunset` — live, via sunrise-sunset.org (seção Locations).
export interface SunsetInfo {
  date: string;
  tzId: string;
  utcOffset: string;
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLengthSeconds: number;
}
