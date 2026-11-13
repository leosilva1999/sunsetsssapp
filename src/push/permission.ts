import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export type PushPermission = "granted" | "denied" | "undetermined" | "unsupported";

// Push só em aparelho físico (iOS/Android). Web e emulador ficam "unsupported".
export const isPushSupported = () => Platform.OS !== "web" && Device.isDevice;

// Canal padrão do Android (a API manda `channelId: "default"`). Precisa existir ANTES de pedir a
// permissão — no Android 13+ o diálogo só aparece depois de haver um canal.
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Notificações",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#c84008",
  });
}

export async function getPushPermission(): Promise<{ status: PushPermission; canAskAgain: boolean }> {
  if (!isPushSupported()) return { status: "unsupported", canAskAgain: false };
  const result = await Notifications.getPermissionsAsync();
  return { status: result.granted ? "granted" : result.canAskAgain ? "undetermined" : "denied", canAskAgain: result.canAskAgain };
}

// Abre o diálogo do sistema. Só chamar a partir de um toque do usuário ("Ativar notificações").
export async function requestPushPermission(): Promise<PushPermission> {
  if (!isPushSupported()) return "unsupported";
  await ensureAndroidChannel();
  const result = await Notifications.requestPermissionsAsync();
  return result.granted ? "granted" : "denied";
}
