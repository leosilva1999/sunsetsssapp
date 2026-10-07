import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { RoleGate } from "@/src/components/ui/RoleGate";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useUserSearch, useUpdateUserRole } from "@/src/hooks/useModeration";
import { getErrorMessage } from "@/src/lib/errorMessage";
import type { AuthUser, UserRole } from "@/src/types/entities";

const ROLES: UserRole[] = ["User", "Moderator", "Admin"];

function UsersAdmin() {
  const { colors, fonts, headerOptions } = useTheme();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const query = useUserSearch(debouncedSearch);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const isOffline = query.fetchStatus === "paused";
  const updateRole = useUpdateUserRole();

  const users = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const handleChangeRole = (user: AuthUser, role: UserRole) => {
    if (role === user.role) return;
    const warnSelf = user.id === currentUserId ? " Você está alterando seu próprio papel." : "";
    Alert.alert("Mudar papel", `Tornar ${user.name} ${role}?${warnSelf}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: () =>
          updateRole.mutate(
            { id: user.id, role },
            { onError: (error) => Alert.alert("Não foi possível mudar o papel", getErrorMessage(error, "Tente de novo.")) }
          ),
      },
    ]);
  };

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Usuários", ...headerOptions }} />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        ListHeaderComponent={
          <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nome ou e-mail..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.body }]}
              autoCapitalize="none"
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border }]}>
            <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>{item.name}</Text>
            <Text style={[styles.email, { color: colors.textSecondary, fontFamily: fonts.body }]}>{item.email}</Text>
            <View style={styles.roleRow}>
              {ROLES.map((role) => {
                const active = item.role === role;
                return (
                  <Pressable
                    key={role}
                    onPress={() => handleChangeRole(item, role)}
                    style={[styles.roleChip, { backgroundColor: active ? colors.textPrimary : colors.surfaceAlt }]}
                  >
                    <Text
                      style={[
                        styles.roleChipLabel,
                        { color: active ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium },
                      ]}
                    >
                      {role}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {isOffline
                ? "Sem conexão — verifique sua internet."
                : isError
                  ? "Não foi possível buscar usuários agora."
                  : debouncedSearch
                    ? "Nenhum usuário encontrado."
                    : "Digite um nome ou e-mail pra buscar."}
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

export default function UsersScreen() {
  return (
    <RoleGate allow={["Admin"]}>
      <UsersAdmin />
    </RoleGate>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, flexGrow: 1 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 16,
    minHeight: 48,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14 },
  card: { borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 14, marginBottom: 14, gap: 6 },
  name: { fontSize: 15 },
  email: { fontSize: 12 },
  roleRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  roleChip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  roleChipLabel: { fontSize: 12 },
  emptyText: { fontSize: 14, textAlign: "center", marginTop: 32 },
  footerLoading: { marginVertical: 20 },
});
