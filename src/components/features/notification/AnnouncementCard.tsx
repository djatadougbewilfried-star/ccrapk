/**
 * Carte d'une annonce
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Announcement } from "../../../types/database";
import { notificationService } from "../../../services/notification.service";

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onPress,
}) => {
  const getPriorityStyle = () => {
    switch (announcement.priority) {
      case 2:
        return { borderColor: "#dc2626", backgroundColor: "#fef2f2" };
      case 1:
        return { borderColor: "#f59e0b", backgroundColor: "#fffbeb" };
      default:
        return { borderColor: "#e5e7eb", backgroundColor: "#ffffff" };
    }
  };

  const getPriorityIcon = () => {
    switch (announcement.priority) {
      case 2:
        return { name: "alert-circle", color: "#dc2626" };
      case 1:
        return { name: "information-circle", color: "#f59e0b" };
      default:
        return { name: "megaphone", color: "#2563eb" };
    }
  };

  const priorityStyle = getPriorityStyle();
  const priorityIcon = getPriorityIcon();
  const timeAgo = notificationService.formatRelativeDate(announcement.published_at);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderLeftColor: priorityStyle.borderColor, backgroundColor: priorityStyle.backgroundColor },
        !announcement.is_read && styles.unreadContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icône */}
      <View style={[styles.iconContainer, { backgroundColor: `${priorityIcon.color}15` }]}>
        <Ionicons name={priorityIcon.name as any} size={24} color={priorityIcon.color} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, !announcement.is_read && styles.titleUnread]}>
            {announcement.title}
          </Text>
          {!announcement.is_read && <View style={styles.newBadge}><Text style={styles.newBadgeText}>Nouveau</Text></View>}
        </View>
        <Text style={styles.body} numberOfLines={3}>
          {announcement.content}
        </Text>
        <Text style={styles.time}>{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  unreadContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },
  titleUnread: {
    fontWeight: "700",
    color: "#111827",
  },
  newBadge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  body: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

export default AnnouncementCard;