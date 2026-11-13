import { apiFetch } from "./client";

export interface RegisterDevicePayload {
  /** `ExponentPushToken[...]` — token de push da Expo. */
  token: string;
  platform: "android" | "ios";
  /** UUID guardado por instalação do app: trocar o token do mesmo aparelho não duplica linha. */
  installId: string;
  appVersion?: string;
  locale?: string;
}

// docs/API.md, "Push notifications". 🔒 Os dois.
export const devicesApi = {
  // Registrar/atualizar o aparelho: idempotente (204); um token que já era de outra conta passa pra
  // esta; no máximo 5 aparelhos por usuário. Rate limit de 30 req / 15 min por IP.
  register: (payload: RegisterDevicePayload) =>
    apiFetch<void>("/users/me/devices", { method: "POST", body: payload }),

  // Remover o aparelho (por `installId`): idempotente. Precisa do Bearer, então vem ANTES do logout.
  unregister: (installId: string) =>
    apiFetch<void>("/users/me/devices", { method: "DELETE", body: { installId } }),
};
