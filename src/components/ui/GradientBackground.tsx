import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { useTheme } from "../../theme/useTheme";

interface GradientBackgroundProps {
  children: ReactNode;
  edges?: Edge[];
}

/** Fundo em gradiente de pôr do sol — usado no hero da Home e nas telas de auth (seção 2). */
export function GradientBackground({ children, edges = ["top", "bottom"] }: GradientBackgroundProps) {
  const { colors } = useTheme();
  return (
    <LinearGradient colors={colors.gradient} style={styles.root} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
      <SafeAreaView edges={edges} style={styles.root}>
        <View style={styles.root}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
