/**
 * Carte d'une notification
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Notification } from "../../../types/database";
import { notificationService } from "../../../services/notification.service";

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
}) => {
  const iconName = notificationService.getNotificationIcon(notification.type);
  const iconColor = notificationService.getNotificationColor(notification.type);
  const timeAgo = notificationService.formatRelativeDate(notification.created_at);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.is_read && styles.unreadContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Indicateur non lu */}
      {!notification.is_read && <View style={styles.unreadDot} />}

      {/* Icône */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={iconName as any} size={20} color={iconColor} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={[styles.title, !notification.is_read && styles.titleUnread]}>
          {notification.title}
        </Text>
        {notification.body && (
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        )}
        <Text style={styles.time}>{timeAgo}</Text>
      </View>

      {/* Flèche */}
      <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  unreadContainer: {
    backgroundColor: "#eff6ff",
  },
  unreadDot: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 2,
  },
  titleUnread: {
    fontWeight: "700",
    color: "#111827",
  },
  body: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 4,
  },
  time: {
    fontSize: 11,
    color: "#9ca3af",
  },
});

export default NotificationCard;