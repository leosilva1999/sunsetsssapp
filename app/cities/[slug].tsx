import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, router, useLocalSearchParams } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { LocationCard } from "@/src/components/LocationCard";
import { PhotoCard } from "@/src/components/PhotoCard";
import { ShareLinkButton } from "@/src/components/ShareLinkButton";
import { RatingStars } from "@/src/components/RatingStars";
import { cityTitle } from "@/src/components/CityCard";
import { useTheme } from "@/src/theme/useTheme";
import { siteLinks } from "@/src/lib/shareLinks";
import { cityHref } from "@/src/lib/routes";
import { ApiError } from "@/src/api/client";
import { useCity, useCityLocations, useCityPhotos, useCitySunset } from "@/src/hooks/useCitiesBrowse";
import type { Location, Photo } from "@/src/types/entities";

type Tab = "locations" | "photos";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// Página da cidade (ou localidade): `GET /cities/{slug}` traz tudo numa chamada — melhor local,
// localidades, contagens — e as abas Locais/Fotos listam os locais da cidade e as fotos de todos
// eles. 404 = cidade sem nada pra mostrar (a API não cria páginas vazias).
export default function CityScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { colors, fonts, sunIconColor, headerOptions } = useTheme();
  const [tab, setTab] = useState<Tab>("locations");

  const city = useCity(slug);
  const sunset = useCitySunset(slug);
  const locations = useCityLocations(slug);
  const photos = useCityPhotos(slug, tab === "photos");

  const locationItems = useMemo<Location[]>(() => locations.data?.pages.flatMap((page) => page.items) ?? [], [locations.data]);
  const photoItems = useMemo<Photo[]>(() => photos.data?.pages.flatMap((page) => page.items) ?? [], [photos.data]);
  const active = tab === "locations" ? locations : photos;

  const title = city.data ? cityTitle(city.data) : "Cidade";

  if (city.isLoading) {
    return (
      <Screen edges={["top"]}>
        <Stack.Screen options={{ headerShown: true, title, ...headerOptions }} />
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      </Screen>
    );
  }

  if (city.isError || !city.data) {
    const notFound = city.error instanceof ApiError && city.error.status === 404;
    return (
      <Screen edges={["top"]}>
        <Stack.Screen options={{ headerShown: true, title, ...headerOptions }} />
        <View style={styles.centerFill}>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.body, textAlign: "center", paddingHorizontal: 32 }}>
            {notFound ? "Esta cidade ainda não tem locais cadastrados." : "Não foi possível carregar esta cidade."}
          </Text>
        </View>
      </Screen>
    );
  }

  const data = city.data;

  const header = (
    <View style={styles.header}>
      {data.parent ? (
        <Pressable onPress={() => router.push(cityHref(data.parent!.slug))} hitSlop={6}>
          <Text style={[styles.breadcrumb, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>
            {data.parent.name} - {data.parent.state}
          </Text>
        </Pressable>
      ) : null}
      <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.display }]}>{cityTitle(data)}</Text>

      <View style={styles.statsRow}>
        {data.avgRating != null ? (
          <>
            <RatingStars value={Math.round(data.avgRating)} />
            <Text style={[styles.statText, { color: colors.textPrimary, fontFamily: fonts.mono }]}>{data.avgRating.toFixed(1)}</Text>
          </>
        ) : null}
        <Text style={[styles.statText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          {data.locationsCount} {data.locationsCount === 1 ? "local" : "locais"} · {data.photosCount}{" "}
          {data.photosCount === 1 ? "foto" : "fotos"} · {data.ratingsCount}{" "}
          {data.ratingsCount === 1 ? "avaliação" : "avaliações"}
        </Text>
      </View>

      <ShareLinkButton message={`${cityTitle(data)} no Sunsetsss`} url={siteLinks.city(slug)} />

      {sunset.data && !sunset.isError ? (
        <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
          <View style={styles.sunsetRow}>
            <Ionicons name="sunny" size={20} color={sunIconColor} />
            <Text style={[styles.sunsetText, { color: colors.textPrimary, fontFamily: fonts.displayBold }]}>
              Pôr do sol hoje às {formatTime(sunset.data.sunset)}
            </Text>
          </View>
          <Link href="https://sunrise-sunset.org" style={[styles.attribution, { color: colors.textSecondary }]}>
            Horários via sunrise-sunset.org
          </Link>
        </View>
      ) : null}

      {data.topLocation ? (
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}
          onPress={() => router.push(`/locations/${data.topLocation!.id}`)}
        >
          <Text style={[styles.cardLabel, { color: colors.textSecondary, fontFamily: fonts.mono }]}>MELHOR AVALIADO</Text>
          <View style={styles.topRow}>
            <Text style={[styles.topName, { color: colors.textPrimary, fontFamily: fonts.display }]} numberOfLines={1}>
              {data.topLocation.name}
            </Text>
            <Text style={[styles.statText, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
              {data.topLocation.avgRating.toFixed(1)}
            </Text>
            <Ionicons name="star" size={13} color={sunIconColor} />
          </View>
        </Pressable>
      ) : null}

      {data.localities.length > 0 ? (
        <View style={styles.localities}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary, fontFamily: fonts.mono }]}>LOCALIDADES</Text>
          <View style={styles.chips}>
            {data.localities.map((locality) => (
              <Pressable
                key={locality.slug}
                style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(cityHref(locality.slug))}
              >
                <Text style={[styles.chipText, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                  {locality.name} · {locality.locationsCount}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.tabs}>
        {(["locations", "photos"] as const).map((value) => (
          <Pressable
            key={value}
            onPress={() => setTab(value)}
            style={[styles.tabButton, { backgroundColor: tab === value ? colors.textPrimary : colors.surfaceAlt }]}
          >
            <Text style={[styles.tabLabel, { color: tab === value ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
              {value === "locations" ? "Locais" : "Fotos"}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      {active.isLoading || active.isFetchingNextPage ? <ActivityIndicator color={colors.textPrimary} /> : null}
      <Text
        style={[styles.attribution, { color: colors.textSecondary, textDecorationLine: "underline" }]}
        onPress={() => void Linking.openURL("https://www.geonames.org/")}
      >
        Dados geográficos: GeoNames (CC BY 4.0)
      </Text>
    </View>
  );

  const emptyText = (
    <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
      {tab === "locations" ? "Nenhum local por aqui ainda." : "Nenhuma foto por aqui ainda."}
    </Text>
  );

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title, ...headerOptions }} />
      {tab === "locations" ? (
        <FlatList
          key="locations"
          data={locationItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => <LocationCard location={item} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (locations.hasNextPage && !locations.isFetchingNextPage) void locations.fetchNextPage();
          }}
          ListHeaderComponent={header}
          ListEmptyComponent={locations.isLoading ? null : emptyText}
          ListFooterComponent={footer}
        />
      ) : (
        <FlatList
          key="photos"
          data={photoItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => <PhotoCard photo={item} queryKey={["cities", "detail", slug, "photos"]} />}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (photos.hasNextPage && !photos.isFetchingNextPage) void photos.fetchNextPage();
          }}
          ListHeaderComponent={header}
          ListEmptyComponent={photos.isLoading ? null : emptyText}
          ListFooterComponent={footer}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  header: { gap: 14, marginBottom: 16 },
  breadcrumb: { fontSize: 13 },
  name: { fontSize: 26 },
  statsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  statText: { fontSize: 13 },
  card: { borderRadius: 16, padding: 14, gap: 8 },
  cardLabel: { fontSize: 11, letterSpacing: 1 },
  sunsetRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sunsetText: { fontSize: 15 },
  attribution: { fontSize: 11 },
  topRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  topName: { flex: 1, fontSize: 17 },
  localities: { gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontSize: 12 },
  tabs: { flexDirection: "row", gap: 8, marginTop: 4 },
  tabButton: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8 },
  tabLabel: { fontSize: 13 },
  row: { gap: 10, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 24 },
  footer: { alignItems: "center", gap: 12, marginTop: 16 },
});

