import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { GradientBackground } from "@/src/components/ui/GradientBackground";
import { TextField } from "@/src/components/ui/TextField";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/theme/useTheme";
import { useForgotPassword } from "@/src/hooks/useAuthMutations";

export default function ForgotPasswordScreen() {
  const { colors, fonts } = useTheme();
  const [email, setEmail] = useState("");
  const forgotPassword = useForgotPassword();

  // Mensagem de sucesso é sempre a mesma, independente de o e-mail existir — não diferenciar
  // na UI (seção 5.1). Por isso ignoramos erro/sucesso da mutation pra exibição e sempre
  // mostramos a mesma confirmação após o POST completar (ela sempre responde 204).
  const handleSubmit = () => {
    forgotPassword.mutate(email.trim(), {
      onSettled: () => setSent(true),
    });
  };

  const [sent, setSent] = useState(false);

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: colors.textOnGradient, fontFamily: fonts.display }]}>
            Esqueci minha senha
          </Text>

          {sent ? (
            <View style={styles.confirmation}>
              <Ionicons name="mail-outline" size={40} color={colors.textOnGradient} />
              <Text style={[styles.confirmationText, { color: colors.textOnGradient, fontFamily: fonts.body }]}>
                Se esse e-mail estiver cadastrado, você vai receber um link pra redefinir sua senha em
                instantes.
              </Text>
              <Button label="Voltar pro login" variant="secondary" onPress={() => router.replace("/(auth)/login")} />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={[styles.subtitle, { color: colors.textOnGradient, fontFamily: fonts.body }]}>
                Informe seu e-mail e enviaremos um link de redefinição.
              </Text>
              <TextField
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                placeholder="voce@email.com"
              />
              <Button label="Enviar link" onPress={handleSubmit} loading={forgotPassword.isPending} disabled={!email.trim()} />
            </View>
          )}

          <Link
            href="/(auth)/login"
            style={[styles.footerLink, { color: colors.textOnGradient, fontFamily: fonts.body }]}
          >
            Lembrou a senha? <Text style={{ fontFamily: fonts.bodyBold }}>Entrar</Text>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 28 },
  title: { fontSize: 26 },
  subtitle: { fontSize: 15, opacity: 0.85 },
  form: { gap: 14 },
  confirmation: { alignItems: "center", gap: 16, paddingVertical: 12 },
  confirmationText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  footerLink: { textAlign: "center", fontSize: 14 },
});
