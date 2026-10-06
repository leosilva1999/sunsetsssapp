import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useTheme } from "../../theme/useTheme";

interface ScreenProps {
  children: ReactNode;
  edges?: Edge[];
}

/** Container padrão (fundo sólido do tema) pra telas que não usam o hero em gradiente. */
export function Screen({ children, edges = ["top", "bottom"] }: ScreenProps) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.root}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
