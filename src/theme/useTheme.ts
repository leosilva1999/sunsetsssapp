import { useColorScheme } from "react-native";
import { useThemeStore } from "./themeStore";
import { darkColors, lightColors, sunIconColor, type ThemeColors } from "./colors";
import { fonts } from "./typography";

export interface Theme {
  scheme: "dark" | "light";
  colors: ThemeColors;
  fonts: typeof fonts;
  sunIconColor: string;
}

export function useTheme(): Theme {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useColorScheme();

  const scheme = preference === "system" ? (systemScheme ?? "dark") : preference;

  return {
    scheme,
    colors: scheme === "dark" ? darkColors : lightColors,
    fonts,
    sunIconColor,
  };
}
