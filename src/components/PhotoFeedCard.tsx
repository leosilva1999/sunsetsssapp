import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTheme } from "../theme/useTheme";
import { photosApi } from "../api/photos";
import { useAuthStore } from "../stores/authStore";
import { togglePhotoLikeInCache } from "../lib/photoLikeCache";
import type { Photo } from "../types/entities";

interface PhotoFeedCardProps {
  photo: Photo;
  queryKey: readonly unknown[];
}

// Card do feed completo (seção 5.6) — mais informação que o card compacto da Home/Explorar:
// autor (avatar+nome, clicável → perfil), "{local}, {cidade}", prévia da legenda.
export function PhotoFeedCard({ photo, queryKey }: PhotoFeedCardProps) {
  const { colors, fonts } = useTheme();
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: () => (photo.likedByCurrentUser ? photosApi.unlike(photo.id) : photosApi.like(photo.id)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      togglePhotoLikeInCache(queryClient, queryKey, photo.id);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
  });

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/photos/${photo.id}`)}
    >
      <Pressable style={styles.authorRow} onPress={() => router.push(`/profile/${photo.userId}`)} hitSlop={4}>
        {photo.userAvatarUrl ? (
          <Image source={{ uri: photo.userAvatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="person" size={14} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.authorText}>
          <Text style={[styles.authorName, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]} numberOfLines={1}>
            {photo.userName}
          </Text>
          <Text style={[styles.locationLine, { color: colors.textSecondary, fontFamily: fonts.body }]} numberOfLines={1}>
            em {photo.locationName}, {photo.city}
          </Text>
        </View>
      </Pressable>

      <Image source={{ uri: photo.imageUrl }} style={styles.image} />

      <View style={styles.footer}>
        <View style={styles.counts}>
          {isSignedIn ? (
            <Pressable onPress={() => toggleLike.mutate()} hitSlop={8} style={styles.countItem}>
              <Ionicons
                name={photo.likedByCurrentUser ? "heart" : "heart-outline"}
                size={20}
                color={photo.likedByCurrentUser ? colors.accent : colors.textSecondary}
              />
              <Text style={[styles.countText, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
                {photo.likesCount}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.countItem}>
              <Ionicons name="heart-outline" size={20} color={colors.textSecondary} />
              <Text style={[styles.countText, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
                {photo.likesCount}
              </Text>
            </View>
          )}
          <View style={styles.countItem}>
            <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.countText, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
              {photo.commentsCount}
            </Text>
          </View>
        </View>

        {photo.caption ? (
          <Text style={[styles.caption, { color: colors.textPrimary, fontFamily: fonts.body }]} numberOfLines={2}>
            <Text style={{ fontFamily: fonts.bodyBold }}>{photo.userName} </Text>
            {photo.caption}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden", marginBottom: 16 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  authorText: { flex: 1, gap: 1 },
  authorName: { fontSize: 14 },
  locationLine: { fontSize: 12 },
  image: { width: "100%", aspectRatio: 1 },
  footer: { padding: 12, gap: 6 },
  counts: { flexDirection: "row", gap: 16 },
  countItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  countText: { fontSize: 13 },
  caption: { fontSize: 13, lineHeight: 18 },
});
