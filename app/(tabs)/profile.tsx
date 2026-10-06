import { Alert, Image, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "@/src/components/ui/Screen";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";
import { useLogout } from "@/src/hooks/useAuthMutations";
import { usersApi } from "@/src/api/users";

// Versão mínima da seção 5.9 — mostra o usuário logado e permite sair. `authStore.user` (vindo
// de login/register/refresh) não traz followersCount/followingCount — essa é a
// `PublicUserResponse` de `GET /users/{id}` (docs/API.md), então buscamos à parte. Avatar/bio
// editáveis e grid de fotos ficam pra próxima entrega.
export default function OwnProfileScreen() {
  const { colors, fonts } = useTheme();
  const authUser = useAuthStore((s) => s.user);
  const logout = useLogout();

  const profile = useQuery({
    queryKey: ["users", authUser?.id],
    queryFn: () => usersApi.get(authUser!.id),
    enabled: !!authUser,
  });

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que quer sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout.mutate() },
    ]);
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.header}>
          {authUser?.avatarUrl ? (
            <Image source={{ uri: authUser.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="person" size={32} color={colors.textSecondary} />
            </View>
          )}
          <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.display }]}>
            {authUser?.name ?? "—"}
          </Text>
          {authUser?.bio ? (
            <Text style={[styles.bio, { color: colors.textSecondary, fontFamily: fonts.body }]}>{authUser.bio}</Text>
          ) : null}
          {profile.data ? (
            <Text style={[styles.counter, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
              {profile.data.followersCount} seguidores · {profile.data.followingCount} seguindo
            </Text>
          ) : null}
        </View>

        <Button label="Sair" variant="ghost" onPress={handleLogout} loading={logout.isPending} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: 24, justifyContent: "space-between" },
  header: { alignItems: "center", gap: 8, marginTop: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 22, marginTop: 8 },
  bio: { fontSize: 14, textAlign: "center" },
  counter: { fontSize: 12, marginTop: 4 },
});
