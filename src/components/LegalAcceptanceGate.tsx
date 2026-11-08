import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Screen } from "./ui/Screen";
import { Button } from "./ui/Button";
import { useTheme } from "../theme/useTheme";
import { useAuthStore } from "../stores/authStore";
import { legalApi } from "../api/legal";
import { ApiError } from "../api/client";
import { getErrorMessage } from "../lib/errorMessage";
import type { LegalDocument } from "../types/entities";

// Tela de aceite dos Termos e da Política (docs/API.md, "Terms and Privacy acceptance"). A API não
// bloqueia nada sozinha — quem exige é o app: com `legalAcceptance.pending` (conta antiga, texto
// novo publicado, conta Google nova sem versões), cobre o app inteiro até a pessoa aceitar ou sair.
// Também rechecamos o estado ao abrir o app (a sessão salva pode estar defasada).
export function LegalAcceptanceGate() {
  const status = useAuthStore((s) => s.status);
  const pending = useAuthStore((s) => s.legalAcceptance?.pending === true);
  const setLegalAcceptance = useAuthStore((s) => s.setLegalAcceptance);
  const signedIn = status === "signedIn";

  const mine = useQuery({
    queryKey: ["legal", "mine"],
    queryFn: legalApi.getMyAcceptance,
    enabled: signedIn,
    staleTime: 5 * 60_000,
  });
  useEffect(() => {
    if (mine.data) setLegalAcceptance(mine.data);
  }, [mine.data, setLegalAcceptance]);

  if (!signedIn || !pending) return null;
  return <AcceptanceScreen />;
}

function AcceptanceScreen() {
  const { colors, fonts, sunIconColor } = useTheme();
  const setLegalAcceptance = useAuthStore((s) => s.setLegalAcceptance);
  const signOut = useAuthStore((s) => s.signOut);

  const terms = useQuery({ queryKey: ["legal", "terms"], queryFn: legalApi.getTerms });
  const privacy = useQuery({ queryKey: ["legal", "privacy"], queryFn: legalApi.getPrivacy });
  const [accepted, setAccepted] = useState(false);
  const [open, setOpen] = useState<"terms" | "privacy" | null>(null);

  const accept = useMutation({
    mutationFn: () =>
      legalApi.acceptMine({ termsVersion: terms.data!.version, privacyVersion: privacy.data!.version }),
    onSuccess: setLegalAcceptance,
    onError: (error) => {
      // 400 = um dos textos foi republicado enquanto a tela estava aberta: recarrega e pergunta de novo.
      if (error instanceof ApiError && error.status === 400) {
        setAccepted(false);
        void terms.refetch();
        void privacy.refetch();
        Alert.alert("Textos atualizados", "Os Termos ou a Política mudaram. Leia a nova versão e aceite de novo.");
        return;
      }
      Alert.alert("Não foi possível registrar o aceite", getErrorMessage(error, "Tente de novo."));
    },
  });

  const loading = terms.isLoading || privacy.isLoading;
  const failed = terms.isError || privacy.isError;
  const ready = !!terms.data && !!privacy.data;

  const renderDocument = (kind: "terms" | "privacy", title: string, doc: LegalDocument | undefined) => (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable style={styles.cardHeader} onPress={() => setOpen(open === kind ? null : kind)}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
          {title}
          {doc ? <Text style={{ fontFamily: fonts.mono, fontSize: 12 }}>{`  v${doc.version}`}</Text> : null}
        </Text>
        <Ionicons name={open === kind ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
      </Pressable>
      {open === kind && doc ? (
        <Text style={[styles.docText, { color: colors.textPrimary, fontFamily: fonts.body }]}>{doc.content}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>
            Termos de Uso e Privacidade
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Para continuar usando o Sunsetsss, leia e aceite os documentos abaixo.
          </Text>

          {loading && <ActivityIndicator color={colors.textPrimary} />}
          {failed && (
            <View style={styles.errorBox}>
              <Text style={[styles.subtitle, { color: colors.danger, fontFamily: fonts.body }]}>
                Não foi possível carregar os documentos agora.
              </Text>
              <Button
                label="Tentar de novo"
                variant="secondary"
                onPress={() => {
                  void terms.refetch();
                  void privacy.refetch();
                }}
              />
            </View>
          )}

          {renderDocument("terms", "Termos de Uso", terms.data)}
          {renderDocument("privacy", "Política de Privacidade", privacy.data)}

          <Pressable style={styles.acceptRow} onPress={() => setAccepted((v) => !v)} disabled={!ready} hitSlop={6}>
            <Ionicons
              name={accepted ? "checkbox" : "square-outline"}
              size={24}
              color={accepted ? sunIconColor : colors.textSecondary}
            />
            <Text style={[styles.acceptText, { color: colors.textPrimary, fontFamily: fonts.body }]}>
              Li e aceito os Termos de Uso e a Política de Privacidade.
            </Text>
          </Pressable>

          <Button
            label="Aceitar e continuar"
            onPress={() => accept.mutate()}
            loading={accept.isPending}
            disabled={!ready || !accepted}
          />
          <Button label="Sair da conta" variant="ghost" onPress={signOut} />
        </ScrollView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 16 },
  title: { fontSize: 24 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  errorBox: { gap: 10 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 16, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 16 },
  docText: { fontSize: 13, lineHeight: 20 },
  acceptRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 4 },
  acceptText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
