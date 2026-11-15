import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "../components/ui/Button";
import { useTheme } from "../theme/useTheme";
import { useAuthStore } from "../stores/authStore";
import { usePushPermission } from "./usePushPermission";

const SEEN_KEY = "sunsetsss.pushPrePrompt.v1";

// Pedido de permissão de notificações logo na PRIMEIRA abertura do app (o Android não permite no
// momento da instalação). Em vez de soltar o diálogo do sistema sem contexto, mostra antes esta tela
// curta com o benefício: quem toca em "Ativar" vê o diálogo do sistema; quem toca em "Agora não"
// ainda tem o cartão "Ativar notificações" na tela de notificações. Isso importa porque no Android
// 13+ o sistema para de perguntar depois de duas negativas. Aparece UMA vez; só com a permissão
// ainda indefinida, depois da sessão carregar e da tela de aceite dos Termos (se houver).
export function PushPrePrompt() {
  const { colors, fonts, sunIconColor } = useTheme();
  const authStatus = useAuthStore((s) => s.status);
  const legalPending = useAuthStore((s) => s.legalAcceptance?.pending === true);
  const { status, request } = usePushPermission();
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SEEN_KEY)
      .then((value) => setSeen(value === "1"))
      .catch(() => setSeen(true)); // sem armazenamento: melhor não insistir
  }, []);

  const visible = seen === false && status === "undetermined" && authStatus !== "bootstrapping" && !legalPending;

  const finish = async (accepted: boolean) => {
    setSeen(true); // fecha o modal antes de abrir o diálogo do sistema
    try {
      await AsyncStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignora
    }
    if (accepted) await request();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => void finish(false)}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="notifications" size={30} color={sunIconColor} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Não perca nada</Text>
          <Text style={[styles.text, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Ative as notificações para saber na hora quando alguém curtir, comentar ou seguir você, e receber avisos
            importantes do Sunsetsss, mesmo com o app fechado.
          </Text>
          <Button label="Ativar notificações" onPress={() => void finish(true)} />
          <Button label="Agora não" variant="ghost" onPress={() => void finish(false)} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  sheet: { borderRadius: 24, padding: 24, gap: 14, alignItems: "stretch" },
  iconWrap: { alignSelf: "center", width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, textAlign: "center" },
  text: { fontSize: 14, lineHeight: 21, textAlign: "center" },
});
