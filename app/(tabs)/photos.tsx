import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { Screen } from "@/src/components/ui/Screen";
import { PhotoFeedCard } from "@/src/components/PhotoFeedCard";
import { useTheme } from "@/src/theme/useTheme";
import { usePhotosFeed } from "@/src/hooks/usePhotosFeed";
import type { PhotoSort } from "@/src/types/api";
import type { Photo } from "@/src/types/entities";

// Seção 5.6: abas Recentes/Mais curtidas, feed paginado por cursor.
export default function PhotosFeedScreen() {
  const { colors, fonts } = useTheme();
  const [sort, setSort] = useState<PhotoSort>("recent");
  const queryKey = ["photos", "feed", sort] as const;

  const query = usePhotosFeed(sort);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = query;
  const isOffline = query.fetchStatus === "paused";

  const photos = useMemo<Photo[]>(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  return (
    <Screen edges={["top"]}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <PhotoFeedCard photo={item} queryKey={queryKey} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>
              Fotos da comunidade
            </Text>
            <View style={styles.tabs}>
              <TabButton label="Recentes" active={sort === "recent"} onPress={() => setSort("recent")} />
              <TabButton label="Mais curtidas" active={sort === "top"} onPress={() => setSort("top")} />
            </View>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isOffline
                ? "Sem conexão — verifique sua internet."
                : isError
                  ? "Não foi possível carregar as fotos agora."
                  : "Nenhuma foto publicada ainda."}
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

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, { backgroundColor: active ? colors.textPrimary : colors.surfaceAlt }]}
    >
      <Text
        style={[
          styles.tabButtonLabel,
          { color: active ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1 },
  header: { gap: 14, marginBottom: 16 },
  title: { fontSize: 26 },
  tabs: { flexDirection: "row", gap: 8 },
  tabButton: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9 },
  tabButtonLabel: { fontSize: 13 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footerLoading: { marginVertical: 20 },
});
