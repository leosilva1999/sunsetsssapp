// Paleta extraída de `web_app_docs/mobile-app-spec.md` (seção 2) e das screenshots de
// referência. Tema claro é o padrão do app (ajustado — a spec original previa dark como
// padrão); o usuário pode alternar, ver `themeStore.ts`.

// Fixo nos dois temas — não varia com light/dark (seção 2).
export const sunIconColor = "#f86f02";

export const gradient = {
  twilightDeep: "#1e1038",
  twilightMid: "#2d1b4e",
  sunsetOrange: "#ff8c5a",
  sunsetOrangeDeep: "#e8622f",
  sunsetGold: "#ffcf6b",
  eveningPink: "#e85d8a",
};

// Laranja queimado do logo "Sunsetsss" (amostrado de assets/images/brand-logo-*.png) e um tom mais
// escuro da mesma família pro texto pequeno: sobre o gradiente dourado/laranja das telas de auth
// o laranja puro do logo dá ~3:1 de contraste (ok só pra título grande); o tom escuro chega a ~4,5:1.
export const brandOrange = "#c84008";
export const brandOrangeDeep = "#8a2c05";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textOnGradient: string;
  /** título sobre o gradiente das telas de auth — laranja do logo no claro, branco no escuro. */
  brandTitle: string;
  /** subtítulo sobre o gradiente das telas de auth — mesma família, mais escuro (legibilidade). */
  brandSubtitle: string;
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
  brandTitle: "#ffffff",
  brandSubtitle: "#fdf6ec",
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
  brandTitle: brandOrange,
  brandSubtitle: brandOrangeDeep,
  accent: gradient.eveningPink,
  danger: "#d64545",
  success: "#2f9e6e",
  // Dourado já no topo (antes começava em quase-branco) — menos branco, mais laranja, em
  // tom mais escuro na base. Ajustado a pedido do usuário.
  gradient: [gradient.sunsetGold, gradient.sunsetOrange, gradient.sunsetOrangeDeep],
};
