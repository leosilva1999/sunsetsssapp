import { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { useTheme } from "../theme/useTheme";
import { useDeleteAccount } from "../hooks/useDeleteAccount";
import { getErrorMessage } from "../lib/errorMessage";

const CONFIRM_WORD = "EXCLUIR";

// "Excluir conta" (LGPD, art. 18, IX) — exigência da Google Play e da App Store pra apps que
// criam conta. Fica no fim de "Editar perfil", separada do resto, com confirmação forte: abre um
// modal que só habilita o botão depois de digitar a palavra EXCLUIR.
export function DeleteAccountSection() {
  const { colors, fonts } = useTheme();
  const deleteAccount = useDeleteAccount();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");

  const close = () => {
    if (deleteAccount.isPending) return;
    setOpen(false);
    setTyped("");
  };

  const confirm = () => {
    deleteAccount.mutate(undefined, {
      onError: (error) => {
        setOpen(false);
        setTyped("");
        Alert.alert("Não foi possível excluir a conta", getErrorMessage(error, "Tente de novo."));
      },
    });
  };

  const canConfirm = typed.trim().toUpperCase() === CONFIRM_WORD && !deleteAccount.isPending;

  return (
    <View style={[styles.section, { borderTopColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.danger, fontFamily: fonts.display }]}>Excluir conta</Text>
      <Text style={[styles.text, { color: colors.textSecondary, fontFamily: fonts.body }]}>
        Apaga seus dados pessoais (nome, e-mail, foto e bio) e encerra o acesso. Suas fotos, comentários e
        avaliações continuam no app, mas passam a aparecer como &quot;Usuário excluído&quot;. Não dá para desfazer.
      </Text>
      <Pressable style={[styles.button, { borderColor: colors.danger }]} onPress={() => setOpen(true)}>
        <Ionicons name="trash-outline" size={17} color={colors.danger} />
        <Text style={[styles.buttonLabel, { color: colors.danger, fontFamily: fonts.bodyMedium }]}>Excluir minha conta</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
              Excluir conta definitivamente?
            </Text>
            <Text style={[styles.text, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Esta ação é irreversível: você perde o acesso e não poderá recuperar esta conta. Para confirmar, digite{" "}
              <Text style={{ fontFamily: fonts.bodyBold, color: colors.textPrimary }}>{CONFIRM_WORD}</Text>.
            </Text>
            <TextField
              label="Confirmação"
              value={typed}
              onChangeText={setTyped}
              autoCapitalize="characters"
              autoCorrect={false}
              placeholder={CONFIRM_WORD}
            />
            <View style={styles.actions}>
              <View style={styles.actionItem}>
                <Button label="Cancelar" variant="secondary" onPress={close} disabled={deleteAccount.isPending} />
              </View>
              <View style={styles.actionItem}>
                <Pressable
                  onPress={confirm}
                  disabled={!canConfirm}
                  style={[styles.dangerButton, { backgroundColor: colors.danger, opacity: canConfirm ? 1 : 0.4 }]}
                >
                  <Text style={[styles.dangerLabel, { fontFamily: fonts.bodyBold }]}>
                    {deleteAccount.isPending ? "Excluindo..." : "Excluir"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24, paddingTop: 24, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  title: { fontSize: 18 },
  text: { fontSize: 13, lineHeight: 19 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderRadius: 14, minHeight: 48, marginTop: 4 },
  buttonLabel: { fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  sheet: { borderRadius: 20, padding: 20, gap: 14 },
  sheetTitle: { fontSize: 19 },
  actions: { flexDirection: "row", gap: 10 },
  actionItem: { flex: 1 },
  dangerButton: { borderRadius: 14, minHeight: 52, alignItems: "center", justifyContent: "center" },
  dangerLabel: { color: "#ffffff", fontSize: 15 },
});
