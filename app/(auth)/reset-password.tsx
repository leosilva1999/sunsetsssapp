import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { GradientBackground } from "@/src/components/ui/GradientBackground";
import { TextField } from "@/src/components/ui/TextField";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/theme/useTheme";
import { useResetPassword } from "@/src/hooks/useAuthMutations";
import { getErrorMessage } from "@/src/lib/errorMessage";

// Acessada via link recebido por e-mail (`?token=...`, uso único, expira em 30min — seção 5.1).
export default function ResetPasswordScreen() {
  const { colors, fonts } = useTheme();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const resetPassword = useResetPassword();

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = !!token && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSubmit = () => {
    if (!token) return;
    resetPassword.mutate(
      { token, newPassword },
      {
        onSuccess: () => {
          Alert.alert("Senha redefinida", "Agora você já pode entrar com sua nova senha.", [
            { text: "Ir pro login", onPress: () => router.replace("/(auth)/login") },
          ]);
        },
        onError: (error) =>
          Alert.alert(
            "Não foi possível redefinir",
            getErrorMessage(error, "O link pode ter expirado — solicite um novo.")
          ),
      }
    );
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: colors.textOnGradient, fontFamily: fonts.display }]}>
            Redefinir senha
          </Text>

          {!token ? (
            <Text style={[styles.subtitle, { color: colors.textOnGradient, fontFamily: fonts.body }]}>
              Link inválido ou incompleto. Solicite um novo link de redefinição.
            </Text>
          ) : (
            <View style={styles.form}>
              <TextField
                label="Nova senha"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
                textContentType="newPassword"
                placeholder="Mínimo 8 caracteres"
              />
              <TextField
                label="Confirmar nova senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                error={mismatch ? "As senhas não coincidem." : null}
                placeholder="Repita a nova senha"
              />
              <Button label="Redefinir senha" onPress={handleSubmit} loading={resetPassword.isPending} disabled={!canSubmit} />
            </View>
          )}
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
});
