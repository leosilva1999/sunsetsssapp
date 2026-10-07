import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useTheme } from "../theme/useTheme";
import { photosApi } from "../api/photos";
import { useAuthStore } from "../stores/authStore";
import { togglePhotoLikeInCache } from "../lib/photoLikeCache";
import type { Photo } from "../types/entities";

interface PhotoCardProps {
  photo: Photo;
  /** chave de query a invalidar/atualizar otimisticamente após curtir — varia por aba/tela. */
  queryKey: readonly unknown[];
}

export function PhotoCard({ photo, queryKey }: PhotoCardProps) {
  const { colors, fonts } = useTheme();
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  const queryClient = useQueryClient();

  // Curtir é um toque direto no card, otimista (seção 5.6).
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
    <Pressable style={styles.card} onPress={() => router.push(`/photos/${photo.id}`)}>
      <Image source={{ uri: photo.imageUrl }} style={styles.image} />
      {isSignedIn && (
        <Pressable
          style={[styles.likeButton, { backgroundColor: "rgba(0,0,0,0.35)" }]}
          onPress={() => toggleLike.mutate()}
          hitSlop={8}
        >
          <Ionicons
            name={photo.likedByCurrentUser ? "heart" : "heart-outline"}
            size={18}
            color={photo.likedByCurrentUser ? colors.accent : "#fff"}
          />
        </Pressable>
      )}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.location, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]} numberOfLines={1}>
          {photo.locationName}
        </Text>
        <View style={styles.counts}>
          <Ionicons name="heart-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.countText, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
            {photo.likesCount}
          </Text>
          <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} style={styles.commentIcon} />
          <Text style={[styles.countText, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
            {photo.commentsCount}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexBasis: "47%", flexGrow: 1, borderRadius: 16, overflow: "hidden", aspectRatio: 0.82 },
  image: { ...StyleSheet.absoluteFillObject },
  likeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 8, gap: 2 },
  location: { fontSize: 13 },
  counts: { flexDirection: "row", alignItems: "center", gap: 3 },
  countText: { fontSize: 11 },
  commentIcon: { marginLeft: 6 },
});
