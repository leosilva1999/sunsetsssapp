// Paleta extraída de `web_app_docs/mobile-app-spec.md` (seção 2) e das screenshots de
// referência. Tema claro é o padrão do app (ajustado — a spec original previa dark como
// padrão); o usuário pode alternar, ver `themeStore.ts`.

// Fixo nos dois temas — não varia com light/dark (seção 2).
export const sunIconColor = "#f86f02";

export const gradient = {
  twilightDeep: "#1e1038",
  twilightMid: "#2d1b4e",
  sunsetOrange: "#ff8c5a",
  sunsetGold: "#ffcf6b",
  eveningPink: "#e85d8a",
};

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textOnGradient: string;
  accent: string; // rosa de entardecer — CTAs secundários, badges
  danger: string;
  success: string;
  gradient: [string, string, ...string[]];
}

export const darkColors: ThemeColors = {
  background: "#17102a",
  surface: "#241836",
  surfaceAlt: "#2d1b4e",
  border: "#3c2a5c",
  textPrimary: "#fdf6ec",
  textSecondary: "#c9bddb",
  textOnGradient: "#fdf6ec",
  accent: gradient.eveningPink,
  danger: "#ff6b6b",
  success: "#5fd6a4",
  gradient: [gradient.twilightDeep, gradient.twilightMid, gradient.sunsetOrange],
};

export const lightColors: ThemeColors = {
  background: "#fff9f2",
  surface: "#ffffff",
  surfaceAlt: "#fff3e4",
  border: "#f0e2cf",
  textPrimary: "#1e1038",
  textSecondary: "#6b5e80",
  textOnGradient: "#1e1038",
  accent: gradient.eveningPink,
  danger: "#d64545",
  success: "#2f9e6e",
  gradient: ["#fff9f2", gradient.sunsetGold, gradient.sunsetOrange],
};
