import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Screen } from "./ui/Screen";
import { CityCard } from "./CityCard";
import { ExploreModeSwitch, type ExploreMode } from "./ExploreModeSwitch";
import { AdBanner } from "../ads/AdBanner";
import { useTheme } from "../theme/useTheme";
import { useCitiesList } from "../hooks/useCitiesBrowse";
import type { City } from "../types/entities";

interface CitiesExplorerProps {
  onModeChange: (mode: ExploreMode) => void;
}

// Aba Explorar no modo "Cidades": índice de cidades (com locais) e busca por nome. Cada cidade
// abre a página dela (`/cities/[slug]`).
export function CitiesExplorer({ onModeChange }: CitiesExplorerProps) {
  const { colors, fonts } = useTheme();
  const [search, setSearch] = useState("");
  const query = useCitiesList(search);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = query;
  const cities = useMemo<City[]>(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  return (
    <Screen edges={["top"]}>
      <FlatList
        data={cities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <CityCard city={item} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onRefresh={refetch}
        refreshing={isRefetching}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Explorar cidades</Text>
            <ExploreModeSwitch mode="cities" onChange={onModeChange} />
            <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar cidade ou localidade..."
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
            <AdBanner />
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isError
                ? "Não foi possível carregar as cidades agora."
                : search.trim().length >= 2
                  ? "Nenhuma cidade encontrada."
                  : "Nenhuma cidade com locais ainda."}
            </Text>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {isLoading || isFetchingNextPage ? <ActivityIndicator color={colors.textPrimary} /> : null}
            <Text
              style={[styles.attribution, { color: colors.textSecondary, fontFamily: fonts.body }]}
              onPress={() => void Linking.openURL("https://www.geonames.org/")}
            >
              Dados geográficos: GeoNames (CC BY 4.0)
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1 },
  header: { gap: 14, marginBottom: 16 },
  title: { fontSize: 26 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, minHeight: 48 },
  searchInput: { flex: 1, fontSize: 14 },
  separator: { height: 10 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footer: { alignItems: "center", gap: 12, marginVertical: 20 },
  attribution: { fontSize: 11, textDecorationLine: "underline" },
});
