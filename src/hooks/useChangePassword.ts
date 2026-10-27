import { useMutation } from "@tanstack/react-query";

import { usersApi } from "../api/users";
import { useAuthStore } from "../stores/authStore";

// Alterar a própria senha (docs/API.md, `PUT /users/me/password`). O servidor mantém esta sessão
// viva enviando o refresh token vigente (ver `usersApi.changePassword`); se por algum motivo não
// havia refresh token, TODAS as sessões caem — aí a gente também sai, como a doc manda.
export function useChangePassword() {
  const signOut = useAuthStore((s) => s.signOut);

  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const hadRefreshToken = !!useAuthStore.getState().refreshToken;
      await usersApi.changePassword(payload);
      return { hadRefreshToken };
    },
    onSuccess: ({ hadRefreshToken }) => {
      if (!hadRefreshToken) signOut();
    },
  });
}
