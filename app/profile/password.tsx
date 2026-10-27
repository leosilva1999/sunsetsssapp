import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { Stack, router } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { Button } from "@/src/components/ui/Button";
import { TextField } from "@/src/components/ui/TextField";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";
import { useChangePassword } from "@/src/hooks/useChangePassword";
import { ApiError } from "@/src/api/client";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { getFieldError } from "@/src/lib/fieldErrors";

const MIN_LENGTH = 8;

// `PUT /users/me/password` (docs/API.md, Users). A confirmação é só do cliente. "Senha atual
// errada" volta como 400 (não 401) de propósito — vira erro inline no campo, sem refresh/sign-out.
export default function ChangePasswordScreen() {
  const { colors, fonts, headerOptions } = useTheme();
  const hasPassword = useAuthStore((s) => s.user?.hasPassword);
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [serverCurrentError, setServerCurrentError] = useState<string | null>(null);
  const [serverNewError, setServerNewError] = useState<string | null>(null);

  // Validação local — só mostra o que já foi digitado, pra não gritar com campo vazio.
  const newError =
    serverNewError ??
    (newPassword.length > 0 && newPassword.length < MIN_LENGTH
      ? `Mínimo de ${MIN_LENGTH} caracteres.`
      : newPassword.length > 0 && newPassword === currentPassword
        ? "A nova senha deve ser diferente da atual."
        : null);
  const confirmError =
    confirmPassword.length > 0 && confirmPassword !== newPassword ? "As senhas não conferem." : null;

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_LENGTH &&
    newPassword !== currentPassword &&
    confirmPassword === newPassword &&
    !changePassword.isPending;

  const handleSubmit = () => {
    setServerCurrentError(null);
    setServerNewError(null);
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          Alert.alert("Senha alterada", "Enviamos um aviso para o seu e-mail.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (error) => {
          const current = getFieldError(error, "CurrentPassword");
          const next = getFieldError(error, "NewPassword");
          if (current || next) {
            setServerCurrentError(current ? "Senha atual incorreta." : null);
            setServerNewError(next);
            return;
          }
          if (error instanceof ApiError && error.status === 409) {
            Alert.alert(
              "Conta sem senha",
              'Sua conta foi criada com o Google e não tem senha. Para definir uma, use "Esqueci minha senha" na tela de login.'
            );
            return;
          }
          if (error instanceof ApiError && error.status === 429) {
            Alert.alert("Muitas tentativas", "Aguarde alguns minutos antes de tentar de novo.");
            return;
          }
          Alert.alert("Não foi possível alterar a senha", getErrorMessage(error, "Tente de novo."));
        },
      }
    );
  };

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Alterar senha", ...headerOptions }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {hasPassword === false ? (
            <Text style={[styles.note, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Sua conta usa o login com o Google e não tem uma senha para alterar.
            </Text>
          ) : (
            <>
              <TextField
                label="Senha atual"
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setServerCurrentError(null);
                }}
                isPassword
                autoComplete="current-password"
                textContentType="password"
                error={serverCurrentError}
              />
              <TextField
                label="Nova senha"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setServerNewError(null);
                }}
                isPassword
                autoComplete="new-password"
                textContentType="newPassword"
                placeholder={`Mínimo de ${MIN_LENGTH} caracteres`}
                error={newError}
              />
              <TextField
                label="Confirmar nova senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                autoComplete="new-password"
                textContentType="newPassword"
                error={confirmError}
              />
              <Button
                label="Alterar senha"
                onPress={handleSubmit}
                loading={changePassword.isPending}
                disabled={!canSubmit}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 24, gap: 18 },
  note: { fontSize: 14, lineHeight: 20 },
});
