import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../theme/useTheme";
import { cityTitle } from "./CityCard";
import { cityHref } from "../lib/routes";
import type { CityRankingItem } from "../types/entities";

interface CityRankCardProps {
  rank: number;
  item: CityRankingItem;
}

// Linha do ranking de cidades: o que ranqueia é a média das notas recebidas no período
// (`periodAvgRating`), não a média de sempre da cidade.
export function CityRankCard({ rank, item }: CityRankCardProps) {
  const { colors, fonts, sunIconColor } = useTheme();
  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(cityHref(item.city.slug))}
    >
      <Text style={[styles.rank, { color: colors.accent, fontFamily: fonts.mono }]}>{String(rank).padStart(2, "0")}</Text>
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.display }]} numberOfLines={1}>
          {cityTitle(item.city)}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          {item.periodRatingsCount} {item.periodRatingsCount === 1 ? "avaliação" : "avaliações"} no período
        </Text>
      </View>
      <View style={styles.rating}>
        <Text style={[styles.ratingText, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
          {item.periodAvgRating.toFixed(1)}
        </Text>
        <Ionicons name="star" size={14} color={sunIconColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  rank: { fontSize: 16, width: 26 },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 16 },
  meta: { fontSize: 12 },
  rating: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 15 },
});
