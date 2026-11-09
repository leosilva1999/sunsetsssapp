// Entidades do domínio Sunsetsss, espelhando `docs/API.md` do repositório `sunsetapi` (fonte
// canônica — `web_app_docs/mobile-app-spec.md` é só um resumo). Em caso de dúvida/divergência,
// a API manda.

export type UserRole = "User" | "Moderator" | "Admin";

// `PublicUserResponse` — `GET /users/{id}` e as listagens de seguidores/seguindo. Nunca traz
// `email` nem `role` (só a API.md confirma isso — não dá pra decidir UI de moderador a partir
// daqui, só a partir do `AuthUser` da própria sessão).
export interface User {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  isFollowedByCurrentUser: boolean;
  createdAt: string;
}

// Shape do campo `user` em register/login/google/refresh, e (assumido, mesma family de DTO)
// de `PATCH /users/me` — tem `email`/`role`, mas NÃO tem followersCount/followingCount/
// isFollowedByCurrentUser (esses só vêm de `User` acima). É o que fica em `authStore.user`.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  createdAt: string;
  /** false = conta criada pelo login com Google (sem senha). Ausente em sessões salvas antes do
   *  campo existir — trate só `=== false` como "sem senha". */
  hasPassword?: boolean;
}

// Valores literais da API (docs/API.md, "Locations"); a UI mapeia pra rótulo em pt-BR.
export type LocationCategory = "Beach" | "Viewpoint" | "Mountain" | "Lake" | "River" | "Urban" | "Other";

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  avgRating: number;
  createdAt: string;
  // Campos adicionados pela API depois (docs/API.md, "LocationResponse: city and counts") — todos
  // opcionais aqui porque nem toda tela/resposta antiga os carrega.
  slug?: string;
  /** Município do catálogo ao qual o local está ligado (null enquanto não ligado). */
  citySlug?: string | null;
  cityName?: string | null;
  state?: string | null;
  /** Localidade do catálogo (ex.: "Praia do Rosa"), quando escolhida. */
  localityName?: string | null;
  localitySlug?: string | null;
  ratingsCount?: number;
  photosCount?: number;
  coverImageUrl?: string | null;
  description?: string | null;
  category?: LocationCategory | null;
  // Só preenchido na busca "perto de mim" (GET /locations?lat=&lng=); null fora dela.
  distanceKm: number | null;
}

export interface Photo {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  locationId: string;
  locationName: string;
  city: string;
  imageUrl: string;
  caption: string | null;
  likesCount: number;
  likedByCurrentUser: boolean;
  commentsCount: number;
  createdAt: string;
  /** Tamanho da imagem como exibida, em px; null/ausente em fotos antigas (docs/API.md). */
  width?: number | null;
  height?: number | null;
}

export interface Comment {
  id: string;
  photoId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  content: string;
  parentCommentId: string | null; // 1 nível de profundidade só
  repliesCount: number;
  createdAt: string;
}

export interface Rating {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  score: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  createdAt: string;
}

export type ReportTargetType = "Photo" | "Comment" | "Location" | "User";
export type ReportStatus = "Pending" | "Resolved" | "Dismissed";
// Valores literais exigidos pela API (docs/API.md) — a UI mapeia pra rótulo em pt-BR na hora de
// exibir, não manda o rótulo traduzido pro backend.
// `IncorrectInfo` é pra locais ("o pino/nome/cidade está errado"); os demais valem pra tudo.
export type ReportReason = "Spam" | "Inappropriate" | "Harassment" | "Other" | "IncorrectInfo";

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  resolvedByUserId: string | null;
  resolvedAt: string | null;
}

export type ModerationActionType =
  | "PhotoDeleted"
  | "CommentDeleted"
  | "ReportResolved"
  | "ReportDismissed"
  | "LegalDocumentUpdated"
  | "UserRoleChanged";

export interface ModerationAction {
  id: string;
  moderatorId: string;
  moderatorName: string;
  actionType: ModerationActionType;
  // Label livre, não uma referência tipada: "Photo:{id}" / "Comment:{id}" / "User:{id}" /
  // "Report:{id}" / "{documentType}:v{version}" conforme actionType (docs/API.md).
  targetDescription: string;
  notes: string | null;
  createdAt: string;
}

export type NotificationType =
  | "NewFollower"
  | "PhotoLiked"
  | "PhotoCommented"
  | "CommentReplied";

export interface AppNotification {
  id: string;
  type: NotificationType;
  actorUserId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  targetDescription: string;
  readAt: string | null;
  createdAt: string;
}

export type LegalDocumentType = "TermsOfService" | "PrivacyPolicy";

// Aceite dos Termos/Política por usuário (docs/API.md, "Terms and Privacy acceptance"). Vem em toda
// resposta de register/login/google/refresh e em `GET /users/me/legal-acceptances`. `pending` =
// existe uma versão publicada que o usuário ainda não aceitou. `currentVersion: null` = documento
// nunca publicado (nunca fica pendente).
export interface LegalDocumentAcceptance {
  currentVersion: number | null;
  acceptedVersion: number | null;
  acceptedAt: string | null;
  pending: boolean;
}

export interface LegalAcceptance {
  terms: LegalDocumentAcceptance;
  privacy: LegalDocumentAcceptance;
  pending: boolean;
}

export interface LegalDocument {
  id: string;
  documentType: LegalDocumentType;
  content: string;
  version: number;
  createdAt: string;
}

// Paginação por cursor, usada em praticamente todas as listagens tipo feed.
// `nextCursor` é opaco — nunca parseie, só devolva como veio em `?cursor=`.
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// Catálogo de municípios/localidades (docs/API.md, "Cities"). Fonte de verdade de "que cidade é
// essa?" — o cadastro de local escolhe daqui em vez de texto livre.
export interface CityParent {
  id: string;
  name: string;
  state: string;
  slug: string;
}

export interface City {
  id: string;
  kind: "Municipality" | "Locality";
  name: string;
  country: string;
  state: string;
  slug: string;
  parent: CityParent | null;
  timeZoneId: string;
  population: number;
  latitude: number;
  longitude: number;
  locationsCount: number;
  photosCount: number;
  ratingsCount: number;
  avgRating: number | null;
  coverImageUrl: string | null;
}

/** Item de `GET /geo/cities` — lugar do catálogo mais próximo de um ponto do mapa. */
export interface NearestPlace {
  id: string;
  kind: "Municipality" | "Locality";
  name: string;
  state: string;
  slug: string;
  distanceKm: number;
  parent: CityParent | null;
}

export interface NearestCitiesResponse {
  items: NearestPlace[];
  /** Só vem quando se envia `cityId`: `farAway` = pino a mais de 150 km do centro (aviso, nunca bloqueio). */
  chosenCity?: { id: string; name: string; state: string; distanceKm: number; farAway: boolean } | null;
}

// `GET /cities/{slug}`: página completa da cidade (ou localidade) numa chamada só.
export interface CityDetail extends City {
  topLocation: { id: string; name: string; avgRating: number } | null;
  /** Localidades do município que têm locais (até 10, mais locais primeiro). Vazio numa localidade. */
  localities: { name: string; slug: string; locationsCount: number }[];
}

// `GET /cities/ranking`: `city` traz os números de sempre; o que ranqueia é a média do período.
export interface CityRankingItem {
  city: City;
  periodAvgRating: number;
  periodRatingsCount: number;
}
