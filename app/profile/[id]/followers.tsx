import { ActivityIndicator, FlatList, StyleSheet, Text } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { UserRow } from "@/src/components/UserRow";
import { useTheme } from "@/src/theme/useTheme";
import { useFollowers } from "@/src/hooks/useUserProfile";

// Seção 5.10 — sem botão de seguir aqui (isFollowedByCurrentUser não resolvido pra esta lista).
export default function FollowersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts, headerOptions } = useTheme();
  const query = useFollowers(id);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = query;
  const isOffline = query.fetchStatus === "paused";

  const users = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Seguidores", ...headerOptions }} />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <UserRow user={item} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isOffline
                ? "Sem conexão — verifique sua internet."
                : isError
                  ? "Não foi possível carregar os seguidores agora."
                  : "Ainda sem seguidores."}
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
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footerLoading: { marginVertical: 20 },
});
