import { Platform } from "react-native";

// Camada de anúncios (AdMob) — DORMENTE até o lançamento. Nada aqui instala a biblioteca nativa nem
// declara App ID: enquanto `EXPO_PUBLIC_ADS_ENABLED` não for "true" (e a biblioteca não estiver no
// app), nenhum anúncio carrega e nenhum aviso de consentimento aparece. As variáveis são lidas com
// nome literal pra o Expo inlinar `EXPO_PUBLIC_*` no bundle.

/** Liga o SDK de anúncios (consentimento + carregamento). Padrão: desligado. */
export const ADS_ENABLED = process.env.EXPO_PUBLIC_ADS_ENABLED === "true";

/**
 * Prévia de layout: mostra espaços tracejados "Anúncio (prévia)" nas posições dos anúncios, SEM SDK
 * (serve pro Expo Go). Só pra avaliar como a tela fica — não carrega nada de rede.
 */
export const ADS_PREVIEW = process.env.EXPO_PUBLIC_ADS_PREVIEW === "true";

/** Um anúncio nativo a cada N fotos no feed da aba Fotos. */
export const FEED_AD_INTERVAL = 6;

const byPlatform = (android?: string, ios?: string) => (Platform.OS === "ios" ? ios : android) || undefined;

// IDs REAIS das unidades (AdMob → Apps → Unidades de anúncio). Em desenvolvimento usamos sempre os
// IDs de teste do Google (clicar em anúncio real durante o desenvolvimento pode suspender a conta).
export const REAL_UNIT_IDS = {
  banner: byPlatform(process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID, process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS),
  native: byPlatform(process.env.EXPO_PUBLIC_ADMOB_NATIVE_ANDROID, process.env.EXPO_PUBLIC_ADMOB_NATIVE_IOS),
};
