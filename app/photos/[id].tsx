import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router, useLocalSearchParams } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { Button } from "@/src/components/ui/Button";
import { ReportModal } from "@/src/components/ReportModal";
import { CommentItem } from "@/src/components/CommentThread";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";
import { getErrorMessage } from "@/src/lib/errorMessage";
import { useUserProfile, useToggleFollow } from "@/src/hooks/useUserProfile";
import {
  useCreateComment,
  useDeletePhoto,
  usePhoto,
  usePhotoComments,
  useTogglePhotoLike,
} from "@/src/hooks/usePhotoDetail";
import { moderationApi } from "@/src/api/moderation";
import { useMutation } from "@tanstack/react-query";
import type { ReportReason } from "@/src/types/entities";

export default function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts, headerOptions } = useTheme();
  const currentUser = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");

  const photo = usePhoto(id);
  const author = useUserProfile(photo.data?.userId);
  const toggleLike = useTogglePhotoLike(id);
  const toggleFollow = useToggleFollow(photo.data?.userId ?? "");
  const deletePhoto = useDeletePhoto();
  const comments = usePhotoComments(id);
  const createComment = useCreateComment(id);

  const [reportOpen, setReportOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const reportPhoto = useMutation({
    mutationFn: (payload: { reason: ReportReason; details?: string }) => moderationApi.reportPhoto(id, payload),
    onSuccess: () => {
      setReportOpen(false);
      Alert.alert("Denúncia enviada", "Obrigado — nossa equipe vai revisar.");
    },
    onError: (error) => Alert.alert("Não foi possível denunciar", getErrorMessage(error, "Tente de novo.")),
  });

  if (photo.isLoading) {
    return (
      <Screen edges={["top"]}>
        <Stack.Screen options={{ headerShown: true, title: "Foto", ...headerOptions }} />
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      </Screen>
    );
  }

  if (photo.isError || !photo.data) {
    return (
      <Screen edges={["top"]}>
        <Stack.Screen options={{ headerShown: true, title: "Foto", ...headerOptions }} />
        <View style={styles.centerFill}>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
            Não foi possível carregar esta foto.
          </Text>
        </View>
      </Screen>
    );
  }

  const data = photo.data;
  const isOwnPhoto = currentUser?.id === data.userId;
  const canDelete = isOwnPhoto || currentUser?.role === "Moderator" || currentUser?.role === "Admin";

  const handleDeletePhoto = () => {
    Alert.alert("Excluir foto", "Tem certeza que quer excluir esta foto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () =>
          deletePhoto.mutate(data.id, {
            onSuccess: () => router.back(),
            onError: (error) => Alert.alert("Não foi possível excluir", getErrorMessage(error, "Tente de novo.")),
          }),
      },
    ]);
  };

  const handleSendComment = () => {
    const content = commentText.trim();
    if (!content) return;
    createComment.mutate(
      { content },
      {
        onSuccess: () => setCommentText(""),
        onError: (error) => Alert.alert("Não foi possível comentar", getErrorMessage(error, "Tente de novo.")),
      }
    );
  };

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Foto", ...headerOptions }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: data.imageUrl }} style={styles.image} />

        <View style={styles.row}>
          <Pressable style={styles.authorRow} onPress={() => router.push(`/profile/${data.userId}`)}>
            {data.userAvatarUrl ? (
              <Image source={{ uri: data.userAvatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}>
                <Ionicons name="person" size={16} color={colors.textSecondary} />
              </View>
            )}
            <Text style={[styles.authorName, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>
              {data.userName}
            </Text>
          </Pressable>

          {isSignedIn && !isOwnPhoto && author.data ? (
            <Button
              label={author.data.isFollowedByCurrentUser ? "Seguindo" : "Seguir"}
              variant={author.data.isFollowedByCurrentUser ? "secondary" : "primary"}
              onPress={() => toggleFollow.mutate(!author.data!.isFollowedByCurrentUser)}
            />
          ) : null}
        </View>

        <View style={styles.likeRow}>
          {isSignedIn ? (
            <Pressable onPress={() => toggleLike.mutate()} hitSlop={8} style={styles.likeButton}>
              <Ionicons
                name={data.likedByCurrentUser ? "heart" : "heart-outline"}
                size={26}
                color={data.likedByCurrentUser ? colors.accent : colors.textPrimary}
              />
              <Text style={[styles.likeCount, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
                {data.likesCount}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.likeButton}>
              <Ionicons name="heart-outline" size={26} color={colors.textPrimary} />
              <Text style={[styles.likeCount, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
                {data.likesCount}
              </Text>
            </View>
          )}
        </View>

        <Pressable onPress={() => router.push(`/locations/${data.locationId}`)}>
          <Text style={[styles.location, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
            {data.locationName}, {data.city}
          </Text>
        </Pressable>

        {data.caption ? (
          <Text style={[styles.caption, { color: colors.textPrimary, fontFamily: fonts.body }]}>{data.caption}</Text>
        ) : null}

        <View style={styles.utilityRow}>
          {canDelete && (
            <Pressable onPress={handleDeletePhoto} hitSlop={6}>
              <Text style={[styles.utilityLabel, { color: colors.danger, fontFamily: fonts.bodyMedium }]}>
                Excluir foto
              </Text>
            </Pressable>
          )}
          {isSignedIn && !isOwnPhoto && (
            <Pressable onPress={() => setReportOpen(true)} hitSlop={6}>
              <Text style={[styles.utilityLabel, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
                Denunciar
              </Text>
            </Pressable>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
          Comentários
        </Text>

        {isSignedIn && (
          <View style={[styles.composer, { borderColor: colors.border }]}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Escreva um comentário..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.composerInput, { color: colors.textPrimary, fontFamily: fonts.body }]}
              multiline
            />
            <Pressable onPress={handleSendComment} hitSlop={8} disabled={createComment.isPending}>
              <Ionicons name="send" size={20} color={colors.accent} />
            </Pressable>
          </View>
        )}

        <View style={styles.commentsList}>
          {comments.data?.pages.flatMap((page) => page.items).map((comment) => (
            <CommentItem key={comment.id} comment={comment} photoId={id} />
          ))}
          {comments.isLoading && <ActivityIndicator color={colors.textPrimary} />}
          {comments.isSuccess && comments.data.pages[0]?.items.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Nenhum comentário ainda.
            </Text>
          )}
          {comments.hasNextPage && (
            <Pressable onPress={() => comments.fetchNextPage()} hitSlop={6}>
              <Text style={[styles.loadMore, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>
                {comments.isFetchingNextPage ? "Carregando..." : "Carregar mais comentários"}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <ReportModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(payload) => reportPhoto.mutate(payload)}
        loading={reportPhoto.isPending}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 40, gap: 14 },
  image: { width: "100%", aspectRatio: 1, borderRadius: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  authorName: { fontSize: 15 },
  likeRow: { flexDirection: "row" },
  likeButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeCount: { fontSize: 14 },
  location: { fontSize: 14 },
  caption: { fontSize: 14, lineHeight: 20 },
  utilityRow: { flexDirection: "row", gap: 20 },
  utilityLabel: { fontSize: 13 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  sectionTitle: { fontSize: 19 },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 10,
  },
  composerInput: { flex: 1, fontSize: 14, maxHeight: 90 },
  commentsList: { gap: 18 },
  emptyText: { fontSize: 13 },
  loadMore: { fontSize: 13, textAlign: "center" },
});
