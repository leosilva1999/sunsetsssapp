import { ApiError } from "../api/client";
import { getErrorMessage } from "./errorMessage";
import { GOOGLE_WEB_CLIENT_ID } from "./env";

// Google Sign-In nativo: devolve o ID token que o backend (POST /auth/google) valida contra o
// `GoogleAuth:ClientId` — por isso configuramos o *web* client ID, não o client Android.
//
// A lib faz `TurboModuleRegistry.getEnforcing` ao ser importada, o que derruba o app inteiro no
// Expo Go (sem o módulo nativo). Então o `require` é preguiçoso, só no toque do botão, e a falta
// do módulo vira uma mensagem amigável em vez de crash.
export const GOOGLE_SIGN_IN_CANCELLED = "GOOGLE_SIGN_IN_CANCELLED";

export async function getGoogleIdToken(): Promise<string> {
  if (!GOOGLE_WEB_CLIENT_ID) {
    throw new Error("Login com Google não configurado (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).");
  }

  let google: typeof import("@react-native-google-signin/google-signin");
  try {
    google = require("@react-native-google-signin/google-signin");
  } catch {
    throw new Error("Login com Google precisa do app de desenvolvimento (build nativo) — não funciona no Expo Go.");
  }

  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = google;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });

  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response) || !response.data.idToken) {
      throw new Error(GOOGLE_SIGN_IN_CANCELLED);
    }
    return response.data.idToken;
  } catch (error) {
    if (error instanceof Error && error.message === GOOGLE_SIGN_IN_CANCELLED) throw error;
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) throw new Error(GOOGLE_SIGN_IN_CANCELLED);
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services não está disponível neste aparelho.");
      }
    }
    throw new Error("Não foi possível entrar com o Google. Tente de novo.");
  }
}

// Mensagem pra exibir num Alert, ou `null` quando o usuário só cancelou o seletor de contas.
export function googleErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) return getErrorMessage(error, "Tente de novo.");
  if (!(error instanceof Error)) return "Tente de novo.";
  return error.message === GOOGLE_SIGN_IN_CANCELLED ? null : error.message;
}
