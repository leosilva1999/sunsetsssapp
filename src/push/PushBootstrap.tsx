import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router, usePathname } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

import { notificationsApi } from "../api/notifications";
import { useAuthStore } from "../stores/authStore";
import { resolveNotificationRoute } from "../lib/notificationTarget";
import type { NotificationType } from "../types/entities";
import { ensureAndroidChannel, isPushSupported } from "./permission";
import { registerDeviceIfPermitted } from "./registerDevice";

// `data` do push (docs/API.md, "What the phone receives"): só ids e rótulos, nada sensível.
interface PushData {
  notificationId?: string;
  type?: NotificationType;
  targetDescription?: string;
  link?: string | null;
}

// Com o app ABERTO o banner aparece, exceto dentro da própria tela de notificações (a lista já se
// atualiza sozinha). Variável de módulo: o handler do Expo é global e não enxerga o estado do React.
let suppressForeground = false;

if (isPushSupported()) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: !suppressForeground,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Liga tudo do push no app: canal Android, registro do aparelho (se a permissão já foi dada),
// atualização da lista ao receber, e o toque no push (abre a tela do alvo, inclusive com o app
// fechado). NUNCA pede permissão — isso é feito num toque do usuário (PushPermissionCard).
export function PushBootstrap() {
  const status = useAuthStore((s) => s.status);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const handled = useRef(new Set<string>());
  const pending = useRef<Notifications.NotificationResponse | null>(null);

  suppressForeground = pathname.startsWith("/notifications");

  // Canal Android + registro após o login / a cada abertura (com intervalo mínimo) e ao trocar o token.
  useEffect(() => {
    if (!isPushSupported()) return;
    void ensureAndroidChannel();
    const subscription = Notifications.addPushTokenListener(() => void registerDeviceIfPermitted({ force: true }));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (status === "signedIn") void registerDeviceIfPermitted();
  }, [status]);

  // Push recebido com o app aberto: atualiza contador e lista de notificações.
  useEffect(() => {
    if (!isPushSupported()) return;
    const subscription = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
    return () => subscription.remove();
  }, [queryClient]);

  // Toque no push. `useLastNotificationResponse` cobre app aberto, em segundo plano e frio.
  const lastResponse = Notifications.useLastNotificationResponse();

  const open = async (response: Notifications.NotificationResponse) => {
    const data = (response.notification.request.content.data ?? {}) as PushData;
    if (data.notificationId) {
      void notificationsApi.markRead(data.notificationId).catch(() => undefined);
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
    try {
      const href = data.type
        ? await resolveNotificationRoute({ type: data.type, targetDescription: data.targetDescription ?? "", link: data.link })
        : "/notifications";
      router.push(href as never);
    } catch {
      router.push("/notifications");
    }
  };

  useEffect(() => {
    if (!lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    if (handled.current.has(id)) return;
    // Ainda carregando a sessão / deslogado: guarda e abre depois do login.
    if (status !== "signedIn") {
      if (status === "signedOut") pending.current = lastResponse;
      return;
    }
    handled.current.add(id);
    void open(lastResponse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResponse, status]);

  useEffect(() => {
    if (status === "signedIn" && pending.current) {
      const response = pending.current;
      pending.current = null;
      // O efeito do `lastResponse` pode já ter aberto este mesmo push nesta passada.
      if (handled.current.has(response.notification.request.identifier)) return;
      handled.current.add(response.notification.request.identifier);
      void open(response);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return null;
}
