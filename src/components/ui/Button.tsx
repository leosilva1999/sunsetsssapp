import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { useTheme } from "../../theme/useTheme";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends Omit<PressableProps, "style"> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  /** Ícone opcional à esquerda do texto (ex.: "logo-google" no botão de login social). */
  icon?: ComponentProps<typeof Ionicons>["name"];
  /** Ícone colorido próprio (ex.: o "G" do Google) no lugar de `icon`, que é de uma cor só. */
  iconElement?: ReactNode;
  /** Sobrescreve a cor de fundo e a do texto da variante (ex.: o botão "Entrar" azul do login). */
  backgroundColor?: string;
  labelColor?: string;
}

export function Button({
  label,
  variant = "primary",
  loading,
  disabled,
  icon,
  iconElement,
  backgroundColor: backgroundOverride,
  labelColor,
  ...rest
}: ButtonProps) {
  const { colors, fonts } = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    backgroundOverride ??
    (variant === "primary" ? colors.textPrimary : variant === "secondary" ? colors.surfaceAlt : "transparent");
  const textColor =
    labelColor ??
    (variant === "primary" ? colors.background : variant === "secondary" ? colors.textPrimary : colors.textPrimary);
  const borderColor = variant === "ghost" ? colors.border : "transparent";

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === "ghost" ? StyleSheet.hairlineWidth * 2 : 0,
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
        },
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {iconElement ? <View style={styles.icon}>{iconElement}</View> : null}
          {!iconElement && icon ? <Ionicons name={icon} size={18} color={textColor} style={styles.icon} /> : null}
          <Text style={[styles.label, { color: textColor, fontFamily: fonts.bodyBold }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
  },
});
