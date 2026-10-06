import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "../types/entities";

// Sessão (tokens + usuário) vai em expo-secure-store (Keychain/Keystore), nunca em
// AsyncStorage puro. Guardamos o objeto `user` devolvido por register/login/refresh em vez de
// decodificar o JWT no client — não há endpoint "/me" (docs/API.md, seção Authentication).
const ACCESS_TOKEN_KEY = "sunsetsss.accessToken";
const REFRESH_TOKEN_KEY = "sunsetsss.refreshToken";
const USER_KEY = "sunsetsss.user";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export async function getStoredSession(): Promise<StoredSession | null> {
  const [accessToken, refreshToken, userJson] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  if (!accessToken || !refreshToken || !userJson) return null;

  try {
    return { accessToken, refreshToken, user: JSON.parse(userJson) as AuthUser };
  } catch {
    return null;
  }
}

export async function setStoredSession(session: StoredSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function setStoredTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

export async function clearStoredSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
