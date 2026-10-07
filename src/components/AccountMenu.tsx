import { useState } from "react";
import { Alert, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../theme/useTheme";
import { useAuthStore } from "../stores/authStore";
import { useLogout } from "../hooks/useAuthMutations";

// Miniatura circular do avatar no header da Home, ao lado do tema/notificações — abre um menu
// com "Moderação" (só Moderator/Admin) e "Sair". Substitui o botão "Sair" que morava na aba
// Perfil (ver app/(tabs)/profile.tsx).
export function AccountMenu() {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const logout = useLogout();

  if (!user) return null;

  const isModerator = user.role === "Moderator" || user.role === "Admin";

  const handleModeration = () => {
    setOpen(false);
    router.push("/moderation");
  };

  const handleLogout = () => {
    setOpen(false);
    Alert.alert("Sair da conta", "Tem certeza que quer sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout.mutate() },
    ]);
  };

  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={8}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
          </View>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.menu,
              { top: insets.top + 54, backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            {isModerator && (
              <Pressable style={styles.menuItem} onPress={handleModeration}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.textPrimary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                  Moderação
                </Text>
              </Pressable>
            )}
            <Pressable style={styles.menuItem} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={[styles.menuLabel, { color: colors.danger, fontFamily: fonts.bodyMedium }]}>Sair</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  backdrop: { flex: 1 },
  menu: {
    position: "absolute",
    right: 20,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    minWidth: 170,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
  menuLabel: { fontSize: 14 },
});
