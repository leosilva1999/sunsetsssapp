import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { LocationCard } from "@/src/components/LocationCard";
import { useTheme } from "@/src/theme/useTheme";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useLocationsSearch } from "@/src/hooks/useLocationsSearch";
import { NEARBY_DEFAULT_RADIUS_KM, NEARBY_RADIUS_OPTIONS_KM, useNearbyLocation } from "@/src/hooks/useNearbyLocation";
import type { Location } from "@/src/types/entities";

// Seção 5.3: busca instantânea (debounced no client — 3+ chars é FULLTEXT por prefixo de
// palavra no backend, <3 chars cai pra substring) + grid de cards.
export default function ExploreScreen() {
  const { colors, fonts } = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();
  const [search, setSearch] = useState(params.q ?? "");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  // "Perto de mim" só liga ao toque no chip (pede permissão nesse momento, não na abertura).
  const nearby = useNearbyLocation();
  const [radius, setRadius] = useState(NEARBY_DEFAULT_RADIUS_KM);
  const nearbyOn = nearby.status === "ready" && nearby.coords !== null;

  const query = useLocationsSearch(debouncedSearch, nearby.coords && nearbyOn ? { ...nearby.coords, radius } : null);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = query;
  // Sem conexão (NetInfo) — não é a mesma coisa que erro de servidor. Ver docs do TanStack
  // Query sobre `networkMode`/`fetchStatus: "paused"`.
  const isOffline = query.fetchStatus === "paused";

  const locations = useMemo<Location[]>(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  return (
    <Screen edges={["top"]}>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <LocationCard location={item} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>
              Explorar locais
            </Text>
            <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por cidade, praia ou mirante..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.body }]}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>
            <View style={styles.chipRow}>
              <Pressable
                onPress={nearbyOn ? nearby.deactivate : nearby.activate}
                disabled={nearby.status === "loading"}
                style={[
                  styles.chip,
                  {
                    backgroundColor: nearbyOn ? colors.accent : colors.surface,
                    borderColor: nearbyOn ? colors.accent : colors.border,
                  },
                ]}
              >
                {nearby.status === "loading" ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <Ionicons name="navigate" size={14} color={nearbyOn ? "#ffffff" : colors.textPrimary} />
                )}
                <Text
                  style={[styles.chipText, { color: nearbyOn ? "#ffffff" : colors.textPrimary, fontFamily: fonts.body }]}
                >
                  Perto de mim
                </Text>
              </Pressable>
              {nearbyOn &&
                NEARBY_RADIUS_OPTIONS_KM.map((km) => {
                  const selected = km === radius;
                  return (
                    <Pressable
                      key={km}
                      onPress={() => setRadius(km)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: selected ? colors.surfaceAlt : colors.surface,
                          borderColor: selected ? colors.accent : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.chipText, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                        {km} km
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
            {nearby.status === "denied" && (
              <Text style={[styles.hint, { color: colors.danger, fontFamily: fonts.body }]}>
                Permissão de localização negada — libere nas configurações do celular pra ver locais perto de você.
              </Text>
            )}
            {nearby.status === "error" && (
              <Text style={[styles.hint, { color: colors.danger, fontFamily: fonts.body }]}>
                Não foi possível obter sua localização agora. Tente novamente.
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isOffline
                ? "Sem conexão — verifique sua internet."
                : isError
                  ? "Não foi possível carregar os locais agora."
                  : nearbyOn
                    ? `Nenhum local em até ${radius} km${debouncedSearch ? " com essa busca" : ""} — tente um raio maior.`
                    : debouncedSearch
                      ? "Nenhum local encontrado."
                      : "Nenhum local cadastrado ainda."}
            </Text>
          ) : null
        }
        ListFooterComponent={
          isLoading || isFetchingNextPage ? (
            <ActivityIndicator style={styles.footerLoading} color={colors.textPrimary} />
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1 },
  header: { gap: 16, marginBottom: 16 },
  title: { fontSize: 26 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  chipText: { fontSize: 13 },
  hint: { fontSize: 13 },
  row: { gap: 10, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footerLoading: { marginVertical: 20 },
});
