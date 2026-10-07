import { useMutation, useQueryClient } from "@tanstack/react-query";
import { photosApi } from "../api/photos";
import { uploadImageToUrl, inferImageContentType } from "../lib/uploadImage";

interface CreatePhotoInput {
  localUri: string;
  mimeType?: string | null;
  locationId: string;
  caption?: string | null;
}

// Orquestra os 3 passos da seção 5.8 como uma mutation só: pede a URL pré-assinada, faz o PUT,
// e só então cria o registro da foto com o `imageUrl` resultante.
export function useCreatePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ localUri, mimeType, locationId, caption }: CreatePhotoInput) => {
      const contentType = inferImageContentType(localUri, mimeType);
      const { uploadUrl, imageUrl } = await photosApi.requestUploadUrl(contentType);
      await uploadImageToUrl(localUri, uploadUrl, contentType);
      return photosApi.create({ locationId, imageUrl, caption });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
}
