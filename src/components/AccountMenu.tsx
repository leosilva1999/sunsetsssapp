import { useRef, useState } from "react";
import { Alert, Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
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
  const user = useAuthStore((s) => s.user);
  const { width: windowWidth } = useWindowDimensions();
  const avatarRef = useRef<View>(null);
  // Posição do menu = posição medida do avatar (colado embaixo, alinhado à direita). Antes era um
  // `top` fixo (insets.top + 54) — dentro do Modal, que na Android não conta a barra de status,
  // o inset era somado duas vezes e o menu abria ~1cm abaixo do avatar.
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  // Foto antiga pode apontar pra um host que não existe mais (ex.: IP anterior do storage em dev):
  // sem fallback, o avatar ficava invisível — e o botão do menu, sem alvo visual.
  const [avatarFailed, setAvatarFailed] = useState(false);
  const logout = useLogout();

  if (!user) return null;

  const isModerator = user.role === "Moderator" || user.role === "Admin";

  const open = () => {
    avatarRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + 6, right: Math.max(12, windowWidth - (x + width)) });
    });
  };
  const close = () => setAnchor(null);

  const handleModeration = () => {
    close();
    router.push("/moderation");
  };

  const handleChangePassword = () => {
    close();
    router.push("/profile/password");
  };

  const handleLogout = () => {
    close();
    Alert.alert("Sair da conta", "Tem certeza que quer sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => logout.mutate() },
    ]);
  };

  return (
    <>
      <Pressable ref={avatarRef} collapsable={false} onPress={open} hitSlop={8}>
        {user.avatarUrl && !avatarFailed ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} onError={() => setAvatarFailed(true)} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
          </View>
        )}
      </Pressable>

      <Modal visible={anchor !== null} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <View
            style={[
              styles.menu,
              { top: anchor?.top ?? 0, right: anchor?.right ?? 20, backgroundColor: colors.surface, borderColor: colors.border },
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
            {user.hasPassword !== false && (
              <Pressable style={styles.menuItem} onPress={handleChangePassword}>
                <Ionicons name="key-outline" size={18} color={colors.textPrimary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                  Alterar senha
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
