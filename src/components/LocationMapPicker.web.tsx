import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";
import { getCurrentLatLng, type LatLng } from "../lib/geo";
import { Button } from "./ui/Button";

interface LocationMapPickerProps {
  value: LatLng | null;
  onChange: (point: LatLng) => void;
}

// Web: react-native-maps não suporta a plataforma, então sem mapa — só a localização atual do
// navegador. O app é mobile-first; isso existe pra `expo export --platform web` não quebrar.
export function LocationMapPicker({ value, onChange }: LocationMapPickerProps) {
  const { colors, fonts } = useTheme();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useMyLocation = async () => {
    setError(null);
    setLocating(true);
    try {
      onChange(await getCurrentLatLng());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível obter sua localização.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fonts.body }]}>
        {value
          ? `Localização marcada: ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
          : "O mapa só está disponível no app. Use sua localização atual."}
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
  hint: { fontSize: 12 },
  error: { fontSize: 12 },
});
