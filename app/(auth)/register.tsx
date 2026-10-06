import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground } from "@/src/components/ui/GradientBackground";
import { BrandLogo } from "@/src/components/ui/BrandLogo";
import { TextField } from "@/src/components/ui/TextField";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/theme/useTheme";
import { useRegister } from "@/src/hooks/useAuthMutations";
import { getErrorMessage } from "@/src/lib/errorMessage";

export default function RegisterScreen() {
  const { colors, fonts, sunIconColor } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const register = useRegister();

  const canSubmit = name.trim() && email.trim() && password.length >= 8 && acceptedTerms;

  const handleSubmit = () => {
    register.mutate(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: () => router.replace("/(tabs)"),
        onError: (error) => Alert.alert("Não foi possível criar a conta", getErrorMessage(error, "Tente de novo.")),
      }
    );
  };

  const handleGoogle = () => {
    Alert.alert("Em breve", "Cadastro com Google ainda não está configurado neste app.");
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <BrandLogo variant="vertical" height={72} />
            <Text style={[styles.title, { color: colors.textOnGradient, fontFamily: fonts.display }]}>
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

            <Button label="Criar conta" onPress={handleSubmit} loading={register.isPending} disabled={!canSubmit} />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerLabel, { color: colors.textOnGradient, fontFamily: fonts.body }]}>ou</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button label="Continuar com Google" variant="secondary" onPress={handleGoogle} />
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
  title: { fontSize: 28, marginTop: 12 },
  form: { gap: 14 },
  termsRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  termsText: { flex: 1, fontSize: 13, lineHeight: 19 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { fontSize: 13 },
  footerLink: { textAlign: "center", fontSize: 14 },
});
