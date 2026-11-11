import { Pressable, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/useTheme";
import { shareLink } from "../lib/shareLinks";

interface ShareLinkButtonProps {
  message: string;
  url: string;
  label?: string;
}

// "Compartilhar" dentro do conteúdo da tela (mesmo padrão do perfil). O ícone no cabeçalho nativo
// (`headerRight`) não respondia no build do Android — um botão no corpo da tela funciona sempre.
export function ShareLinkButton({ message, url, label = "Compartilhar" }: ShareLinkButtonProps) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable onPress={() => void shareLink(message, url)} style={styles.row} hitSlop={8} accessibilityRole="button">
      <Ionicons name="share-outline" size={17} color={colors.accent} />
      <Text style={[styles.label, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  label: { fontSize: 13 },
});
