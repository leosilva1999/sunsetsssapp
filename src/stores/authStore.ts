import { create } from "zustand";
import type { AuthUser, LegalAcceptance } from "../types/entities";
import {
  clearStoredSession,
  setStoredSession,
  setStoredTokens,
  type StoredSession,
} from "../lib/secureStorage";

export type AuthStatus = "bootstrapping" | "signedOut" | "signedIn";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** Estado de aceite dos Termos/Política (não persistido — vem do servidor a cada login/refresh). */
  legalAcceptance: LegalAcceptance | null;
  setLegalAcceptance: (acceptance: LegalAcceptance | null) => void;
  /** Chamado uma vez na raiz do app após ler a sessão persistida (ou não encontrar nenhuma). */
  hydrate: (session: StoredSession | null) => void;
  /** Login, cadastro ou login via Google bem-sucedidos. */
  setSession: (session: StoredSession) => void;
  /** Usuário atualizou o próprio perfil (nome/avatar/bio) via `PATCH /users/me`. */
  setUser: (user: AuthUser) => void;
  /** Rotação de tokens via `POST /auth/refresh`. */
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "bootstrapping",
  user: null,
  accessToken: null,
  refreshToken: null,
  legalAcceptance: null,

  setLegalAcceptance: (legalAcceptance) => set({ legalAcceptance }),

  hydrate: (session) => {
    if (session) {
      set({ ...session, status: "signedIn" });
    } else {
      set({ user: null, accessToken: null, refreshToken: null, status: "signedOut" });
    }
  },

  setSession: (session) => {
    set({ ...session, status: "signedIn" });
    void setStoredSession(session);
  },

  setUser: (user) => {
    set({ user });
    const { accessToken, refreshToken } = get();
    if (accessToken && refreshToken) {
      void setStoredSession({ accessToken, refreshToken, user });
    }
  },

  setTokens: ({ accessToken, refreshToken }) => {
    set({ accessToken, refreshToken });
    void setStoredTokens({ accessToken, refreshToken });
  },

  signOut: () => {
    set({ user: null, accessToken: null, refreshToken: null, legalAcceptance: null, status: "signedOut" });
    void clearStoredSession();
  },
}));
