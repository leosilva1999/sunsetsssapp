import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import { usersApi } from "../api/users";
import { useAuthStore } from "../stores/authStore";

// Excluir a própria conta (LGPD): chama `DELETE /users/me`; em seguida encerra a sessão local,
// limpa o cache de dados (nada da conta antiga fica em memória) e volta pro login. Os refresh
// tokens já foram revogados pelo servidor, então não há `logout` a chamar.
export function useDeleteAccount() {
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.deleteMe(),
    onSuccess: () => {
      signOut();
      queryClient.clear();
      router.replace("/(auth)/login");
    },
  });
}
