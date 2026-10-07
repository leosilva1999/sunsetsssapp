import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import { useTheme } from "../theme/useTheme";
import { useAuthStore } from "../stores/authStore";
import { moderationApi } from "../api/moderation";
import { getErrorMessage } from "../lib/errorMessage";
import { useCommentReplies, useCreateComment, useDeleteComment } from "../hooks/usePhotoDetail";
import { ReportModal } from "./ReportModal";
import type { Comment, ReportReason } from "../types/entities";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface CommentItemProps {
  comment: Comment;
  photoId: string;
  /** Respostas não têm "Responder" nem seção de respostas próprias — só 1 nível (seção 5.7). */
  isReply?: boolean;
}

export function CommentItem({ comment, photoId, isReply = false }: CommentItemProps) {
  const { colors, fonts } = useTheme();
  const user = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  const canModerate = user?.role === "Moderator" || user?.role === "Admin";
  const isOwn = user?.id === comment.userId;
  const canDelete = isOwn || canModerate;

  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  const replies = useCommentReplies(comment.id, repliesExpanded);
  const createComment = useCreateComment(photoId);
  const deleteComment = useDeleteComment(photoId);
  const reportComment = useMutation({
    mutationFn: (payload: { reason: ReportReason; details?: string }) =>
      moderationApi.reportComment(comment.id, payload),
    onSuccess: () => {
      setReportOpen(false);
      Alert.alert("Denúncia enviada", "Obrigado — nossa equipe vai revisar.");
    },
    onError: (error) => Alert.alert("Não foi possível denunciar", getErrorMessage(error, "Tente de novo.")),
  });

  const handleDelete = () => {
    const cascadeWarning = comment.repliesCount > 0 ? " As respostas também serão excluídas." : "";
    Alert.alert("Excluir comentário", `Tem certeza?${cascadeWarning}`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => deleteComment.mutate({ commentId: comment.id, parentCommentId: comment.parentCommentId }),
      },
    ]);
  };

  const handleSendReply = () => {
    const content = replyText.trim();
    if (!content) return;
    createComment.mutate(
      { content, parentCommentId: comment.id },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyOpen(false);
          setRepliesExpanded(true);
        },
        onError: (error) => Alert.alert("Não foi possível responder", getErrorMessage(error, "Tente de novo.")),
      }
    );
  };

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      <Pressable style={styles.authorRow} onPress={() => router.push(`/profile/${comment.userId}`)} hitSlop={4}>
        {comment.userAvatarUrl ? (
          <Image source={{ uri: comment.userAvatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="person" size={12} color={colors.textSecondary} />
          </View>
        )}
        <Text style={[styles.userName, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]} numberOfLines={1}>
          {comment.userName}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
          {formatDate(comment.createdAt)}
        </Text>
      </Pressable>

      <Text style={[styles.content, { color: colors.textPrimary, fontFamily: fonts.body }]}>{comment.content}</Text>

      <View style={styles.actions}>
        {!isReply && isSignedIn && (
          <Pressable onPress={() => setReplyOpen((v) => !v)} hitSlop={6}>
            <Text style={[styles.actionLabel, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
              Responder
            </Text>
          </Pressable>
        )}
        {canDelete && (
          <Pressable onPress={handleDelete} hitSlop={6}>
            <Text style={[styles.actionLabel, { color: colors.danger, fontFamily: fonts.bodyMedium }]}>Excluir</Text>
          </Pressable>
        )}
        {isSignedIn && !isOwn && (
          <Pressable onPress={() => setReportOpen(true)} hitSlop={6}>
            <Text style={[styles.actionLabel, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>
              Denunciar
            </Text>
          </Pressable>
        )}
      </View>

      {replyOpen && (
        <View style={[styles.replyComposer, { borderColor: colors.border }]}>
          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Escreva uma resposta..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.replyInput, { color: colors.textPrimary, fontFamily: fonts.body }]}
            multiline
          />
          <Pressable onPress={handleSendReply} hitSlop={8} disabled={createComment.isPending}>
            <Ionicons name="send" size={18} color={colors.accent} />
          </Pressable>
        </View>
      )}

      {!isReply && comment.repliesCount > 0 && !repliesExpanded && (
        <Pressable onPress={() => setRepliesExpanded(true)} hitSlop={6}>
          <Text style={[styles.viewReplies, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>
            Ver {comment.repliesCount} {comment.repliesCount === 1 ? "resposta" : "respostas"}
          </Text>
        </Pressable>
      )}

      {!isReply && repliesExpanded && (
        <View style={styles.repliesList}>
          {replies.data?.items.map((reply) => (
            <CommentItem key={reply.id} comment={reply} photoId={photoId} isReply />
          ))}
        </View>
      )}

      <ReportModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(payload) => reportComment.mutate(payload)}
        loading={reportComment.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  replyContainer: { marginLeft: 28, marginTop: 10 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 24, height: 24, borderRadius: 12 },
  avatarFallback: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 13, flexShrink: 1 },
  date: { fontSize: 11 },
  content: { fontSize: 14, lineHeight: 20, marginLeft: 32 },
  actions: { flexDirection: "row", gap: 16, marginLeft: 32 },
  actionLabel: { fontSize: 12 },
  replyComposer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginLeft: 32,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  replyInput: { flex: 1, fontSize: 13, maxHeight: 80 },
  viewReplies: { fontSize: 12, marginLeft: 32, marginTop: 2 },
  repliesList: { marginTop: 4 },
});
