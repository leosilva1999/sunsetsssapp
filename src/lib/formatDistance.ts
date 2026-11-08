// "850 m" abaixo de 1 km, "2,4 km" acima (vírgula decimal, pt-BR).
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace(".", ",")} km`;
}
