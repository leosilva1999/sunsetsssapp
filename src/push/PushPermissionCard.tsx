import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "../components/ui/Button";
import { useTheme } from "../theme/useTheme";
import { usePushPermission } from "./usePushPermission";

// Convite pra ativar as notificações — aparece no TOPO da tela de notificações, nunca na abertura do
// app: a permissão só é pedida quando a pessoa toca em "Ativar notificações". Se ela já negou, o
// sistema não mostra mais o diálogo, então o botão leva aos ajustes. Granted/sem suporte: some.
export function PushPermissionCard() {
  const { colors, fonts, sunIconColor } = useTheme();
  const { status, request, openSettings } = usePushPermission();

  if (status !== "undetermined" && status !== "denied") return null;
  const denied = status === "denied";

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
      <View style={styles.header}>
        <Ionicons name="notifications-outline" size={20} color={sunIconColor} />
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>
          Receba avisos no celular
        </Text>
      </View>
      <Text style={[styles.text, { color: colors.textSecondary, fontFamily: fonts.body }]}>
        {denied
          ? "As notificações estão desativadas para o app nos ajustes do celular. Ative por lá para saber quando alguém curtir, comentar ou seguir você."
          : "Saiba na hora quando alguém curtir, comentar ou seguir você, mesmo com o app fechado."}
      </Text>
      <Button label={denied ? "Abrir ajustes" : "Ativar notificações"} onPress={denied ? openSettings : () => void request()} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, gap: 10, marginBottom: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16 },
  text: { fontSize: 13, lineHeight: 19 },
});
