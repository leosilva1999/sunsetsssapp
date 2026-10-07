import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../theme/useTheme";
import type { User } from "../types/entities";

interface UserRowProps {
  user: User;
}

// Linha de usuário pras listas de seguidores/seguindo (seção 5.10) — sem botão de seguir aqui
// de propósito, `isFollowedByCurrentUser` vem sempre false nesses dois endpoints (gotcha #3).
export function UserRow({ user }: UserRowProps) {
  const { colors, fonts } = useTheme();

  return (
    <Pressable style={styles.row} onPress={() => router.push(`/profile/${user.id}`)}>
      {user.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="person" size={18} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]} numberOfLines={1}>
          {user.name}
        </Text>
        {user.bio ? (
          <Text style={[styles.bio, { color: colors.textSecondary, fontFamily: fonts.body }]} numberOfLines={1}>
            {user.bio}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  body: { flex: 1, gap: 2 },
  name: { fontSize: 15 },
  bio: { fontSize: 13 },
});
