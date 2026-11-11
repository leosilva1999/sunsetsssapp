import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground } from "@/src/components/ui/GradientBackground";
import { BrandLogo } from "@/src/components/ui/BrandLogo";
import { TextField } from "@/src/components/ui/TextField";
import { Button } from "@/src/components/ui/Button";
import { GoogleLogo } from "@/src/components/ui/GoogleLogo";
import { useTheme } from "@/src/theme/useTheme";
import { useGoogleLogin, useRegister } from "@/src/hooks/useAuthMutations";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { getFieldError } from "@/src/lib/fieldErrors";
import { legalApi } from "@/src/api/legal";
import { googleErrorMessage } from "@/src/lib/googleSignIn";

export default function RegisterScreen() {
  const { colors, fonts, sunIconColor } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const register = useRegister();
  const googleLogin = useGoogleLogin();

  // Versões vigentes dos textos que a pessoa está aceitando (docs/API.md, "Terms and Privacy
  // acceptance"). Se não carregarem, o cadastro segue sem elas — a conta fica "pendente" e o app
  // mostra a tela de aceite depois do login.
  const termsDoc = useQuery({ queryKey: ["legal", "terms"], queryFn: legalApi.getTerms });
  const privacyDoc = useQuery({ queryKey: ["legal", "privacy"], queryFn: legalApi.getPrivacy });
  const acceptedVersions =
    acceptedTerms && termsDoc.data && privacyDoc.data
      ? { termsVersion: termsDoc.data.version, privacyVersion: privacyDoc.data.version }
      : undefined;

  const canSubmit = name.trim() && email.trim() && password.length >= 8 && acceptedTerms;

  const handleSubmit = () => {
    register.mutate(
      { name: name.trim(), email: email.trim(), password, ...acceptedVersions },
      {
        onSuccess: () => router.replace("/(tabs)"),
        onError: (error) => {
          // 400 em TermsVersion/PrivacyVersion = um dos textos foi republicado: recarrega e pede o aceite de novo.
          if (getFieldError(error, "TermsVersion") || getFieldError(error, "PrivacyVersion")) {
            setAcceptedTerms(false);
            void termsDoc.refetch();
            void privacyDoc.refetch();
            Alert.alert("Textos atualizados", "Os Termos ou a Política mudaram. Leia a nova versão e aceite de novo.");
            return;
          }
          Alert.alert("Não foi possível criar a conta", getErrorMessage(error, "Tente de novo."));
        },
      }
    );
  };

  const handleGoogle = () => {
    googleLogin.mutate(acceptedVersions, {
      onSuccess: () => router.replace("/(tabs)"),
      onError: (error) => {
        const message = googleErrorMessage(error);
        if (message) Alert.alert("Não foi possível entrar com o Google", message);
      },
    });
  };
  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logo}>
              <BrandLogo variant="vertical" height={144} />
            </View>
            <Text style={[styles.title, { color: colors.heroHeading, fontFamily: fonts.display }]}>
              Crie sua conta
            </Text>
          </View>

          <View style={styles.form}>
            <TextField label="Nome" value={name} onChangeText={setName} autoComplete="name" placeholder="Seu nome" />
            <TextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              placeholder="voce@email.com"
            />
            <TextField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              isPassword
              textContentType="newPassword"
              autoComplete="password-new"
              placeholder="Mínimo 8 caracteres"
            />

            <Pressable style={styles.termsRow} onPress={() => setAcceptedTerms((v) => !v)} hitSlop={6}>
              <Ionicons
                name={acceptedTerms ? "checkbox" : "square-outline"}
                size={22}
                color={acceptedTerms ? sunIconColor : colors.textOnGradient}
              />
              <Text style={[styles.termsText, { color: colors.textOnGradient, fontFamily: fonts.body }]}>
                Li e aceito os{" "}
                <Link href="/legal/terms" style={{ fontFamily: fonts.bodyBold }}>
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link href="/legal/privacy" style={{ fontFamily: fonts.bodyBold }}>
                  Política de Privacidade
                </Link>
              </Text>
            </Pressable>

            <Button
              label="Criar conta"
              backgroundColor={colors.heroButton}
              labelColor={colors.heroButtonText}
              onPress={handleSubmit}
              loading={register.isPending}
              disabled={!canSubmit}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerLabel, { color: colors.textOnGradient, fontFamily: fonts.body }]}>ou</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button label="Continuar com Google" variant="secondary" iconElement={<GoogleLogo />} onPress={handleGoogle} loading={googleLogin.isPending} />
          </View>

          <Link
            href="/(auth)/login"
            style={[styles.footerLink, { color: colors.textOnGradient, fontFamily: fonts.body }]}
          >
            Já tem conta? <Text style={{ fontFamily: fonts.bodyBold }}>Entrar</Text>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 28 },
  header: { gap: 8 },
  logo: { alignItems: "center" },
  title: { fontSize: 28, marginTop: 12 },
  form: { gap: 14 },
  termsRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  termsText: { flex: 1, fontSize: 13, lineHeight: 19 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { fontSize: 13 },
  footerLink: { textAlign: "center", fontSize: 14 },
});
