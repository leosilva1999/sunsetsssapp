import { StyleSheet, Text } from "react-native";
import { Link, Stack } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { useTheme } from "@/src/theme/useTheme";

export default function NotFoundScreen() {
  const { colors, fonts } = useTheme();
  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title: "Página não encontrada" }} />
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>
        Essa tela não existe.
      </Text>
      <Link href="/" style={[styles.link, { color: colors.accent, fontFamily: fonts.bodyBold }]}>
        Voltar pro início
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, textAlign: "center", marginTop: 40 },
  link: { textAlign: "center", marginTop: 16, fontSize: 15 },
});
