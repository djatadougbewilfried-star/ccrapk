/**
 * Service Prière - Centre Chrétien de Réveil
 * Gère toutes les opérations liées à la prière et au jeûne
 */

import { supabase } from "../lib/supabase";

// Types
export interface PrayerLog {
  id: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  type: string | null;
  notes: string | null;
  mood: string | null;
  created_at: string | null;
}

export interface FastingLog {
  id: string;
  user_id: string;
  church_id: string | null;
  title: string | null;
  start_date: string;
  end_date: string;
  type: string | null;
  intention: string | null;
  is_collective: boolean;
  collective_event_id: string | null;
  status: string | null;
  completed_days: number | null;
  notes: string | null;
  created_at: string | null;
}

export interface PrayerGoal {
  id: string;
  user_id: string;
  daily_prayer_minutes: number;
  daily_fasting_enabled: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface SpiritualEvent {
  id: string;
  church_id: string;
  title: string;
  description: string | null;
  type: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface PrayerRequest {
  id: string;
  user_id: string;
  church_id: string;
  subject: string;
  description: string | null;
  urgency: string;
  is_confidential: boolean;
  is_public: boolean;
  is_validated: boolean;
  validated_by: string | null;
  validated_at: string | null;
  prayer_count: number;
  status: string;
  is_answered: boolean;
  answered_at: string | null;
  testimony: string | null;
  expires_at: string | null;
  created_at: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    photo_url: string | null;
  };
  has_prayed?: boolean;
}

export interface SpiritualBadge {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  type: string;
  requirement_value: number;
  created_at: string | null;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: SpiritualBadge;
}

export interface PrayerStats {
  currentStreak: number;
  longestStreak: number;
  totalMinutesThisMonth: number;
  totalDaysThisMonth: number;
  totalMinutesAllTime: number;
}

export interface FastingStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysThisMonth: number;
  totalDaysAllTime: number;
}

export interface CreatePrayerLogData {
  date: string;
  duration_minutes: number;
  type?: string;
  notes?: string;
  mood?: string;
}

export interface CreateFastingLogData {
  title?: string;
  start_date: string;
  end_date: string;
  type?: string;
  intention?: string;
  is_collective?: boolean;
  collective_event_id?: string;
}

export interface CreatePrayerRequestData {
  subject: string;
  description?: string;
  urgency?: string;
  is_public: boolean;
}

// ============================================
// OBJECTIFS DE PRIÈRE
// ============================================

/**
 * Récupérer les objectifs de prière de l'utilisateur
 */
export const getPrayerGoal = async (userId: string): Promise<PrayerGoal | null> => {
  try {
    const { data, error } = await supabase
      .from("prayer_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erreur récupération objectif:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur:", err);
    return null;
  }
};

/**
 * Créer ou mettre à jour les objectifs de prière
 */
