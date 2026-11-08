import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../theme/useTheme";
import { cityHref } from "../lib/routes";
import type { City } from "../types/entities";

interface CityCardProps {
  city: City;
}

// "Imbituba - SC" (município) ou "Praia do Rosa, Imbituba - SC" (localidade).
export function cityTitle(city: Pick<City, "name" | "state" | "kind" | "parent">): string {
  return city.kind === "Locality" && city.parent
    ? `${city.name}, ${city.parent.name} - ${city.state}`
    : `${city.name} - ${city.state}`;
}

// Linha do índice de cidades (aba Explorar): capa, nome, contagens e nota média.
export function CityCard({ city }: CityCardProps) {
  const { colors, fonts, sunIconColor } = useTheme();
  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(cityHref(city.slug))}
    >
      {city.coverImageUrl ? (
        <Image source={{ uri: city.coverImageUrl }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverFallback, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="business-outline" size={22} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.display }]} numberOfLines={1}>
          {cityTitle(city)}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary, fontFamily: fonts.body }]} numberOfLines={1}>
          {city.locationsCount} {city.locationsCount === 1 ? "local" : "locais"} · {city.photosCount}{" "}
          {city.photosCount === 1 ? "foto" : "fotos"}
        </Text>
      </View>
      {city.avgRating != null ? (
        <View style={styles.rating}>
          <Text style={[styles.ratingText, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
            {city.avgRating.toFixed(1)}
          </Text>
          <Ionicons name="star" size={13} color={sunIconColor} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 10 },
  cover: { width: 56, height: 56, borderRadius: 12 },
  coverFallback: { alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 16 },
  meta: { fontSize: 12 },
  rating: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 14 },
});
