import { useColorScheme } from "react-native";
import { useThemeStore } from "./themeStore";
import { darkColors, lightColors, sunIconColor, type ThemeColors } from "./colors";
import { fonts } from "./typography";

export interface Theme {
  scheme: "dark" | "light";
  colors: ThemeColors;
  fonts: typeof fonts;
  sunIconColor: string;
  /** Opções pro header nativo (`<Stack.Screen options={{ ...headerOptions, title }} />`) —
   *  por padrão o header do React Navigation não segue o tema do app. */
  headerOptions: {
    headerStyle: { backgroundColor: string };
    headerTintColor: string;
    headerTitleStyle: { fontFamily: string };
    headerShadowVisible: boolean;
  };
}

export function useTheme(): Theme {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();

  const scheme = preference === "system" ? (systemScheme ?? "light") : preference;
  const colors = scheme === "dark" ? darkColors : lightColors;

  return {
    scheme,
    colors,
    fonts,
    sunIconColor,
    headerOptions: {
      headerStyle: { backgroundColor: colors.surface },
      headerTintColor: colors.textPrimary,
      headerTitleStyle: { fontFamily: fonts.bodyBold },
      headerShadowVisible: false,
    },
  };
}
