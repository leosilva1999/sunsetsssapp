import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";

import { GradientBackground } from "@/src/components/ui/GradientBackground";
import { BrandLogo } from "@/src/components/ui/BrandLogo";
import { TextField } from "@/src/components/ui/TextField";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/theme/useTheme";
import { useGoogleLogin, useLogin } from "@/src/hooks/useAuthMutations";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { googleErrorMessage } from "@/src/lib/googleSignIn";

export default function LoginScreen() {
  const { colors, fonts } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const googleLogin = useGoogleLogin();

  const handleSubmit = () => {
    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => router.replace("/(tabs)"),
        onError: (error) => Alert.alert("Não foi possível entrar", getErrorMessage(error, "Tente de novo.")),
      }
    );
  };

  const handleGoogle = () => {
    googleLogin.mutate(undefined, {
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
            <BrandLogo variant="vertical" height={72} />
            <Text style={[styles.title, { color: colors.textOnGradient, fontFamily: fonts.display }]}>
              Bem-vindo de volta
            </Text>
            <Text style={[styles.subtitle, { color: colors.textOnGradient, fontFamily: fonts.body }]}>
              Entre pra continuar explorando os melhores pôres do sol.
            </Text>
          </View>

          <View style={styles.form}>
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
              textContentType="password"
              autoComplete="password"
              placeholder="••••••••"
            />

            <Link
              href="/(auth)/forgot-password"
              style={[styles.forgotLink, { color: colors.textOnGradient, fontFamily: fonts.bodyMedium }]}
            >
              Esqueci minha senha
            </Link>

            <Button
              label="Entrar"
              onPress={handleSubmit}
              loading={login.isPending}
              disabled={!email.trim() || !password}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerLabel, { color: colors.textOnGradient, fontFamily: fonts.body }]}>ou</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button label="Continuar com Google" variant="secondary" icon="logo-google" onPress={handleGoogle} loading={googleLogin.isPending} />

            <Pressable onPress={() => router.replace("/(tabs)")} hitSlop={8}>
              <Text style={[styles.guestLink, { color: colors.textOnGradient, fontFamily: fonts.bodyMedium }]}>
                ou entrar como visitante
              </Text>
            </Pressable>
          </View>

          <Link
            href="/(auth)/register"
            style={[styles.footerLink, { color: colors.textOnGradient, fontFamily: fonts.body }]}
          >
            Não tem conta? <Text style={{ fontFamily: fonts.bodyBold }}>Cadastre-se</Text>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 32 },
  header: { gap: 8 },
  title: { fontSize: 28, marginTop: 12 },
  subtitle: { fontSize: 15, opacity: 0.85 },
  form: { gap: 14 },
  forgotLink: { alignSelf: "flex-end", fontSize: 14 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dividerLabel: { fontSize: 13 },
  guestLink: { textAlign: "center", fontSize: 13, opacity: 0.85, marginTop: 4 },
  footerLink: { textAlign: "center", fontSize: 14 },
});
