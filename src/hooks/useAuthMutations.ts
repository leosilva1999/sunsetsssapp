import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import { getGoogleIdToken } from "../lib/googleSignIn";
import type { AuthResponse, LegalVersions, LoginPayload, RegisterPayload } from "../types/api";

// Login, cadastro e Google devolvem a sessão + `legalAcceptance`: guardamos os dois (o segundo
// alimenta a tela de aceite dos Termos quando `pending`).
function useStartSession() {
  const setSession = useAuthStore((s) => s.setSession);
  const setLegalAcceptance = useAuthStore((s) => s.setLegalAcceptance);
  return (response: AuthResponse) => {
    setSession(response);
    setLegalAcceptance(response.legalAcceptance ?? null);
  };
}

export function useLogin() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: startSession,
  });
}

export function useRegister() {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: startSession,
  });
}

// Login e cadastro com Google são o mesmo endpoint (POST /auth/google cria a conta se não existir).
export function useGoogleLogin() {
  const startSession = useStartSession();
  return useMutation({
    // `versions` só quando a pessoa já viu e aceitou os textos (tela de cadastro com a caixinha).
    mutationFn: async (versions?: Partial<LegalVersions>) =>
      authApi.loginWithGoogle(await getGoogleIdToken(), versions),
    onSuccess: startSession,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) => authApi.resetPassword(payload),
  });
}

export function useLogout() {
  const signOut = useAuthStore((s) => s.signOut);
  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) await authApi.logout(refreshToken);
    },
    onSettled: signOut, // desloga localmente mesmo se a chamada de revogação falhar
  });
}
