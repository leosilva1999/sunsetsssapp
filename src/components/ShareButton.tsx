import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/useTheme";
import { shareLink } from "../lib/shareLinks";

interface ShareButtonProps {
  message: string;
  url: string;
}

// Ícone de compartilhar pro `headerRight` das telas de detalhe.
export function ShareButton({ message, url }: ShareButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={() => void shareLink(message, url)} hitSlop={10} style={styles.button} accessibilityLabel="Compartilhar">
      <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 8 },
});
