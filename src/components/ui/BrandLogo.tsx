import { Image } from "react-native";

type LogoVariant = "horizontal" | "vertical" | "icon";

interface BrandLogoProps {
  variant?: LogoVariant;
  /** Altura em pt — a largura é derivada da proporção real do arquivo de cada variante. */
  height?: number;
}

const SOURCES: Record<LogoVariant, { source: number; aspectRatio: number }> = {
  // ícone + wordmark lado a lado — cabeçalhos de tela.
  horizontal: { source: require("../../../assets/images/brand-logo-horizontal.png"), aspectRatio: 400 / 100 },
  // ícone + wordmark empilhados — splash, telas centralizadas.
  vertical: { source: require("../../../assets/images/brand-logo-vertical.png"), aspectRatio: 1 },
  // só o disco do sol — espaços apertados (ex.: tab bar, favicon).
  icon: { source: require("../../../assets/images/brand-icon.png"), aspectRatio: 1 },
};

/** Logo oficial da marca (assets em `assets/images/`, originados de `novo_logo/`). */
export function BrandLogo({ variant = "horizontal", height = 28 }: BrandLogoProps) {
  const { source, aspectRatio } = SOURCES[variant];
  return <Image source={source} resizeMode="contain" style={{ height, width: height * aspectRatio }} />;
}
