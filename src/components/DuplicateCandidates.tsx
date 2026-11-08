import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQueries } from "@tanstack/react-query";

import { Button } from "./ui/Button";
import { useTheme } from "../theme/useTheme";
import { locationsApi } from "../api/locations";
import type { Location } from "../types/entities";

interface DuplicateCandidatesProps {
  /** `errors.candidateLocationIds` do 409 de `POST /locations` (até 5, os mais perto primeiro). */
  ids: string[];
  onSelect: (location: Location) => void;
  /** Reenvia o mesmo corpo com `confirmDistinct: true` (docs/API.md, "Duplicate check"). */
  onCreateAnyway: () => void;
  onBack: () => void;
  creating: boolean;
}

// "Já existe um local parecido": a API recusou o cadastro porque há um local a ≤150 m do pino, ou
// com o mesmo nome no município. A pessoa escolhe o existente ou confirma que é outro lugar.
export function DuplicateCandidates({ ids, onSelect, onCreateAnyway, onBack, creating }: DuplicateCandidatesProps) {
  const { colors, fonts, sunIconColor } = useTheme();
  const results = useQueries({
    queries: ids.map((id) => ({ queryKey: ["locations", "detail", id], queryFn: () => locationsApi.get(id) })),
  });

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>
        Já existe um local parecido
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fonts.body }]}>
        Encontramos locais perto do pino ou com o mesmo nome. É um deles?
      </Text>

      {results.map((result, index) => {
        if (result.isLoading) {
          return <ActivityIndicator key={ids[index]} color={colors.textSecondary} />;
        }
        const location = result.data;
        // Candidato que sumiu (404: removido/mesclado) simplesmente não aparece.
        if (!location) return null;
        return (
          <Pressable
            key={location.id}
            style={[styles.row, { backgroundColor: colors.surfaceAlt }]}
            onPress={() => onSelect(location)}
          >
            <Ionicons name="location" size={18} color={sunIconColor} />
            <View style={styles.rowText}>
              <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]} numberOfLines={1}>
                {location.name}
              </Text>
              <Text style={[styles.city, { color: colors.textSecondary, fontFamily: fonts.body }]} numberOfLines={1}>
                {location.city}
              </Text>
            </View>
            <Text style={[styles.rating, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
              {location.avgRating.toFixed(1)}
            </Text>
            <Ionicons name="star" size={12} color={sunIconColor} />
          </Pressable>
        );
      })}

      <Button label="É outro lugar — cadastrar mesmo assim" onPress={onCreateAnyway} loading={creating} />
      <Button label="Voltar" variant="ghost" onPress={onBack} disabled={creating} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14 },
  title: { fontSize: 16 },
  hint: { fontSize: 13, lineHeight: 18 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, padding: 12 },
  rowText: { flex: 1 },
  name: { fontSize: 14 },
  city: { fontSize: 12 },
  rating: { fontSize: 13 },
});
