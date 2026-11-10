import { create } from "zustand";

import { useAuthStore } from "../stores/authStore";
import { ADS_ENABLED, ADS_PREVIEW } from "./config";
import { loadAdsSdk } from "./sdk";

// `ready` = SDK inicializado depois do consentimento (ver AdsBootstrap).
export const useAdsStore = create<{ ready: boolean; setReady: (ready: boolean) => void }>((set) => ({
  ready: false,
  setReady: (ready) => set({ ready }),
}));

export type AdSlotMode = "real" | "preview" | "off";

// O que cada espaço de anúncio deve renderizar:
//  - "real": SDK ligado, presente e inicializado (consentimento resolvido) → anúncio de verdade;
//  - "preview": só o espaço tracejado (layout), quando `EXPO_PUBLIC_ADS_PREVIEW` está ligado;
//  - "off": nada (padrão — o layout fica exatamente como sem anúncios).
// Moderadores e administradores nunca veem anúncios (nem a prévia).
export function useAdSlot(): AdSlotMode {
  const ready = useAdsStore((s) => s.ready);
  const role = useAuthStore((s) => s.user?.role);
  if (role === "Moderator" || role === "Admin") return "off";
  if (ADS_ENABLED && ready && loadAdsSdk()) return "real";
  if (ADS_PREVIEW) return "preview";
  return "off";
}
