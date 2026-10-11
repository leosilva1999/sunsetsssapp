import { useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/useTheme";

const AVATAR_SIZE = 88;
const MENU_WIDTH = 210;

interface AvatarMenuProps {
  avatarUrl: string | null;
  isUploading: boolean;
  onTakePhoto: () => void;
  onPickFromLibrary: () => void;
}

// Avatar do próprio perfil: tocar abre um dropdown ancorado embaixo da foto com "Tirar foto" e
// "Escolher da galeria". Mesmo padrão de Modal transparente do AccountMenu (Home), só que
// ancorado na posição medida do avatar em vez de fixo no canto.
export function AvatarMenu({ avatarUrl, isUploading, onTakePhoto, onPickFromLibrary }: AvatarMenuProps) {
  const { colors, fonts } = useTheme();
  const avatarRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

  const open = () => {
    avatarRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ top: y + height + 8, left: Math.max(12, x + width / 2 - MENU_WIDTH / 2) });
    });
  };
  const close = () => setAnchor(null);
  const choose = (action: () => void) => {
    close();
    action();
  };

  return (
    <>
      <Pressable ref={avatarRef} collapsable={false} onPress={open} disabled={isUploading} style={styles.wrapper}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.fallback, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="person" size={36} color={colors.textSecondary} />
          </View>
        )}
        <View style={[styles.badge, { backgroundColor: colors.textPrimary, borderColor: colors.background }]}>
          <Ionicons name="camera" size={14} color={colors.background} />
        </View>
        {isUploading && (
          <View style={[styles.avatar, styles.overlay]}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </Pressable>

      <Modal visible={anchor !== null} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          {anchor && (
            <View
              style={[
                styles.menu,
                { top: anchor.top, left: anchor.left, backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Pressable style={styles.menuItem} onPress={() => choose(onTakePhoto)}>
                <Ionicons name="camera-outline" size={18} color={colors.textPrimary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                  Tirar foto
                </Text>
              </Pressable>
              <Pressable style={styles.menuItem} onPress={() => choose(onPickFromLibrary)}>
                <Ionicons name="images-outline" size={18} color={colors.textPrimary} />
                <Text style={[styles.menuLabel, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                  Escolher da galeria
                </Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 },
  fallback: { alignItems: "center", justifyContent: "center" },
  overlay: { position: "absolute", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.45)" },
  badge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: { flex: 1 },
  menu: {
    position: "absolute",
    width: MENU_WIDTH,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, paddingHorizontal: 16 },
  menuLabel: { fontSize: 14 },
});
