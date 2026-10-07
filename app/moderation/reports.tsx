import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, router } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { RoleGate } from "@/src/components/ui/RoleGate";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/theme/useTheme";
import { useModerationReports, useResolveReport } from "@/src/hooks/useModeration";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { commentsApi } from "@/src/api/comments";
import { REPORT_REASONS } from "@/src/lib/reportReasons";
import type { Report, ReportStatus } from "@/src/types/entities";

const STATUS_TABS: { value: ReportStatus; label: string }[] = [
  { value: "Pending", label: "Pendentes" },
  { value: "Resolved", label: "Resolvidas" },
  { value: "Dismissed", label: "Descartadas" },
];

function reasonLabel(reason: Report["reason"]) {
  return REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;
}

function ReportsQueue() {
  const { colors, fonts, headerOptions } = useTheme();
  const [status, setStatus] = useState<ReportStatus>("Pending");

  const query = useModerationReports(status);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch, isRefetching } = query;
  const isOffline = query.fetchStatus === "paused";
  const resolveReport = useResolveReport();

  const reports = data?.pages.flatMap((page) => page.items) ?? [];

  const handleAction = (report: Report, newStatus: "Resolved" | "Dismissed") => {
    resolveReport.mutate(
      { id: report.id, status: newStatus },
      { onError: (error) => Alert.alert("Não foi possível atualizar", getErrorMessage(error, "Tente de novo.")) }
    );
  };

  const handleViewTarget = async (report: Report) => {
    if (report.targetType === "Photo") {
      router.push(`/photos/${report.targetId}`);
      return;
    }
    try {
      const comment = await commentsApi.get(report.targetId);
      router.push(`/photos/${comment.photoId}`);
    } catch {
      Alert.alert("Conteúdo indisponível", "Esse comentário pode já ter sido excluído.");
    }
  };

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Denúncias", ...headerOptions }} />
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListHeaderComponent={
          <View style={styles.tabs}>
            {STATUS_TABS.map((tab) => (
              <Pressable
                key={tab.value}
                onPress={() => setStatus(tab.value)}
                style={[styles.tabButton, { backgroundColor: status === tab.value ? colors.textPrimary : colors.surfaceAlt }]}
              >
                <Text
                  style={[
                    styles.tabButtonLabel,
                    { color: status === tab.value ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable onPress={() => handleViewTarget(item)}>
              <Text style={[styles.targetLine, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>
                {item.targetType === "Photo" ? "Foto" : "Comentário"} denunciado
              </Text>
            </Pressable>
            <Text style={[styles.meta, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Motivo: {reasonLabel(item.reason)} · por {item.reporterName}
            </Text>
            {item.details ? (
              <Text style={[styles.details, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                {item.details}
              </Text>
            ) : null}
            {item.status === "Pending" ? (
              <View style={styles.actions}>
                <Button
                  label="Resolver"
                  onPress={() => handleAction(item, "Resolved")}
                  loading={resolveReport.isPending}
                />
                <Button
                  label="Descartar"
                  variant="ghost"
                  onPress={() => handleAction(item, "Dismissed")}
                  loading={resolveReport.isPending}
                />
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isOffline
                ? "Sem conexão — verifique sua internet."
                : isError
                  ? "Não foi possível carregar as denúncias agora."
                  : "Nenhuma denúncia por aqui."}
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

export default function ReportsScreen() {
  return (
    <RoleGate allow={["Moderator", "Admin"]}>
      <ReportsQueue />
    </RoleGate>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1, gap: 12 },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 4 },
  tabButton: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  tabButtonLabel: { fontSize: 12 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 6, marginBottom: 12 },
  targetLine: { fontSize: 15 },
  meta: { fontSize: 12 },
  details: { fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: "row", gap: 10, marginTop: 6 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footerLoading: { marginVertical: 20 },
});
