import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/src/components/ui/Screen";
import { LocationRankCard } from "@/src/components/LocationRankCard";
import { CityRankCard } from "@/src/components/CityRankCard";
import { AdBanner } from "@/src/ads/AdBanner";
import { useTheme } from "@/src/theme/useTheme";
import { useLocationsRanking } from "@/src/hooks/useLocationsRanking";
import { useCitiesRanking } from "@/src/hooks/useCitiesBrowse";
import type { LocationRankingPeriod } from "@/src/types/api";

const PERIODS: { value: LocationRankingPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "all", label: "Todos" },
];

const KINDS = [
  { value: "locations", label: "Locais" },
  { value: "cities", label: "Cidades" },
] as const;

// Siglas das UFs pro filtro regional do ranking de locais (`GET /locations/ranking?state=`).
const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

// Seção 5.5: abas de período, lista ordenada por nota média — não paginado (array simples). Dois
// rankings: de locais (com filtro opcional por estado) e de cidades (média das notas do período).
export default function RankingScreen() {
  const { colors, fonts } = useTheme();
  const [kind, setKind] = useState<(typeof KINDS)[number]["value"]>("locations");
  const [period, setPeriod] = useState<LocationRankingPeriod>("all");
  const [state, setState] = useState<string | null>(null);

  const locations = useLocationsRanking(period, state);
  const cities = useCitiesRanking(period);
  const active = kind === "locations" ? locations : cities;
  const isOffline = active.fetchStatus === "paused";

  const pill = (key: string, label: string, selected: boolean, onPress: () => void) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[styles.tabButton, { backgroundColor: selected ? colors.textPrimary : colors.surfaceAlt }]}
    >
      <Text style={[styles.tabButtonLabel, { color: selected ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
        {label}
      </Text>
    </Pressable>
  );

  const header = (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>
        {kind === "locations" ? "Ranking de locais" : "Ranking de cidades"}
      </Text>
      <View style={styles.tabs}>{KINDS.map((k) => pill(k.value, k.label, kind === k.value, () => setKind(k.value)))}</View>
      <View style={styles.tabs}>{PERIODS.map((p) => pill(p.value, p.label, period === p.value, () => setPeriod(p.value)))}</View>
      {kind === "locations" ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {pill("all-states", "Brasil", state === null, () => setState(null))}
          {STATES.map((uf) => pill(uf, uf, state === uf, () => setState(state === uf ? null : uf)))}
        </ScrollView>
      ) : null}
      <AdBanner />
    </View>
  );

  const empty = !active.isLoading ? (
    <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
      {isOffline
        ? "Sem conexão — verifique sua internet."
        : active.isError
          ? "Não foi possível carregar o ranking agora."
          : state && kind === "locations"
            ? `Nenhum local avaliado em ${state} neste período.`
            : "Nenhuma avaliação neste período ainda."}
    </Text>
  ) : null;
  const footer = active.isLoading ? <ActivityIndicator style={styles.footerLoading} color={colors.textPrimary} /> : null;

  return (
    <Screen edges={["top"]}>
      {kind === "locations" ? (
        <FlatList
          key="locations"
          data={locations.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          renderItem={({ item, index }) => <LocationRankCard rank={index + 1} location={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onRefresh={locations.refetch}
          refreshing={locations.isRefetching}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          ListFooterComponent={footer}
        />
      ) : (
        <FlatList
          key="cities"
          data={cities.data ?? []}
          keyExtractor={(item) => item.city.id}
          contentContainerStyle={styles.content}
          renderItem={({ item, index }) => <CityRankCard rank={index + 1} item={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onRefresh={cities.refetch}
          refreshing={cities.isRefetching}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          ListFooterComponent={footer}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1 },
  header: { gap: 12, marginBottom: 16 },
  title: { fontSize: 26 },
  tabs: { flexDirection: "row", gap: 8 },
  tabButton: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
  tabButtonLabel: { fontSize: 13 },
  separator: { height: 10 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footerLoading: { marginVertical: 20 },
});
