import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

import { useTheme } from "../theme/useTheme";
import { getCurrentLatLng, type LatLng } from "../lib/geo";
import { Button } from "./ui/Button";

interface LocationMapPickerProps {
  value: LatLng | null;
  onChange: (point: LatLng) => void;
}

// Centro do Brasil, bem afastado — só o enquadramento inicial antes de haver um pino.
const BRAZIL_REGION = { latitude: -14.2, longitude: -51.9, latitudeDelta: 30, longitudeDelta: 30 };
const CLOSE_DELTA = 0.01;

// Escolha das coordenadas de um local novo: toque no mapa ou arraste o pino, ou use a localização
// atual. Nada pede permissão sozinho — só o botão. Versão web em LocationMapPicker.web.tsx
// (react-native-maps não roda na web).
export function LocationMapPicker({ value, onChange }: LocationMapPickerProps) {
  const { colors, fonts } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useMyLocation = async () => {
    setError(null);
    setLocating(true);
    try {
      const point = await getCurrentLatLng();
      onChange(point);
      mapRef.current?.animateToRegion(
        { ...point, latitudeDelta: CLOSE_DELTA, longitudeDelta: CLOSE_DELTA },
        400
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível obter sua localização.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <MapView
        ref={mapRef}
        style={[styles.map, { borderColor: colors.border }]}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          value ? { ...value, latitudeDelta: CLOSE_DELTA, longitudeDelta: CLOSE_DELTA } : BRAZIL_REGION
        }
        onPress={(event) => onChange(event.nativeEvent.coordinate)}
      >
        {value && <Marker coordinate={value} draggable onDragEnd={(event) => onChange(event.nativeEvent.coordinate)} />}
      </MapView>
      <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fonts.body }]}>
        {value ? "Arraste o pino ou toque no mapa para ajustar." : "Toque no mapa para marcar o local."}
      </Text>
      {error ? <Text style={[styles.error, { color: colors.danger, fontFamily: fonts.body }]}>{error}</Text> : null}
      <Button
        label="Usar minha localização atual"
        variant="secondary"
        icon="navigate"
        onPress={useMyLocation}
        loading={locating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  map: { height: 240, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  hint: { fontSize: 12 },
  error: { fontSize: 12 },
});
