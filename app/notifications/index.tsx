import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text } from "react-native";
import { Stack } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { NotificationRow } from "@/src/components/NotificationRow";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";
import { useMarkAllNotificationsRead, useNotificationsList, useUnreadCount } from "@/src/hooks/useNotifications";

// Seção 5.11 — lista mais recentes primeiro, "marcar todas como lidas", polling do badge (ver
// src/hooks/useNotifications.ts).
export default function NotificationsScreen() {
  const { colors, fonts, headerOptions } = useTheme();
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");

  const query = useNotificationsList();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = query;
  const isOffline = query.fetchStatus === "paused";
  const unreadCount = useUnreadCount();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.pages.flatMap((page) => page.items) ?? [];

  if (!isSignedIn) {
    return (
      <Screen edges={["top"]}>
        <Stack.Screen options={{ headerShown: true, title: "Notificações", ...headerOptions }} />
        <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          Entre na sua conta pra ver suas notificações.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Notificações", ...headerOptions }} />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => <NotificationRow notification={item} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListHeaderComponent={
          unreadCount.data && unreadCount.data.count > 0 ? (
            <Pressable onPress={() => markAllRead.mutate()} hitSlop={6} style={styles.markAllRow}>
              <Text style={[styles.markAllLabel, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>
                {markAllRead.isPending ? "Marcando..." : "Marcar todas como lidas"}
              </Text>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isOffline
                ? "Sem conexão — verifique sua internet."
                : isError
                  ? "Não foi possível carregar suas notificações agora."
                  : "Nenhuma notificação ainda."}
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
  content: { padding: 12, flexGrow: 1 },
  markAllRow: { alignItems: "flex-end", paddingHorizontal: 8, paddingBottom: 10 },
  markAllLabel: { fontSize: 13 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32, paddingHorizontal: 20 },
  footerLoading: { marginVertical: 20 },
});
