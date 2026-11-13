import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

import { devicesApi } from "../api/devices";
import { getInstallId } from "./installId";
import { ensureAndroidChannel, getPushPermission, isPushSupported } from "./permission";

const MIN_INTERVAL_MS = 30 * 60_000; // a API limita o registro a 30 req / 15 min por IP
let lastRegisteredAt = 0;

// Registra (ou renova) o aparelho na API — SÓ se a permissão já foi concedida: nunca pede nada aqui.
// Chamado após o login, a cada abertura do app (com intervalo mínimo), ao conceder a permissão e
// quando o token muda. Qualquer falha (sem rede, sem Firebase configurado, token indisponível) é
// silenciosa: push é um extra, não pode atrapalhar o app.
export async function registerDeviceIfPermitted({ force = false }: { force?: boolean } = {}): Promise<void> {
  if (!isPushSupported()) return;
  if (!force && Date.now() - lastRegisteredAt < MIN_INTERVAL_MS) return;

  try {
    const { status } = await getPushPermission();
    if (status !== "granted") return;
    await ensureAndroidChannel();

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);

    await devicesApi.register({
      token,
      platform: Platform.OS === "ios" ? "ios" : "android",
      installId: await getInstallId(),
      appVersion: Constants.expoConfig?.version,
      locale: "pt-BR",
    });
    lastRegisteredAt = Date.now();
  } catch {
    // ignora — tenta de novo na próxima abertura
  }
}

// Remove o aparelho da conta atual. Precisa do Bearer: chamar ANTES de encerrar a sessão (logout).
// Falhar não pode impedir o logout (sem rede, por exemplo): o servidor também limpa tokens mortos.
export async function unregisterDevice(): Promise<void> {
  if (!isPushSupported()) return;
  try {
    await devicesApi.unregister(await getInstallId());
  } catch {
    // ignora
  } finally {
    lastRegisteredAt = 0;
  }
}
