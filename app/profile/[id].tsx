import { Stack, useLocalSearchParams } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { ProfileContent } from "@/src/components/ProfileContent";
import { useTheme } from "@/src/theme/useTheme";
import { useUserProfile } from "@/src/hooks/useUserProfile";

// Perfil de terceiros — empilhado (precisa de header nativo com voltar). A busca de
// `useUserProfile` aqui é só pro título do header; `ProfileContent` busca de novo com a mesma
// queryKey, então o React Query devolve do cache sem refazer a chamada.
export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { headerOptions } = useTheme();
  const profile = useUserProfile(id);

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: profile.data?.name ?? "Perfil", ...headerOptions }} />
      <ProfileContent userId={id} />
    </Screen>
  );
}
