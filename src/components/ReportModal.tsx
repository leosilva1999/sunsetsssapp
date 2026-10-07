import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/useTheme";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { REPORT_REASONS } from "../lib/reportReasons";
import type { ReportReason } from "../types/entities";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: { reason: ReportReason; details?: string }) => void;
  loading?: boolean;
}

// Denúncia de foto/comentário (seção 5.7) — mesmo fluxo pros dois alvos.
export function ReportModal({ visible, onClose, onSubmit, loading }: ReportModalProps) {
  const { colors, fonts, sunIconColor } = useTheme();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState("");

  const handleClose = () => {
    setReason(null);
    setDetails("");
    onClose();
  };

  const handleSubmit = () => {
    if (!reason) return;
    onSubmit({ reason, details: details.trim() || undefined });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Denunciar</Text>
            <Pressable onPress={handleClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Motivo</Text>
          <View style={styles.reasons}>
            {REPORT_REASONS.map((option) => {
              const selected = reason === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setReason(option.value)}
                  style={[
                    styles.reasonRow,
                    { borderColor: selected ? sunIconColor : colors.border, backgroundColor: colors.background },
                  ]}
                >
                  <Ionicons
                    name={selected ? "radio-button-on" : "radio-button-off"}
                    size={18}
                    color={selected ? sunIconColor : colors.textSecondary}
                  />
                  <Text style={[styles.reasonLabel, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextField
            label="Detalhes (opcional)"
            value={details}
            onChangeText={setDetails}
            placeholder="Conte mais, se quiser"
            multiline
            numberOfLines={3}
            maxLength={500}
          />

          <Button label="Enviar denúncia" onPress={handleSubmit} disabled={!reason} loading={loading} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20 },
  label: { fontSize: 13 },
  reasons: { gap: 8 },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: 12,
    padding: 12,
  },
  reasonLabel: { fontSize: 14 },
});
