// Web: react-native-maps não suporta a plataforma — sem mapa (o link "Abrir no app de Mapas" da tela
// continua funcionando). O app é mobile-first; isto existe pra `expo export --platform web` não quebrar.
export function LocationMap(_props: { latitude: number; longitude: number; name: string }) {
  return null;
}
