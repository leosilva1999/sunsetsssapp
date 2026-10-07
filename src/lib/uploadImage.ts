// Upload em 2 passos (seção 5.8): a API só gera a URL pré-assinada — o PUT dos bytes vai direto
// pro storage (LocalStack em dev), sem passar pela nossa API nem levar header de auth.
export async function uploadImageToUrl(localUri: string, uploadUrl: string, contentType: string): Promise<void> {
  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  const putResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });

  if (!putResponse.ok) {
    throw new Error(`Falha ao enviar a imagem (status ${putResponse.status}).`);
  }
}

// A API só aceita esses dois (seção 5.8/Users) — `expo-image-picker` nem sempre devolve
// `mimeType`, então caímos pra extensão do arquivo como fallback.
export function inferImageContentType(uri: string, mimeType?: string | null): "image/jpeg" | "image/png" {
  if (mimeType === "image/png") return "image/png";
  if (mimeType === "image/jpeg") return "image/jpeg";
  return uri.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
}
