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
export async function resolveNotificationRoute(n: AppNotification): Promise<string> {
  const id = extractTargetId(n.targetDescription);
  switch (n.type) {
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
