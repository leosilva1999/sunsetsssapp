import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, type Href } from "expo-router";
import type { ComponentProps } from "react";

import { Screen } from "@/src/components/ui/Screen";
import { RoleGate } from "@/src/components/ui/RoleGate";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";

interface MenuItem {
  href: Href;
  icon: ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
}

// Seção 5.12 — painel só pra Moderator/Admin (RoleGate). Editor de termos e gestão de papéis
// são Admin only, escondidos pra Moderator comum.
function ModerationHome() {
  const { colors, fonts, headerOptions } = useTheme();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "Admin";

  const items: MenuItem[] = [
    {
      href: "/moderation/reports",
      icon: "flag-outline",
      title: "Fila de denúncias",
      description: "Resolver ou descartar denúncias pendentes",
    },
    {
      href: "/moderation/actions",
      icon: "time-outline",
      title: "Histórico de ações",
      description: "Log auditável, só leitura",
    },
    ...(isAdmin
      ? ([
          {
            href: "/moderation/legal",
            icon: "document-text-outline",
            title: "Termos & Privacidade",
            description: "Editar e publicar nova versão",
          },
          {
            href: "/moderation/users",
            icon: "people-outline",
            title: "Usuários",
            description: "Buscar e mudar papel (User/Moderator/Admin)",
          },
        ] satisfies MenuItem[])
      : []),
  ];

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Moderação", ...headerOptions }} />
      <View style={styles.content}>
        {items.map((item) => (
          <Pressable
            key={item.href as string}
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(item.href)}
          >
            <Ionicons name={item.icon} size={22} color={colors.textPrimary} />
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>
                {item.title}
              </Text>
              <Text style={[styles.rowDescription, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

export default function ModerationHomeScreen() {
  return (
    <RoleGate allow={["Moderator", "Admin"]}>
      <ModerationHome />
    </RoleGate>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 15 },
  rowDescription: { fontSize: 12 },
});
