import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { RoleGate } from "@/src/components/ui/RoleGate";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/theme/useTheme";
import { useLegalDocument, useSaveLegalDocument } from "@/src/hooks/useLegalEditor";
import { getErrorMessage } from "@/src/lib/errorMessage";
import type { LegalDocumentType } from "@/src/types/entities";

const DOC_TABS: { value: LegalDocumentType; label: string }[] = [
  { value: "TermsOfService", label: "Termos de Uso" },
  { value: "PrivacyPolicy", label: "Privacidade" },
];

function LegalEditor() {
  const { colors, fonts, headerOptions } = useTheme();
  const [docType, setDocType] = useState<LegalDocumentType>("TermsOfService");
  const doc = useLegalDocument(docType);
  const save = useSaveLegalDocument(docType);
  const [content, setContent] = useState("");

  useEffect(() => {
    setContent(doc.data?.content ?? "");
  }, [doc.data]);

  const hasChanges = content.trim() !== (doc.data?.content ?? "").trim();

  const handlePublish = () => {
    Alert.alert(
      "Publicar nova versão",
      "Isso cria uma versão nova e substitui a vigente — versões antigas não ficam disponíveis pela API. Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Publicar",
          onPress: () =>
            save.mutate(content.trim(), {
              onError: (error) => Alert.alert("Não foi possível publicar", getErrorMessage(error, "Tente de novo.")),
            }),
        },
      ]
    );
  };

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Termos & Privacidade", ...headerOptions }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.tabs}>
          {DOC_TABS.map((tab) => (
            <Pressable
              key={tab.value}
              onPress={() => setDocType(tab.value)}
              style={[styles.tabButton, { backgroundColor: docType === tab.value ? colors.textPrimary : colors.surfaceAlt }]}
            >
              <Text
                style={[
                  styles.tabButtonLabel,
                  { color: docType === tab.value ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {doc.isLoading ? (
          <ActivityIndicator color={colors.textPrimary} />
        ) : (
          <>
            {doc.data ? (
              <Text style={[styles.meta, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
                Versão vigente: {doc.data.version} · {new Date(doc.data.createdAt).toLocaleDateString("pt-BR")}
              </Text>
            ) : null}
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              style={[styles.textarea, { color: colors.textPrimary, backgroundColor: colors.surface, borderColor: colors.border, fontFamily: fonts.body }]}
            />
            <Button
              label="Publicar nova versão"
              onPress={handlePublish}
              loading={save.isPending}
              disabled={!hasChanges || !content.trim()}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

export default function LegalEditorScreen() {
  return (
    <RoleGate allow={["Admin"]}>
      <LegalEditor />
    </RoleGate>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 14 },
  tabs: { flexDirection: "row", gap: 8 },
  tabButton: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
  tabButtonLabel: { fontSize: 13 },
  meta: { fontSize: 12 },
  textarea: {
    minHeight: 320,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    lineHeight: 19,
  },
});
