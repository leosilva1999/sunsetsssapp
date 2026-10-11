import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { useAuthStore } from "../stores/authStore";
import { getGoogleIdToken } from "../lib/googleSignIn";
import type { LoginPayload, RegisterPayload } from "../types/api";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: setSession,
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: setSession,
  });
}

// Login e cadastro com Google são o mesmo endpoint (POST /auth/google cria a conta se não existir).
export function useGoogleLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async () => authApi.loginWithGoogle(await getGoogleIdToken()),
    onSuccess: setSession,
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
