import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/useTheme";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  /** Mostra o botão de olho pra alternar visibilidade (campos de senha). */
  isPassword?: boolean;
}

export function TextField({ label, error, isPassword, secureTextEntry, style, ...rest }: TextFieldProps) {
  const { colors, fonts } = useTheme();
  const [hidden, setHidden] = useState(isPassword ?? false);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.textPrimary, fontFamily: fonts.body }, style]}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isPassword ? hidden : secureTextEntry}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>
      {error ? <Text style={[styles.error, { color: colors.danger, fontFamily: fonts.body }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 52,
    gap: 8,
  },
  input: { flex: 1, fontSize: 16, paddingVertical: 10 },
  error: { fontSize: 12 },
});
