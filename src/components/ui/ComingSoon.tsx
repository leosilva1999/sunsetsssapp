import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import type { ComponentProps } from "react";

import { Screen } from "./Screen";
import { useTheme } from "../../theme/useTheme";

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: ComponentProps<typeof Ionicons>["name"];
  /** Quando a tela é empilhada fora das tabs (sem header próprio), mostra o header nativo
   *  com botão de voltar e este título. */
  headerTitle?: string;
}

/** Placeholder padrão pras telas ainda não implementadas nesta entrega — ver seção da spec
 *  referente a cada rota. Substituir pela implementação real tela a tela. */
export function ComingSoon({ title, description, icon = "construct-outline", headerTitle }: ComingSoonProps) {
  const { colors, fonts, headerOptions } = useTheme();
  return (
    <Screen>
      {headerTitle ? (
        <Stack.Screen options={{ headerShown: true, title: headerTitle, ...headerOptions }} />
      ) : null}
      <View style={styles.center}>
        <Ionicons name={icon} size={40} color={colors.textSecondary} />
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            {description}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  title: { fontSize: 20, textAlign: "center" },
  description: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
