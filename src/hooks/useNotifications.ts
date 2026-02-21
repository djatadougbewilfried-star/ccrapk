/**
 * Hook pour la gestion des notifications
 */

import { useState, useEffect, useCallback } from "react";
import { notificationService } from "../services/notification.service";
import { Notification, Announcement } from "../types/database";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [notificationsResult, announcementsResult, countResult] = await Promise.all([
      notificationService.getUserNotifications(),
      notificationService.getActiveAnnouncements(),
      notificationService.getUnreadCount(),
    ]);

    if (notificationsResult.error) {
      setError(notificationsResult.error);
    } else {
      setNotifications(notificationsResult.data);
    }

    if (!announcementsResult.error) {
      setAnnouncements(announcementsResult.data);
    }

    setUnreadCount(countResult);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string): Promise<boolean> => {
    const { success, error } = await notificationService.markNotificationAsRead(notificationId);

    if (error) {
      setError(error);
      return false;
    }

    // Mettre à jour l'état local
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    return success;
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async (): Promise<boolean> => {
    const { success, error } = await notificationService.markAllAsRead();

    if (error) {
      setError(error);
      return false;
    }

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);

    return success;
  };

  // Marquer une annonce comme lue
  const markAnnouncementAsRead = async (announcementId: string): Promise<boolean> => {
    const { success, error } = await notificationService.markAnnouncementAsRead(announcementId);

    if (error) {
      setError(error);
      return false;
    }

    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === announcementId ? { ...a, is_read: true } : a
      )
    );

    return success;
  };

  // Obtenir les notifications non lues
  const getUnreadNotifications = (): Notification[] => {
    return notifications.filter((n) => !n.is_read);
  };

  // Obtenir les annonces non lues
  const getUnreadAnnouncements = (): Announcement[] => {
    return announcements.filter((a) => !a.is_read);
  };

  return {
    notifications,
    announcements,
    unreadCount,
    isLoading,
    error,
    loadData,
    markAsRead,
    markAllAsRead,
    markAnnouncementAsRead,
    getUnreadNotifications,
    getUnreadAnnouncements,
    getNotificationIcon: notificationService.getNotificationIcon,
    getNotificationColor: notificationService.getNotificationColor,
    formatRelativeDate: notificationService.formatRelativeDate,
  };
};