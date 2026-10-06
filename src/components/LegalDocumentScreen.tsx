import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Screen } from "./ui/Screen";
import { useTheme } from "../theme/useTheme";
import type { LegalDocument } from "../types/entities";

interface LegalDocumentScreenProps {
  title: string;
  queryKey: readonly unknown[];
  fetchDocument: () => Promise<LegalDocument>;
}

export function LegalDocumentScreen({ title, queryKey, fetchDocument }: LegalDocumentScreenProps) {
  const { colors, fonts, headerOptions } = useTheme();
  const { data, isLoading, isError } = useQuery({ queryKey, queryFn: fetchDocument });

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: true, title, ...headerOptions }} />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading && <ActivityIndicator color={colors.textPrimary} />}
        {isError && (
          <Text style={[styles.body, { color: colors.danger, fontFamily: fonts.body }]}>
            Não foi possível carregar este documento agora.
          </Text>
        )}
        {data && (
          <View style={styles.doc}>
            <Text style={[styles.meta, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
              Versão {data.version} · {new Date(data.createdAt).toLocaleDateString("pt-BR")}
            </Text>
            <Text style={[styles.body, { color: colors.textPrimary, fontFamily: fonts.body }]}>{data.content}</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  doc: { gap: 16 },
  meta: { fontSize: 12 },
  body: { fontSize: 15, lineHeight: 23 },
});
