import { useCallback, useEffect, useState } from "react";
import { AppState, Linking } from "react-native";

import { getPushPermission, requestPushPermission, type PushPermission } from "./permission";
import { registerDeviceIfPermitted } from "./registerDevice";

// Estado da permissão de notificações do sistema + as ações do usuário: pedir (diálogo do sistema,
// só num toque) e abrir os ajustes do app (depois de negar). Relê o estado ao voltar do segundo
// plano — a pessoa pode ter ligado nos ajustes. Ao conceder, já registra o aparelho na API.
export function usePushPermission() {
  const [status, setStatus] = useState<PushPermission | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus((await getPushPermission()).status);
    } catch {
      setStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const request = useCallback(async () => {
    const result = await requestPushPermission();
    setStatus(result);
    if (result === "granted") await registerDeviceIfPermitted({ force: true });
  }, []);

  const openSettings = useCallback(() => void Linking.openSettings(), []);

  return { status, request, openSettings };
}
