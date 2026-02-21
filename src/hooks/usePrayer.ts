/**
 * Hook usePrayer - Centre Chrétien de Réveil
 * Gère les données de prière et jeûne
 */

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "../stores/userStore";
import {
  getPrayerGoal,
  upsertPrayerGoal,
  getPrayerLogs,
  getTodayPrayerLog,
  upsertPrayerLog,
  getFastingLogs,
  createFastingLog,
  getPrayerStats,
  getFastingStats,
  getSpiritualEvents,
  getPublicPrayerRequests,
  getMyPrayerRequests,
  createPrayerRequest,
  markRequestAsAnswered,
  prayForRequest,
  getAllBadges,
  getUserBadges,
  PrayerGoal,
  PrayerLog,
  FastingLog,
  PrayerStats,
  FastingStats,
  SpiritualEvent,
  PrayerRequest,
  SpiritualBadge,
  UserBadge,
  CreatePrayerLogData,
  CreateFastingLogData,
  CreatePrayerRequestData,
} from "../services/prayer.service";
import { Config } from "../constants/config";

// ID de l'église depuis la configuration centralisée
const DEFAULT_CHURCH_ID = Config.church.defaultId;

export const usePrayer = () => {
  const { user } = useUserStore();
  
  // États
  const [prayerGoal, setPrayerGoal] = useState<PrayerGoal | null>(null);
  const [todayLog, setTodayLog] = useState<PrayerLog | null>(null);
  const [prayerLogs, setPrayerLogs] = useState<PrayerLog[]>([]);
  const [fastingLogs, setFastingLogs] = useState<FastingLog[]>([]);
  const [prayerStats, setPrayerStats] = useState<PrayerStats | null>(null);
  const [fastingStats, setFastingStats] = useState<FastingStats | null>(null);
  const [spiritualEvents, setSpiritualEvents] = useState<SpiritualEvent[]>([]);
  const [publicRequests, setPublicRequests] = useState<PrayerRequest[]>([]);
  const [myRequests, setMyRequests] = useState<PrayerRequest[]>([]);
  const [allBadges, setAllBadges] = useState<SpiritualBadge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Charger toutes les données en parallèle
      const [
        goalData,
        todayData,
        logsData,
        fastingData,
        prayerStatsData,
        fastingStatsData,
        eventsData,
        publicRequestsData,
        myRequestsData,
        badgesData,
        userBadgesData,
      ] = await Promise.all([
        getPrayerGoal(user.id),
        getTodayPrayerLog(user.id),
        getPrayerLogs(user.id),
        getFastingLogs(user.id),
        getPrayerStats(user.id),
        getFastingStats(user.id),
        getSpiritualEvents(),
        getPublicPrayerRequests(),
        getMyPrayerRequests(user.id),
        getAllBadges(),
        getUserBadges(user.id),
      ]);

      setPrayerGoal(goalData);
      setTodayLog(todayData);
      setPrayerLogs(logsData);
      setFastingLogs(fastingData);
      setPrayerStats(prayerStatsData);
      setFastingStats(fastingStatsData);
      setSpiritualEvents(eventsData);
      setPublicRequests(publicRequestsData);
      setMyRequests(myRequestsData);
      setAllBadges(badgesData);
      setUserBadges(userBadgesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      console.error("Erreur chargement prière:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Charger au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Objectif par défaut
  const dailyGoalMinutes = prayerGoal?.daily_prayer_minutes || 30;

  // Progression du jour (en pourcentage)
  const todayProgress = todayLog
    ? Math.min(100, Math.round((todayLog.duration_minutes / dailyGoalMinutes) * 100))
    : 0;

  // Minutes priées aujourd'hui
  const todayMinutes = todayLog?.duration_minutes || 0;

  // Mettre à jour l'objectif
  const updateGoal = async (minutes: number): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: "Non connecté" };
    
    const result = await upsertPrayerGoal(user.id, minutes);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // Enregistrer une prière
  const logPrayer = async (
    data: CreatePrayerLogData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: "Non connecté" };
    
    const result = await upsertPrayerLog(user.id, data);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // Enregistrer un jeûne
  const logFasting = async (
    data: CreateFastingLogData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: "Non connecté" };
    
    const result = await createFastingLog(user.id, data);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // Créer une demande de prière
  const submitPrayerRequest = async (
    data: CreatePrayerRequestData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "Non connecté" };
    }
    
    const result = await createPrayerRequest(user.id, DEFAULT_CHURCH_ID, data);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // Marquer comme exaucée
  const markAsAnswered = async (
    requestId: string,
    testimony?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const result = await markRequestAsAnswered(requestId, testimony);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // Prier pour quelqu'un
  const prayFor = async (
    requestId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: "Non connecté" };
    
    const result = await prayForRequest(requestId, user.id);
    if (result.success) {
      await loadData();
    }
    return result;
  };

  // Vérifier si un badge est obtenu
  const hasBadge = (badgeSlug: string): boolean => {
    return userBadges.some((ub) => ub.badge?.slug === badgeSlug);
  };

  // Prochain badge à obtenir (streak prière)
  const getNextPrayerStreakBadge = (): SpiritualBadge | null => {
    const currentStreak = prayerStats?.currentStreak || 0;
    const streakBadges = allBadges
      .filter((b) => b.type === "prayer_streak")
      .sort((a, b) => a.requirement_value - b.requirement_value);
    
    return streakBadges.find((b) => b.requirement_value > currentStreak) || null;
  };

  // Jours restants pour le prochain badge
  const daysToNextBadge = (): number => {
    const nextBadge = getNextPrayerStreakBadge();
    if (!nextBadge) return 0;
    return nextBadge.requirement_value - (prayerStats?.currentStreak || 0);
  };

  // Événements en cours
  const activeEvents = spiritualEvents.filter((event) => {
    const today = new Date().toISOString().split("T")[0];
    return event.start_date <= today && event.end_date >= today;
  });

  // Événements à venir
  const upcomingEvents = spiritualEvents.filter((event) => {
    const today = new Date().toISOString().split("T")[0];
    return event.start_date > today;
  });

  return {
    // Données
    prayerGoal,
    todayLog,
    prayerLogs,
    fastingLogs,
    prayerStats,
    fastingStats,
    spiritualEvents,
    activeEvents,
    upcomingEvents,
    publicRequests,
    myRequests,
    allBadges,
    userBadges,
    
    // États
    isLoading,
    error,
    
    // Calculs
    dailyGoalMinutes,
    todayProgress,
    todayMinutes,
    
    // Actions
    updateGoal,
    logPrayer,
    logFasting,
    submitPrayerRequest,
    markAsAnswered,
    prayFor,
    
    // Badges
    hasBadge,
    getNextPrayerStreakBadge,
    daysToNextBadge,
    
    // Refresh
    refresh: loadData,
  };
};