import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { Button } from "@/src/components/ui/Button";
import { ProfileContent } from "@/src/components/ProfileContent";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";

// Seção 5.9 — sempre o perfil completo (mesmo componente usado em `/profile/{id}`), não um
// resumo à parte. "Sair" morou aqui antes; agora vive no menu da miniatura de avatar no header
// da Home (ver src/components/AccountMenu.tsx).
export default function OwnProfileScreen() {
  const { colors, fonts } = useTheme();
  const authUser = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");

  if (!isSignedIn || !authUser) {
    return (
      <Screen>
        <View style={styles.signedOut}>
          <Ionicons name="person-circle-outline" size={56} color={colors.textSecondary} />
          <Text style={[styles.signedOutTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
            Entre na sua conta
          </Text>
          <Text style={[styles.signedOutSubtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Faça login pra ver seu perfil, postar fotos e seguir outros usuários.
          </Text>
          <Button label="Entrar" onPress={() => router.push("/(auth)/login")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <ProfileContent userId={authUser.id} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  signedOut: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  signedOutTitle: { fontSize: 20 },
  signedOutSubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
