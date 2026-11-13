import { commentsApi } from "../api/comments";
import type { AppNotification, NotificationType } from "../types/entities";

// Só o texto depois do nome do autor — quem renderiza decide como destacar o nome (seção 5.11).
export function getNotificationMessageSuffix(type: NotificationType): string {
  switch (type) {
    case "NewFollower":
      return "começou a seguir você";
    case "PhotoLiked":
      return "curtiu sua foto";
    case "PhotoCommented":
      return "comentou na sua foto";
    case "CommentReplied":
      return "respondeu seu comentário";
    case "Announcement":
      return ""; // aviso da equipe: quem renderiza usa `title`/`body`, não este sufixo
  }
}

// Destino de um aviso da equipe (`link`): só `Location:{id}`, `City:{slug}`, `Photo:{id}` ou
// `User:{id}` (docs/API.md, "Announcements") — nunca uma URL. Desconhecido/ausente = null.
function routeForLink(link: string | null | undefined): string | null {
  if (!link) return null;
  const separator = link.indexOf(":");
  if (separator < 0) return null;
  const kind = link.slice(0, separator);
  const value = link.slice(separator + 1);
  if (!value) return null;
  switch (kind) {
    case "Location":
      return `/locations/${value}`;
    case "City":
      return `/cities/${value}`;
    case "Photo":
      return `/photos/${value}`;
    case "User":
      return `/profile/${value}`;
    default:
      return null;
  }
}

// `targetDescription` é um label livre por convenção, "Tipo:{id}", não uma referência tipada
// (seção 5.11 / docs/API.md).
function extractTargetId(targetDescription: string): string {
  const [, id] = targetDescription.split(":");
  return id ?? targetDescription;
}

// CommentReplied só dá o id do comentário no targetDescription — precisa buscar o comentário
// pra achar o photoId antes de navegar (seção 5.11).
export async function resolveNotificationRoute(
  n: Pick<AppNotification, "type" | "targetDescription"> & Partial<Pick<AppNotification, "link">>
): Promise<string> {
  const id = extractTargetId(n.targetDescription);
  switch (n.type) {
    case "Announcement":
      // Sem `link` abre só a lista de notificações.
      return routeForLink(n.link) ?? "/notifications";
    case "NewFollower":
      return `/profile/${id}`;
    case "PhotoLiked":
    case "PhotoCommented":
      return `/photos/${id}`;
    case "CommentReplied": {
      const comment = await commentsApi.get(id);
      return `/photos/${comment.photoId}`;
    }
  }
}
