/**
 * Ecran Notifications - Centre Chretien de Reveil
 */

import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";
import { useNotifications } from "../../../hooks/useNotifications";

export default function NotificationsScreen() {
  const {
    notifications,
    announcements,
    unreadCount,
    isLoading,
    error,
    loadData,
    markAsRead,
    markAllAsRead,
    markAnnouncementAsRead,
    getNotificationIcon,
    getNotificationColor,
    formatRelativeDate,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationPress = useCallback(
    async (notificationId: string, isRead: boolean) => {
      if (!isRead) {
        await markAsRead(notificationId);
      }
    },
    [markAsRead]
  );

  const handleAnnouncementPress = useCallback(
    async (announcementId: string, isRead?: boolean) => {
      if (!isRead) {
        await markAnnouncementAsRead(announcementId);
      }
    },
    [markAnnouncementAsRead]
  );

  const getPriorityLabel = (priority: number): string | null => {
    if (priority >= 3) return "Urgent";
    if (priority === 2) return "Important";
    return null;
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 3) return "#EF4444";
    if (priority === 2) return "#F59E0B";
    return "#6B7280";
  };

  // --- Loading state ---
  if (isLoading && notifications.length === 0 && announcements.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.gold} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Error state ---
  if (error && notifications.length === 0 && announcements.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={64}
            color={COLORS.neutral.border}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Reessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasAnnouncements = announcements.length > 0;
  const hasNotifications = notifications.length > 0;
  const isEmpty = !hasAnnouncements && !hasNotifications;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllRead}>Tout marquer lu</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.gold}
            colors={[COLORS.primary.gold]}
          />
        }
      >
        {/* Announcements Section */}
        {hasAnnouncements && (
          <View style={styles.announcementsSection}>
            <Text style={styles.sectionTitle}>Annonces</Text>
            {announcements.map((announcement) => {
              const priorityLabel = getPriorityLabel(announcement.priority);
              const priorityColor = getPriorityColor(announcement.priority);
              return (
                <TouchableOpacity
                  key={announcement.id}
                  style={[
                    styles.announcementItem,
                    !announcement.is_read && styles.announcementItemUnread,
                  ]}
                  onPress={() =>
                    handleAnnouncementPress(
                      announcement.id,
                      announcement.is_read
                    )
                  }
                >
                  <View style={styles.announcementHeader}>
                    <View style={styles.announcementTitleRow}>
                      <Ionicons
                        name="megaphone"
                        size={18}
                        color={COLORS.primary.gold}
                        style={{ marginRight: SPACING.sm }}
                      />
                      <Text
                        style={styles.announcementTitle}
                        numberOfLines={1}
                      >
                        {announcement.title}
                      </Text>
                    </View>
                    {priorityLabel && (
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: `${priorityColor}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityBadgeText,
                            { color: priorityColor },
                          ]}
                        >
                          {priorityLabel}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={styles.announcementContent}
                    numberOfLines={2}
                  >
                    {announcement.content}
                  </Text>
                  <Text style={styles.announcementTime}>
                    {formatRelativeDate(announcement.published_at || announcement.created_at)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Notifications Section */}
        {hasAnnouncements && hasNotifications && (
          <Text style={styles.sectionTitle}>Notifications</Text>
        )}

        {notifications.map((notif) => {
          const iconName = getNotificationIcon(notif.type);
          const iconColor = getNotificationColor(notif.type);
          return (
            <TouchableOpacity
              key={notif.id}
              style={[
                styles.notifItem,
                !notif.is_read && styles.notifItemUnread,
              ]}
              onPress={() => handleNotificationPress(notif.id, notif.is_read)}
            >
              <View
                style={[
                  styles.notifIcon,
                  { backgroundColor: `${iconColor}15` },
                ]}
              >
                <Ionicons
                  name={iconName as any}
                  size={22}
                  color={iconColor}
                />
              </View>
              <View style={styles.notifContent}>
                <Text style={styles.notifTitle}>{notif.title}</Text>
                <Text style={styles.notifMessage} numberOfLines={2}>
                  {notif.body}
                </Text>
                <Text style={styles.notifTime}>
                  {formatRelativeDate(notif.created_at)}
                </Text>
              </View>
              {!notif.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        })}

        {/* Empty state */}
        {isEmpty && (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={COLORS.neutral.border}
            />
            <Text style={styles.emptyText}>Aucune notification</Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  markAllRead: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary.gold,
  },
  // --- Loading ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.tertiary,
    marginTop: SPACING.md,
  },
  // --- Error ---
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
  // --- Announcements ---
  announcementsSection: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  announcementItem: {
    backgroundColor: COLORS.neutral.white,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary.gold,
  },
  announcementItemUnread: {
    backgroundColor: COLORS.primary.goldSoft,
  },
  announcementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  announcementTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: SPACING.sm,
  },
  announcementTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  priorityBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  announcementContent: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  announcementTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  // --- Notifications ---
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.neutral.white,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  notifItemUnread: {
    backgroundColor: COLORS.primary.goldSoft,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  notifMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  notifTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary.gold,
    marginLeft: SPACING.sm,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.huge,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.tertiary,
    marginTop: SPACING.md,
  },
});
