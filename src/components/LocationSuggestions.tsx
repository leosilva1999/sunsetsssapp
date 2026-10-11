import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/useTheme";
import type { SuggestionsError } from "../hooks/useLocationSuggestions";
import type { Location } from "../types/entities";

interface LocationSuggestionsProps {
  /** texto digitado, pra linha "Ver todos os resultados". */
  text: string;
  locations: Location[];
  isSearching: boolean;
  error: SuggestionsError;
  /** espaço livre acima do teclado — a lista rola dentro dele e o rodapé fica sempre visível. */
  maxHeight: number;
  onSelect: (location: Location) => void;
  onSeeAll: () => void;
}

// Conteúdo do dropdown de sugestões da Home — posicionamento/sobreposição ficam na tela.
export function LocationSuggestions({ text, locations, isSearching, error, maxHeight, onSelect, onSeeAll }: LocationSuggestionsProps) {
  const { colors, fonts, sunIconColor } = useTheme();

  const statusMessage =
    error === "rateLimited"
      ? "Muitas buscas seguidas — aguarde um instante."
      : error === "failed"
        ? "Não foi possível buscar agora."
        : locations.length === 0 && !isSearching
          ? "Nenhum local encontrado."
          : null;

  return (
    <View style={{ maxHeight }}>
      <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled style={styles.list}>
      {locations.map((location) => (
        <Pressable
          key={location.id}
          onPress={() => onSelect(location)}
          style={[styles.row, { borderBottomColor: colors.border }]}
        >
          <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
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
      ))}

      {isSearching && (
        <View style={styles.status}>
          <ActivityIndicator size="small" color={colors.textSecondary} />
          <Text style={[styles.statusText, { color: colors.textSecondary, fontFamily: fonts.body }]}>Buscando...</Text>
        </View>
      )}
      {statusMessage && (
        <View style={styles.status}>
          <Text style={[styles.statusText, { color: colors.textSecondary, fontFamily: fonts.body }]}>{statusMessage}</Text>
        </View>
      )}
      </ScrollView>

      <Pressable onPress={onSeeAll} style={styles.seeAll}>
        <Ionicons name="search" size={16} color={colors.accent} />
        <Text style={[styles.seeAllText, { color: colors.accent, fontFamily: fonts.bodyMedium }]} numberOfLines={1}>
          Ver todos os resultados para &quot;{text.trim()}&quot;
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flexShrink: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { flex: 1 },
  name: { fontSize: 14 },
  city: { fontSize: 12 },
  rating: { fontSize: 13 },
  status: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  statusText: { fontSize: 13 },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  seeAllText: { flex: 1, fontSize: 13 },
});