export const upsertPrayerGoal = async (
  userId: string,
  dailyMinutes: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("prayer_goals")
      .upsert({
        user_id: userId,
        daily_prayer_minutes: dailyMinutes,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (error) {
      console.error("Erreur mise à jour objectif:", error);
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    return { success: true };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

// ============================================
// JOURNAL DE PRIÈRE
// ============================================

/**
 * Récupérer les logs de prière d'un utilisateur
 */
export const getPrayerLogs = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<PrayerLog[]> => {
  try {
    let query = supabase
      .from("prayer_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (startDate) {
      query = query.gte("date", startDate);
    }
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur récupération logs:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer le log de prière du jour
 */
export const getTodayPrayerLog = async (userId: string): Promise<PrayerLog | null> => {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    const { data, error } = await supabase
      .from("prayer_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (error) {
      console.error("Erreur récupération log du jour:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur:", err);
    return null;
  }
};

/**
 * Créer ou mettre à jour un log de prière
 */
export const upsertPrayerLog = async (
  userId: string,
  data: CreatePrayerLogData
): Promise<{ success: boolean; log?: PrayerLog; error?: string }> => {
  try {
    // Vérifier si un log existe déjà pour cette date
    const { data: existing } = await supabase
      .from("prayer_logs")
      .select("id, duration_minutes")
      .eq("user_id", userId)
      .eq("date", data.date)
      .maybeSingle();

    if (existing) {
      // Mettre à jour (ajouter les minutes)
      const { data: updated, error } = await supabase
        .from("prayer_logs")
        .update({
          duration_minutes: existing.duration_minutes + data.duration_minutes,
          type: data.type,
          notes: data.notes,
          mood: data.mood,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: "Erreur lors de la mise à jour" };
      }

      return { success: true, log: updated };
    } else {
      // Créer nouveau
      const { data: created, error } = await supabase
        .from("prayer_logs")
        .insert({
          user_id: userId,
          date: data.date,
          duration_minutes: data.duration_minutes,
          type: data.type,
          notes: data.notes,
          mood: data.mood,
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur création log:", error);
        return { success: false, error: "Erreur lors de la création" };
      }

      return { success: true, log: created };
    }
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

// ============================================
// JEÛNE
// ============================================

/**
 * Récupérer les jeûnes d'un utilisateur
 */
export const getFastingLogs = async (
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<FastingLog[]> => {
  try {
    let query = supabase
      .from("fasting_logs")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });

    if (startDate) {
      query = query.gte("start_date", startDate);
    }
    if (endDate) {
      query = query.lte("end_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erreur récupération jeûnes:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Créer un jeûne
 */
export const createFastingLog = async (
  userId: string,
  data: CreateFastingLogData
): Promise<{ success: boolean; log?: FastingLog; error?: string }> => {
  try {
    const { data: created, error } = await supabase
      .from("fasting_logs")
      .insert({
        user_id: userId,
        title: data.title,
        start_date: data.start_date,
        end_date: data.end_date,
        type: data.type || "Partiel",
        intention: data.intention,
        is_collective: data.is_collective || false,
        collective_event_id: data.collective_event_id,
        status: "in_progress",
        completed_days: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création jeûne:", error);
      return { success: false, error: "Erreur lors de la création" };
    }

    return { success: true, log: created };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Mettre à jour un jeûne (progression)
 */
export const updateFastingLog = async (
  fastingId: string,
  completedDays: number,
  status?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("fasting_logs")
      .update({
        completed_days: completedDays,
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fastingId);

    if (error) {
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Une erreur est survenue" };
  }
};

// ============================================
// STATISTIQUES
// ============================================

/**
 * Calculer les statistiques de prière
 */
export const getPrayerStats = async (userId: string): Promise<PrayerStats> => {
  try {
    const logs = await getPrayerLogs(userId);
    
    if (logs.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalMinutesThisMonth: 0,
        totalDaysThisMonth: 0,
        totalMinutesAllTime: 0,
      };
    }

    // Trier par date décroissante
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculer le streak actuel
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedLogs.length; i++) {
      const logDate = new Date(sortedLogs[i].date);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (logDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
      } else if (i === 0 && logDate.getTime() === expectedDate.getTime() - 86400000) {
        // Hier est ok si aujourd'hui pas encore enregistré
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculer le plus long streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    for (let i = 1; i < sortedLogs.length; i++) {
      const prevDate = new Date(sortedLogs[i - 1].date);
      const currDate = new Date(sortedLogs[i].date);
      const diffDays = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Stats du mois
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const thisMonthLogs = logs.filter((l) => l.date >= startOfMonth);
    
    const totalMinutesThisMonth = thisMonthLogs.reduce(
      (sum, l) => sum + (l.duration_minutes || 0),
      0
    );
    const totalDaysThisMonth = thisMonthLogs.length;

    // Total all time
    const totalMinutesAllTime = logs.reduce(
      (sum, l) => sum + (l.duration_minutes || 0),
      0
    );

    return {
      currentStreak,
      longestStreak,
      totalMinutesThisMonth,
      totalDaysThisMonth,
      totalMinutesAllTime,
    };
  } catch (err) {
    console.error("Erreur calcul stats:", err);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalMinutesThisMonth: 0,
      totalDaysThisMonth: 0,
      totalMinutesAllTime: 0,
    };
  }
};

/**
 * Calculer les statistiques de jeûne
 */
export const getFastingStats = async (userId: string): Promise<FastingStats> => {
  try {
    const logs = await getFastingLogs(userId);
    
    if (logs.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysThisMonth: 0,
        totalDaysAllTime: 0,
      };
    }

    // Calculer les jours totaux
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    let totalDaysThisMonth = 0;
    let totalDaysAllTime = 0;

    logs.forEach((log) => {
      const days = log.completed_days || 0;
      totalDaysAllTime += days;
      
      if (log.start_date >= startOfMonth) {
        totalDaysThisMonth += days;
      }
    });

    // Pour le streak, on simplifie (basé sur les jeûnes complétés récemment)
    const completedLogs = logs.filter((l) => l.status === "completed");
    
    return {
      currentStreak: completedLogs.length > 0 ? completedLogs[0].completed_days || 0 : 0,
      longestStreak: Math.max(...logs.map((l) => l.completed_days || 0), 0),
      totalDaysThisMonth,
      totalDaysAllTime,
    };
  } catch (err) {
    console.error("Erreur calcul stats jeûne:", err);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDaysThisMonth: 0,
      totalDaysAllTime: 0,
    };
  }
};

// ============================================
// ÉVÉNEMENTS SPIRITUELS
// ============================================

/**
 * Récupérer les événements spirituels
 */
export const getSpiritualEvents = async (): Promise<SpiritualEvent[]> => {
  try {
    const { data, error } = await supabase
      .from("spiritual_events")
      .select("*")
      .eq("is_active", true)
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Erreur récupération événements:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

// ============================================
// DEMANDES DE PRIÈRE
// ============================================

/**
 * Récupérer les demandes de prière publiques validées
 */
export const getPublicPrayerRequests = async (): Promise<PrayerRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("prayer_requests")
      .select(`
        *,
        profile:profiles (
          first_name,
          last_name,
          photo_url
        )
      `)
      .eq("is_public", true)
      .eq("is_validated", true)
      .eq("status", "Active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération demandes:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      profile: item.profile || null,
    }));
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer mes demandes de prière
 */
export const getMyPrayerRequests = async (userId: string): Promise<PrayerRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("prayer_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération mes demandes:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Créer une demande de prière
 */
export const createPrayerRequest = async (
  userId: string,
  churchId: string,
  data: CreatePrayerRequestData
): Promise<{ success: boolean; request?: PrayerRequest; error?: string }> => {
  try {
    // Date d'expiration : 1 mois
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { data: created, error } = await supabase
      .from("prayer_requests")
      .insert({
        user_id: userId,
        church_id: churchId,
        subject: data.subject,
        description: data.description,
        urgency: data.urgency || "Normal",
        is_confidential: !data.is_public,
        is_public: data.is_public,
        is_validated: !data.is_public, // Auto-validé si privé
        status: "Active",
        prayer_count: 0,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création demande:", error);
      return { success: false, error: "Erreur lors de la création" };
    }

    return { success: true, request: created };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Marquer une demande comme exaucée
 */
export const markRequestAsAnswered = async (
  requestId: string,
  testimony?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("prayer_requests")
      .update({
        is_answered: true,
        answered_at: new Date().toISOString(),
        testimony: testimony,
        status: "Answered",
      })
      .eq("id", requestId);

    if (error) {
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Prier pour une demande
 */
export const prayForRequest = async (
  requestId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Ajouter le support
    const { error: supportError } = await supabase
      .from("prayer_supports")
      .insert({
        request_id: requestId,
        user_id: userId,
      });

    if (supportError) {
      // Peut-être déjà ajouté
      if (supportError.code === "23505") {
        return { success: false, error: "Vous priez déjà pour cette demande" };
      }
      return { success: false, error: "Erreur lors de l'ajout" };
    }

    // Incrémenter le compteur
    const { error: updateError } = await supabase.rpc("increment_prayer_count", {
      request_id: requestId,
    });

    // Si la fonction RPC n'existe pas, on fait manuellement
    if (updateError) {
      // Récupérer le compteur actuel puis incrémenter
      const { data: currentRequest } = await supabase
        .from("prayer_requests")
        .select("prayer_count")
        .eq("id", requestId)
        .single();

      const currentCount = currentRequest?.prayer_count || 0;

      await supabase
        .from("prayer_requests")
        .update({
          prayer_count: currentCount + 1,
        })
        .eq("id", requestId);
    }

    return { success: true };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

// ============================================
// BADGES
// ============================================

/**
 * Récupérer tous les badges
 */
export const getAllBadges = async (): Promise<SpiritualBadge[]> => {
  try {
    const { data, error } = await supabase
      .from("spiritual_badges")
      .select("*")
      .order("requirement_value", { ascending: true });

    if (error) {
      console.error("Erreur récupération badges:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer les badges de l'utilisateur
 */
export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  try {
    const { data, error } = await supabase
      .from("user_badges")
      .select(`
        *,
        badge:spiritual_badges (*)
      `)
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération badges utilisateur:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      badge: item.badge || null,
    }));
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

// ============================================
// HELPERS
// ============================================

/**
 * Formater les minutes en heures et minutes
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
};

/**
 * Obtenir les dates d'un mois pour le calendrier
 */
export const getMonthDates = (year: number, month: number): Date[] => {
  const dates: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  
  return dates;
};