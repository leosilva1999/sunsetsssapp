import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/src/components/ui/Screen";
import { LocationRankCard } from "@/src/components/LocationRankCard";
import { useTheme } from "@/src/theme/useTheme";
import { useLocationsRanking } from "@/src/hooks/useLocationsRanking";
import type { LocationRankingPeriod } from "@/src/types/api";

const PERIODS: { value: LocationRankingPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
  { value: "all", label: "Todos" },
];

// Seção 5.5: abas de período, lista ordenada por nota média — não paginado (array simples).
export default function RankingScreen() {
  const { colors, fonts } = useTheme();
  const [period, setPeriod] = useState<LocationRankingPeriod>("all");

  const query = useLocationsRanking(period);
  const { data, isLoading, isError, refetch, isRefetching } = query;
  const isOffline = query.fetchStatus === "paused";

  return (
    <Screen edges={["top"]}>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item, index }) => <LocationRankCard rank={index + 1} location={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>
              Ranking de locais
            </Text>
            <View style={styles.tabs}>
              {PERIODS.map((p) => (
                <Pressable
                  key={p.value}
                  onPress={() => setPeriod(p.value)}
                  style={[
                    styles.tabButton,
                    { backgroundColor: period === p.value ? colors.textPrimary : colors.surfaceAlt },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabButtonLabel,
                      { color: period === p.value ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium },
                    ]}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isOffline
                ? "Sem conexão — verifique sua internet."
                : isError
                  ? "Não foi possível carregar o ranking agora."
                  : "Nenhuma avaliação neste período ainda."}
            </Text>
          ) : null
        }
        ListFooterComponent={isLoading ? <ActivityIndicator style={styles.footerLoading} color={colors.textPrimary} /> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1 },
  header: { gap: 14, marginBottom: 16 },
  title: { fontSize: 26 },
  tabs: { flexDirection: "row", gap: 8 },
  tabButton: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
  tabButtonLabel: { fontSize: 13 },
  separator: { height: 10 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footerLoading: { marginVertical: 20 },
});
