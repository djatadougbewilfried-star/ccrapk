/**
 * Service pour la gestion des notifications et annonces
 */

import { supabase } from "../lib/supabase";
import { Notification, Announcement } from "../types/database";

export const notificationService = {
  /**
   * Récupérer les notifications de l'utilisateur
   */
  async getUserNotifications(): Promise<{ data: Notification[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { data: [], error: "Utilisateur non connecté" };
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as Notification[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer les annonces actives
   */
  async getActiveAnnouncements(): Promise<{ data: Announcement[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .eq("is_published", true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("priority", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(20);

      if (error) {
        return { data: [], error: error.message };
      }

      // Récupérer les annonces lues par l'utilisateur
      if (user) {
        const { data: reads } = await supabase
          .from("announcement_reads")
          .select("announcement_id")
          .eq("user_id", user.id);

        const readIds = new Set(reads?.map((r) => r.announcement_id) || []);

        const announcementsWithReadStatus = data?.map((a) => ({
          ...a,
          is_read: readIds.has(a.id),
        })) as Announcement[];

        return { data: announcementsWithReadStatus, error: null };
      }

      return { data: data as Announcement[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Marquer une notification comme lue
   */
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      const { error } = await supabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Marquer une annonce comme lue
   */
  async markAnnouncementAsRead(announcementId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      // Vérifier si déjà lu
      const { data: existing } = await supabase
        .from("announcement_reads")
        .select("id")
        .eq("announcement_id", announcementId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        return { success: true, error: null };
      }

      const { error } = await supabase
        .from("announcement_reads")
        .insert({
          announcement_id: announcementId,
          user_id: user.id,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Incrémenter le compteur de vues
      await supabase.rpc("increment_announcement_views", { announcement_id: announcementId });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) return 0;

      return count || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Obtenir l'icône du type de notification
   */
  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      event: "calendar",
      announcement: "megaphone",
      prayer: "heart",
      donation: "wallet",
      formation: "school",
      system: "settings",
    };
    return icons[type] || "notifications";
  },

  /**
   * Obtenir la couleur du type de notification
   */
  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      event: "#2563eb",
      announcement: "#f59e0b",
      prayer: "#22c55e",
      donation: "#22c55e",
      formation: "#8b5cf6",
      system: "#6b7280",
    };
    return colors[type] || "#6b7280";
  },

  /**
   * Formater la date relative
   */
  formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  },
};