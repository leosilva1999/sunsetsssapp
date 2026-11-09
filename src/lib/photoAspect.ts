// `PhotoResponse.width/height` (docs/API.md): tamanho em pixels da imagem COMO EXIBIDA (foto de
// celular em retrato já vem com os lados trocados). `null` em fotos enviadas antes do campo
// existir — aí cai no quadrado, que também reserva o espaço sem "pulo" de layout.
const MIN_RATIO = 0.75; // retrato mais alto que 3:4 é cortado (cover)
const MAX_RATIO = 1.78; // paisagem mais larga que 16:9 também

export function photoAspectRatio(photo: { width?: number | null; height?: number | null }, fallback = 1): number {
  const { width, height } = photo;
  if (!width || !height) return fallback;
  return Math.min(Math.max(width / height, MIN_RATIO), MAX_RATIO);
}
