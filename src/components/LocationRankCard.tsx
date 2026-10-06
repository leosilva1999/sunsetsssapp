import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../theme/useTheme";
import { placeholderGradientFor } from "../lib/placeholderGradient";
import type { Location } from "../types/entities";

interface LocationRankCardProps {
  rank: number;
  location: Location;
}

export function LocationRankCard({ rank, location }: LocationRankCardProps) {
  const { colors, fonts, sunIconColor } = useTheme();
  const [from, to] = placeholderGradientFor(location.id);

  return (
    <Pressable
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/locations/${location.id}`)}
    >
      <Text style={[styles.rank, { color: colors.accent, fontFamily: fonts.mono }]}>
        {String(rank).padStart(2, "0")}
      </Text>
      <LinearGradient colors={[from, to]} style={styles.thumb} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.display }]} numberOfLines={1}>
          {location.name}
        </Text>
        <Text style={[styles.city, { color: colors.textSecondary, fontFamily: fonts.mono }]} numberOfLines={1}>
          {location.city}
        </Text>
      </View>
      <View style={styles.ratingRow}>
        <Text style={[styles.rating, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
          {location.avgRating.toFixed(1)}
        </Text>
        <Ionicons name="star" size={14} color={sunIconColor} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rank: { fontSize: 15, width: 24 },
  thumb: { width: 48, height: 48, borderRadius: 12 },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16 },
  city: { fontSize: 11 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rating: { fontSize: 15 },
});
