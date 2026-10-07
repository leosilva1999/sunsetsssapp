import { useMemo } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Button } from "./ui/Button";
import { PhotoCard } from "./PhotoCard";
import { useTheme } from "../theme/useTheme";
import { useAuthStore } from "../stores/authStore";
import { useToggleFollow, useUserPhotos, useUserProfile } from "../hooks/useUserProfile";
import type { Photo } from "../types/entities";

function formatJoinDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

interface ProfileContentProps {
  userId: string;
}

// Perfil completo (seção 5.9) — usado tanto na aba Perfil (sempre o próprio usuário) quanto em
// `/profile/{id}` (perfil de terceiros, empilhado com header nativo). Mesmo componente, só muda
// quem está olhando: "Editar perfil"/"Postar foto" no próprio, "Seguir/Seguindo" no de outros.
export function ProfileContent({ userId }: ProfileContentProps) {
  const { colors, fonts } = useTheme();
  const currentUser = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  const isOwnProfile = currentUser?.id === userId;

  const profile = useUserProfile(userId);
  const photos = useUserPhotos(userId);
  const toggleFollow = useToggleFollow(userId);

  const photoItems = useMemo<Photo[]>(() => photos.data?.pages.flatMap((page) => page.items) ?? [], [photos.data]);

  if (profile.isLoading) {
    return (
      <View style={styles.centerFill}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <View style={styles.centerFill}>
        <Text style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
          Não foi possível carregar este perfil.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photoItems}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.photoRow}
      contentContainerStyle={styles.content}
      renderItem={({ item }) => <PhotoCard photo={item} queryKey={["users", userId, "photos"]} />}
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (photos.hasNextPage && !photos.isFetchingNextPage) photos.fetchNextPage();
      }}
      ListHeaderComponent={
        <View style={styles.header}>
          {profile.data.avatarUrl ? (
            <Image source={{ uri: profile.data.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="person" size={36} color={colors.textSecondary} />
            </View>
          )}
          <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.display }]}>
            {profile.data.name}
          </Text>
          <Text style={[styles.joinDate, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
            Entrou em {formatJoinDate(profile.data.createdAt)}
          </Text>
          {profile.data.bio ? (
            <Text style={[styles.bio, { color: colors.textPrimary, fontFamily: fonts.body }]}>{profile.data.bio}</Text>
          ) : null}

          <View style={styles.countsRow}>
            <Pressable onPress={() => router.push(`/profile/${userId}/followers`)} style={styles.countItem}>
              <Text style={[styles.countValue, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>
                {profile.data.followersCount}
              </Text>
              <Text style={[styles.countLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                seguidores
              </Text>
            </Pressable>
            <Pressable onPress={() => router.push(`/profile/${userId}/following`)} style={styles.countItem}>
              <Text style={[styles.countValue, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>
                {profile.data.followingCount}
              </Text>
              <Text style={[styles.countLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                seguindo
              </Text>
            </Pressable>
          </View>

          {isOwnProfile ? (
            <View style={styles.ownActions}>
              <View style={styles.ownActionItem}>
                <Button label="Postar foto" onPress={() => router.push("/photos/new")} />
              </View>
              <View style={styles.ownActionItem}>
                <Button label="Editar perfil" variant="secondary" onPress={() => router.push("/profile/edit")} />
              </View>
            </View>
          ) : isSignedIn ? (
            <Button
              label={profile.data.isFollowedByCurrentUser ? "Seguindo" : "Seguir"}
              variant={profile.data.isFollowedByCurrentUser ? "secondary" : "primary"}
              onPress={() => toggleFollow.mutate(!profile.data!.isFollowedByCurrentUser)}
            />
          ) : null}

          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>Fotos</Text>
        </View>
      }
      ListEmptyComponent={
        !photos.isLoading ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
            Nenhuma foto publicada ainda.
          </Text>
        ) : null
      }
      ListFooterComponent={
        photos.isLoading || photos.isFetchingNextPage ? (
          <ActivityIndicator style={styles.footerLoading} color={colors.textPrimary} />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  header: { alignItems: "center", gap: 6, marginBottom: 20 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { width: 88, height: 88, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 22, marginTop: 8 },
  joinDate: { fontSize: 12 },
  bio: { fontSize: 14, textAlign: "center", marginTop: 4 },
  countsRow: { flexDirection: "row", gap: 28, marginTop: 14, marginBottom: 16 },
  countItem: { alignItems: "center" },
  countValue: { fontSize: 16 },
  countLabel: { fontSize: 12 },
  ownActions: { flexDirection: "row", gap: 10, width: "100%" },
  ownActionItem: { flex: 1 },
  sectionTitle: { fontSize: 18, alignSelf: "flex-start", marginTop: 20, marginBottom: 2 },
  photoRow: { gap: 10 },
  emptyText: { fontSize: 13, textAlign: "center", marginTop: 12 },
  footerLoading: { marginVertical: 20 },
});
