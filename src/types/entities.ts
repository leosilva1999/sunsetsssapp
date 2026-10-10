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
}

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  avgRating: number;
  createdAt: string;
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

export type ReportTargetType = "Photo" | "Comment";
export type ReportStatus = "Pending" | "Resolved" | "Dismissed";
// Valores literais exigidos pela API (docs/API.md) — a UI mapeia pra rótulo em pt-BR na hora de
// exibir, não manda o rótulo traduzido pro backend.
export type ReportReason = "Spam" | "Inappropriate" | "Harassment" | "Other";

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
