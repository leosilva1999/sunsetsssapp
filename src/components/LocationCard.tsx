import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../theme/useTheme";
import type { Location } from "../types/entities";

interface LocationCardProps {
  location: Location;
}

// Card da seção 5.3 (Explorar) — nome, cidade, nota média. Sem thumbnail (diferente do card de
// ranking, que usa um gradiente como placeholder visual).
export function LocationCard({ location }: LocationCardProps) {
  const { colors, fonts, sunIconColor } = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/locations/${location.id}`)}
    >
      <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.display }]} numberOfLines={1}>
        {location.name}
      </Text>
      <Text style={[styles.city, { color: colors.textSecondary, fontFamily: fonts.body }]} numberOfLines={1}>
        {location.city}
      </Text>
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
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 6,
  },
  name: { fontSize: 16 },
  city: { fontSize: 13 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  rating: { fontSize: 14 },
});
