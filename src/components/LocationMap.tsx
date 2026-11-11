import { Platform, StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { useTheme } from "../theme/useTheme";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

// Mapa do detalhe do local: mapa NATIVO (react-native-maps) só de leitura, com um pino — o mesmo
// SDK e a mesma chave Android do seletor de local. A versão anterior era uma WebView com o Google
// Maps Embed, que NÃO funciona com a chave restrita a "Apps Android": a WebView não envia
// package/SHA-1 e o Google responde "not authorized to use this API key (empty referer)".
// No Android usa `liteMode` (imagem estática leve, boa dentro de uma tela com rolagem); o toque
// que abre o app de Mapas é o link logo abaixo (na tela). No Expo Go o mapa do Android fica cinza
// (sem a nossa chave) — só aparece em build nativo. Versão web em LocationMap.web.tsx.
export function LocationMap({ latitude, longitude, name }: LocationMapProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        liteMode
        initialRegion={{ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        accessibilityLabel={`Mapa de ${name}`}
      >
        <Marker coordinate={{ latitude, longitude }} title={name} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", aspectRatio: 16 / 9, borderRadius: 16, overflow: "hidden" },
  map: { flex: 1 },
});
