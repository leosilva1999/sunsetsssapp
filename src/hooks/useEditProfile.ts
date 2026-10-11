import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import { useAuthStore } from "../stores/authStore";
import { uploadImageToUrl, inferImageContentType } from "../lib/uploadImage";

interface SaveProfileInput {
  /** Omitido = não mexe no nome. */
  name?: string;
  /** Omitido = não mexe na bio; `null` = limpa; string = substitui. */
  bio?: string | null;
  /** Presente = troca o avatar (sobe a imagem primeiro, só então faz o PATCH). */
  avatarLocalUri?: string;
  avatarMimeType?: string | null;
}

// Mesmo padrão de upload em 2 passos das fotos (seção 5.8), seguido de um único
// `PATCH /users/me` com todos os campos que de fato mudaram — omitir os outros é o que faz o
// partial update funcionar (seção Users).
export function useSaveProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveProfileInput) => {
      const payload: { name?: string; bio?: string | null; avatarUrl?: string } = {};
      if (input.name !== undefined) payload.name = input.name;
      if (input.bio !== undefined) payload.bio = input.bio;

      if (input.avatarLocalUri) {
        const contentType = inferImageContentType(input.avatarLocalUri, input.avatarMimeType);
        const { uploadUrl, avatarUrl } = await usersApi.requestAvatarUploadUrl(contentType);
        await uploadImageToUrl(input.avatarLocalUri, uploadUrl, contentType);
        payload.avatarUrl = avatarUrl;
      }

      return usersApi.updateMe(payload);
    },
    onSuccess: (user) => {
      setUser(user);
      // O perfil exibido vem de GET /users/{id} (cache próprio), não do authStore.
      void queryClient.invalidateQueries({ queryKey: ["users", user.id] });
    },
  });
}
