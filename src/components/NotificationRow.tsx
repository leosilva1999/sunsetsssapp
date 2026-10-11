import { useState, type ComponentProps } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useTheme } from "../theme/useTheme";
import { useMarkNotificationRead } from "../hooks/useNotifications";
import { getNotificationMessageSuffix, resolveNotificationRoute } from "../lib/notificationTarget";
import type { AppNotification, NotificationType } from "../types/entities";

const ICONS: Record<NotificationType, ComponentProps<typeof Ionicons>["name"]> = {
  NewFollower: "person-add",
  PhotoLiked: "heart",
  PhotoCommented: "chatbubble",
  CommentReplied: "arrow-undo",
};

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

interface NotificationRowProps {
  notification: AppNotification;
}

export function NotificationRow({ notification }: NotificationRowProps) {
  const { colors, fonts, sunIconColor } = useTheme();
  const markRead = useMarkNotificationRead();
  const [navigating, setNavigating] = useState(false);
  const isUnread = !notification.readAt;

  const handlePress = async () => {
    if (isUnread) markRead.mutate(notification.id);
    setNavigating(true);
    try {
      const href = await resolveNotificationRoute(notification);
      router.push(href as never);
    } finally {
      setNavigating(false);
    }
  };

  // Nome e avatar de quem gerou a notificação levam ao perfil dele, qualquer que seja o tipo;
  // o resto da linha segue levando ao alvo (foto, comentário, perfil do seguidor).
  const openActorProfile = () => {
    if (isUnread) markRead.mutate(notification.id);
    router.push(`/profile/${notification.actorUserId}`);
  };

  return (
    <Pressable
      style={[styles.row, isUnread && { backgroundColor: colors.surfaceAlt }]}
      onPress={handlePress}
      disabled={navigating}
    >
      <Pressable onPress={openActorProfile} hitSlop={4}>
        {notification.actorAvatarUrl ? (
          <Image source={{ uri: notification.actorAvatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.surface }]}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
          </View>
        )}
      </Pressable>
      <View style={[styles.iconBadge, { backgroundColor: colors.surface }]}>
        <Ionicons name={ICONS[notification.type]} size={11} color={sunIconColor} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.message, { color: colors.textPrimary, fontFamily: fonts.body }]}>
          <Text style={{ fontFamily: fonts.bodyBold }} onPress={openActorProfile}>
            {notification.actorName}
          </Text>{" "}
          {getNotificationMessageSuffix(notification.type)}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
          {formatRelative(notification.createdAt)}
        </Text>
      </View>
      {navigating && <ActivityIndicator size="small" color={colors.textSecondary} />}
      {isUnread && <View style={[styles.unreadDot, { backgroundColor: sunIconColor }]} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  iconBadge: {
    position: "absolute",
    left: 36,
    top: 32,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  message: { fontSize: 14, lineHeight: 19 },
  date: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
});
