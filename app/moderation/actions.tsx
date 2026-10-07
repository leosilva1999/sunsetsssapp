import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { RoleGate } from "@/src/components/ui/RoleGate";
import { useTheme } from "@/src/theme/useTheme";
import { useModerationActions } from "@/src/hooks/useModeration";
import type { ModerationActionType } from "@/src/types/entities";

const ACTION_LABELS: Record<ModerationActionType, string> = {
  PhotoDeleted: "Foto excluída",
  CommentDeleted: "Comentário excluído",
  ReportResolved: "Denúncia resolvida",
  ReportDismissed: "Denúncia descartada",
  LegalDocumentUpdated: "Documento legal atualizado",
  UserRoleChanged: "Papel de usuário alterado",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function ActionsLog() {
  const { colors, fonts, headerOptions } = useTheme();
  const query = useModerationActions();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = query;
  const isOffline = query.fetchStatus === "paused";

  const actions = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Histórico de ações", ...headerOptions }} />
      <FlatList
        data={actions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border }]}>
            <Text style={[styles.actionType, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>
              {ACTION_LABELS[item.actionType]}
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {item.moderatorName} · {item.targetDescription} · {formatDate(item.createdAt)}
            </Text>
            {item.notes ? (
              <Text style={[styles.notes, { color: colors.textPrimary, fontFamily: fonts.body }]}>{item.notes}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isOffline
                ? "Sem conexão — verifique sua internet."
                : isError
                  ? "Não foi possível carregar o histórico agora."
                  : "Nenhuma ação registrada ainda."}
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

export default function ActionsScreen() {
  return (
    <RoleGate allow={["Moderator", "Admin"]}>
      <ActionsLog />
    </RoleGate>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1 },
  card: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 12, marginBottom: 12, gap: 4 },
  actionType: { fontSize: 14 },
  meta: { fontSize: 12 },
  notes: { fontSize: 13 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footerLoading: { marginVertical: 20 },
});
