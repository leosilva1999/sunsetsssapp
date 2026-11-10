import { useEffect } from "react";

import { useAuthStore } from "../stores/authStore";
import { ADS_ENABLED } from "./config";
import { loadAdsSdk } from "./sdk";
import { useAdsStore } from "./useAdSlot";

let started = false;

// Inicialização do SDK de anúncios: só roda com `ADS_ENABLED`, com a biblioteca presente e DEPOIS da
// tela de aceite dos Termos/Política (se houver uma pendente, espera). Primeiro o consentimento
// (UMP — LGPD/GDPR), depois `initialize()`. Qualquer falha deixa os anúncios desligados.
export function AdsBootstrap() {
  const status = useAuthStore((s) => s.status);
  const legalPending = useAuthStore((s) => s.legalAcceptance?.pending === true);
  const setReady = useAdsStore((s) => s.setReady);

  useEffect(() => {
    if (!ADS_ENABLED || started || status === "bootstrapping" || legalPending) return;
    const sdk = loadAdsSdk();
    if (!sdk) return;
    started = true;

    void (async () => {
      try {
        const info = await sdk.AdsConsent?.gatherConsent?.();
        // `canRequestAds` falso = a pessoa recusou/consentimento indisponível: não carrega anúncio.
        if (info && info.canRequestAds === false) return;
        await sdk.default().initialize();
        setReady(true);
      } catch {
        started = false;
      }
    })();
  }, [status, legalPending, setReady]);

  return null;
}
