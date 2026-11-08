import { Share } from "react-native";

// URLs públicas do site (mesmos caminhos do sunsetweb): `/locations/{slug}`, `/photos/{id}`,
// `/profile/{id}`, `/cidades/{slug}`, `/ranking`. A base pode ser trocada por `.env`.
const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? "https://sunsetsss.com").replace(/\/+$/, "");

export const siteLinks = {
  location: (slugOrId: string) => `${SITE_URL}/locations/${slugOrId}`,
  photo: (id: string) => `${SITE_URL}/photos/${id}`,
  profile: (id: string) => `${SITE_URL}/profile/${id}`,
  city: (slug: string) => `${SITE_URL}/cidades/${slug}`,
  ranking: () => `${SITE_URL}/ranking`,
};

// Folha de compartilhamento nativa. No Android só o `message` vai (a URL entra no texto); no iOS
// o `url` também é enviado à parte. Cancelar não é erro.
export async function shareLink(message: string, url: string): Promise<void> {
  try {
    await Share.share({ message: `${message}\n${url}`, url });
  } catch {
    // Sem app de compartilhamento disponível / falha nativa: nada útil a mostrar.
  }
}
