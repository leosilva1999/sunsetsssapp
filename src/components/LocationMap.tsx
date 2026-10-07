import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { useTheme } from "../theme/useTheme";
import { GOOGLE_MAPS_EMBED_KEY } from "../lib/env";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Mapa embutido via Google Maps Embed API (proposal-location-map-embed.md adaptada pra mobile —
// a proposta original é web, com <iframe> direto no React). O Embed API EXIGE estar dentro de
// um <iframe> de verdade — carregar a URL como navegação de topo da WebView (o que fizemos na
// primeira tentativa) dá "The Google Maps Embed API must be used in an iframe". Por isso aqui a
// WebView carrega um HTML local minúsculo que só contém o <iframe> apontando pro embed — do
// ponto de vista do Google, está "num iframe" de verdade, mesmo rodando dentro de uma WebView.
// Sempre lat/lng em `q`, nunca o nome do local (nome é só pro `title`/acessibilidade).
export function LocationMap({ latitude, longitude, name }: LocationMapProps) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);

  if (!GOOGLE_MAPS_EMBED_KEY) return null;

  const src = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_EMBED_KEY}&q=${latitude},${longitude}&zoom=14`;
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>html, body, iframe { margin: 0; padding: 0; width: 100%; height: 100%; border: 0; }</style>
  </head>
  <body>
    <iframe
      src="${src}"
      title="${escapeHtml(`Mapa de ${name}`)}"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      allowfullscreen
    ></iframe>
  </body>
</html>`;

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        onLoadEnd={() => setLoading(false)}
        accessibilityLabel={`Mapa de ${name}`}
      />
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", aspectRatio: 16 / 9, borderRadius: 16, overflow: "hidden" },
  webview: { flex: 1, backgroundColor: "transparent" },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
});
