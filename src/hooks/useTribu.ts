/**
 * Hook useTribu - Centre Chrétien de Réveil
 * Gestion des Tribus, membres, chat, activités et présence
 */

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../stores/authStore";
import { supabase } from "../lib/supabase";
import * as TribuService from "../services/tribu.service";
import type {
  Tribu,
  TribuMember,
  TribuRanking,
  TribuChatMessage,
  TribuActivity,
  TribuChangeRequest,
  AttendanceSession,
  AttendanceRecord,
  MemberAttendanceStats,
  MemberWithAlert,
} from "../services/tribu.service";

// ============================================
// TYPE POUR LE PROFIL
// ============================================

interface UserProfile {
  id: string;
  church_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  photo_url: string | null;
  role: string;
}

// ============================================
// HOOK POUR RÉCUPÉRER LE PROFIL
// ============================================

function useUserProfile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, church_id, first_name, last_name, phone, photo_url, role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Erreur chargement profil:", error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error("Erreur:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user?.id]);

  return { profile, loading };
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useTribu() {
  const { user } = useAuthStore();
  const { profile } = useUserProfile();
  
  // États
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Données Tribu
  const [allTribus, setAllTribus] = useState<Tribu[]>([]);
  const [myTribu, setMyTribu] = useState<Tribu | null>(null);
  const [myMembership, setMyMembership] = useState<TribuMember | null>(null);
  const [tribuMembers, setTribuMembers] = useState<TribuMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<TribuMember[]>([]);
  const [rankings, setRankings] = useState<TribuRanking[]>([]);
  
  // Chat
  const [chatMessages, setChatMessages] = useState<TribuChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Activités
  const [activities, setActivities] = useState<TribuActivity[]>([]);
  
  // Présence
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
  const [membersWithAlert, setMembersWithAlert] = useState<MemberWithAlert[]>([]);
  const [myAttendanceStats, setMyAttendanceStats] = useState<MemberAttendanceStats | null>(null);
  
  // Changement de Tribu
  const [changeRequests, setChangeRequests] = useState<TribuChangeRequest[]>([]);
  const [canChange, setCanChange] = useState<{
    canChange: boolean;
    reason?: string;
    remainingChanges?: number;
    nextChangeDate?: string;
  }>({ canChange: false });

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================

  const loadInitialData = useCallback(async () => {
    if (!profile?.church_id || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const [
        tribusResult,
        userTribuResult,
        rankingsResult,
        changeStatusResult,
      ] = await Promise.all([
        TribuService.getAllTribus(profile.church_id),
        TribuService.getUserTribu(user.id),
        TribuService.getTribusRanking(profile.church_id),
        TribuService.canRequestTribuChange(user.id),
      ]);

      if (tribusResult.success && tribusResult.data) {
        setAllTribus(tribusResult.data);
      }

      if (userTribuResult.success && userTribuResult.data) {
        setMyTribu(userTribuResult.data.tribu);
        setMyMembership(userTribuResult.data.membership);
      }

      if (rankingsResult.success && rankingsResult.data) {
        setRankings(rankingsResult.data);
      }

      setCanChange(changeStatusResult);

      // Charger les stats de présence
      const statsResult = await TribuService.getMemberAttendanceStats(user.id);
      if (statsResult.success && statsResult.data) {
        setMyAttendanceStats(statsResult.data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [profile?.church_id, user?.id]);

  // Charger au montage
  useEffect(() => {
    if (profile?.church_id && user?.id) {
      loadInitialData();
    }
  }, [loadInitialData, profile?.church_id, user?.id]);

  // ============================================
  // FONCTIONS TRIBU
  // ============================================

  const getTribu = useCallback(async (tribuId: string) => {
    const result = await TribuService.getTribuById(tribuId);
    if (!result.success) {
      setError(result.error || "Erreur lors de la récupération de la Tribu");
    }
    return result;
  }, []);

  const updateTribuInfo = useCallback(async (
    tribuId: string,
    updates: {
      color?: string;
      slogan?: string;
      vision?: string;
      description_text?: string;
    }
  ) => {
    setLoading(true);
    const result = await TribuService.updateTribu(tribuId, updates);
    
    if (result.success) {
      const updated = await TribuService.getTribuById(tribuId);
      if (updated.success && updated.data) {
        setMyTribu(updated.data);
      }
    } else {
      setError(result.error || "Erreur lors de la mise à jour");
    }
    
    setLoading(false);
    return result;
  }, []);

  const refreshRankings = useCallback(async () => {
    if (!profile?.church_id) return;

    const result = await TribuService.getTribusRanking(profile.church_id);
    if (result.success && result.data) {
      setRankings(result.data);
    }
  }, [profile?.church_id]);

  // ============================================
  // FONCTIONS MEMBRES
  // ============================================

  const loadTribuMembers = useCallback(async (tribuId?: string) => {
    const targetTribuId = tribuId || myTribu?.id;
    if (!targetTribuId) return;

    setLoading(true);
    const result = await TribuService.getTribuMembers(targetTribuId, "Active");
    
    if (result.success && result.data) {
      setTribuMembers(result.data);
    } else {
      setError(result.error || "Erreur lors du chargement des membres");
    }
    
    setLoading(false);
  }, [myTribu?.id]);

  const loadPendingRequests = useCallback(async () => {
    if (!myTribu?.id) return;

    const result = await TribuService.getPendingMembershipRequests(myTribu.id);
    if (result.success && result.data) {
      setPendingRequests(result.data);
    }
  }, [myTribu?.id]);

  const joinTribu = useCallback(async (tribuId: string, invitedBy?: string) => {
    if (!user?.id) return { success: false, error: "Non connecté" };

    setLoading(true);
    const result = await TribuService.joinTribu(user.id, tribuId, invitedBy);
    
    if (result.success) {
      await loadInitialData();
    } else {
      setError(result.error || "Erreur lors de l'adhésion");
    }
    
    setLoading(false);
    return result;
  }, [user?.id, loadInitialData]);

  const approveMembership = useCallback(async (membershipId: string) => {
    if (!user?.id) return { success: false, error: "Non connecté" };

    const result = await TribuService.reviewMembershipRequest(
      membershipId,
      true,
      user.id
    );
    
    if (result.success) {
      await loadPendingRequests();
      await loadTribuMembers();
    }
    
    return result;
  }, [user?.id, loadPendingRequests, loadTribuMembers]);

  const rejectMembership = useCallback(async (
    membershipId: string,
    reason: string
  ) => {
    if (!user?.id) return { success: false, error: "Non connecté" };

    const result = await TribuService.reviewMembershipRequest(
      membershipId,
      false,
      user.id,
      reason
    );
    
    if (result.success) {
      await loadPendingRequests();
    }
    
    return result;
  }, [user?.id, loadPendingRequests]);

  const leaveTribu = useCallback(async () => {
    if (!myMembership?.id) return { success: false, error: "Pas de membership" };

    const result = await TribuService.leaveTribu(myMembership.id);
    
    if (result.success) {
      setMyTribu(null);
      setMyMembership(null);
      setTribuMembers([]);
    }
    
    return result;
  }, [myMembership?.id]);

  // ============================================
  // FONCTIONS CHANGEMENT DE TRIBU
  // ============================================

  const requestTribuChange = useCallback(async (
    toTribuId: string,
    reason: string
  ) => {
    if (!user?.id || !profile?.church_id) {
      return { success: false, error: "Non connecté" };
    }

    const result = await TribuService.requestTribuChange(
      user.id,
      profile.church_id,
      myTribu?.id || null,
      toTribuId,
      reason
    );
    
    if (result.success) {
      const status = await TribuService.canRequestTribuChange(user.id);
      setCanChange(status);
    }
    
    return result;
  }, [user?.id, profile?.church_id, myTribu?.id]);

  const loadChangeRequests = useCallback(async () => {
    if (!user?.id) return;

    const result = await TribuService.getUserChangeRequests(user.id);
    if (result.success && result.data) {
      setChangeRequests(result.data);
    }
  }, [user?.id]);

  // ============================================
  // FONCTIONS CHAT
  // ============================================

  const loadChatMessages = useCallback(async (limit: number = 50) => {
    if (!myTribu?.id) return;

    setChatLoading(true);
    const result = await TribuService.getTribuChatMessages(myTribu.id, limit);
    
    if (result.success && result.data) {
      setChatMessages(result.data);
    }
    
    setChatLoading(false);
  }, [myTribu?.id]);

  const sendMessage = useCallback(async (content: string) => {
    if (!myTribu?.id || !user?.id) {
      return { success: false, error: "Non connecté" };
    }

    const result = await TribuService.sendChatMessage(
      myTribu.id,
      user.id,
      content
    );
    
    return result;
  }, [myTribu?.id, user?.id]);

  const subscribeToChat = useCallback(() => {
    if (!myTribu?.id) return () => {};

    return TribuService.subscribeToChatMessages(myTribu.id, (newMessage) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
    });
  }, [myTribu?.id]);

  // ============================================
  // FONCTIONS ACTIVITÉS
  // ============================================

  const loadActivities = useCallback(async (upcoming: boolean = true) => {
    if (!myTribu?.id) return;

    const result = await TribuService.getTribuActivities(myTribu.id, upcoming);
    if (result.success && result.data) {
      setActivities(result.data);
    }
  }, [myTribu?.id]);

  const createActivity = useCallback(async (
    activity: {
      title: string;
      description?: string;
      activity_type: string;
      activity_date: string;
      location?: string;
      max_participants?: number;
    }
  ) => {
    if (!myTribu?.id || !user?.id) {
      return { success: false, error: "Non connecté" };
    }

    const result = await TribuService.createTribuActivity(
      myTribu.id,
      user.id,
      activity
    );
    
    if (result.success) {
      await loadActivities();
    }
    
    return result;
  }, [myTribu?.id, user?.id, loadActivities]);

  // ============================================
  // FONCTIONS PRÉSENCE
  // ============================================

  const loadActiveSessions = useCallback(async () => {
    if (!profile?.church_id) return;

    const result = await TribuService.getActiveAttendanceSessions(
      profile.church_id,
      myTribu?.id
    );
    
    if (result.success && result.data) {
      setActiveSessions(result.data);
    }
  }, [profile?.church_id, myTribu?.id]);

  const createAttendanceSession = useCallback(async (
    session: {
      tribu_id?: string;
      event_type: string;
      event_name: string;
      event_date: string;
      start_time?: string;
      end_time?: string;
      location_name?: string;
      location_lat?: number;
      location_lng?: number;
      location_radius?: number;
    }
  ) => {
    if (!profile?.church_id || !user?.id) {
      return { success: false, error: "Non connecté" };
    }

    const result = await TribuService.createAttendanceSession(
      profile.church_id,
      user.id,
      session
    );
    
    if (result.success) {
      await loadActiveSessions();
    }
    
    return result;
  }, [profile?.church_id, user?.id, loadActiveSessions]);

  const checkInWithGPS = useCallback(async (
    sessionId: string,
    latitude: number,
    longitude: number
  ) => {
    if (!user?.id) return { success: false, error: "Non connecté" };

    const result = await TribuService.checkInWithGPS(
      sessionId,
      user.id,
      latitude,
      longitude
    );
    
    if (result.success) {
      const stats = await TribuService.getMemberAttendanceStats(user.id);
      if (stats.success && stats.data) {
        setMyAttendanceStats(stats.data);
      }
    }
    
    return result;
  }, [user?.id]);

  const manualCheckIn = useCallback(async (
    sessionId: string,
    userId: string,
    status: "present" | "absent" | "late",
    notes?: string
  ) => {
    if (!user?.id) return { success: false, error: "Non connecté" };

    return TribuService.manualCheckIn(
      sessionId,
      userId,
      status,
      user.id,
      notes
    );
  }, [user?.id]);

  const bulkCheckIn = useCallback(async (
    sessionId: string,
    records: Array<{ userId: string; status: "present" | "absent" | "late" }>
  ) => {
    if (!user?.id) return { success: false, error: "Non connecté" };

    return TribuService.bulkManualCheckIn(sessionId, records, user.id);
  }, [user?.id]);

  const closeSession = useCallback(async (sessionId: string) => {
    const result = await TribuService.closeAttendanceSession(sessionId);
    
    if (result.success) {
      await loadActiveSessions();
      await loadMembersWithAlert();
    }
    
    return result;
  }, [loadActiveSessions]);

  const getSessionRecords = useCallback(async (sessionId: string) => {
    return TribuService.getSessionAttendanceRecords(sessionId);
  }, []);

  const loadMembersWithAlert = useCallback(async () => {
    const result = await TribuService.getMembersWithAttendanceAlert(myTribu?.id);
    
    if (result.success && result.data) {
      setMembersWithAlert(result.data);
    }
  }, [myTribu?.id]);

  const getMemberAttendanceHistory = useCallback(async (
    userId: string,
    limit: number = 20
  ) => {
    return TribuService.getMemberAttendanceHistory(userId, limit);
  }, []);

  // ============================================
  // HELPERS
  // ============================================

  const isPatriarch = myTribu?.patriarch_id === user?.id;
  const hasTribu = !!myTribu && myMembership?.status === "Active";
  const isPending = myMembership?.status === "Pending";
  const top3Rankings = rankings.slice(0, 3);
  const myTribuRanking = myTribu
    ? rankings.find((r) => r.tribu.id === myTribu.id)
    : null;

  // ============================================
  // RETURN
  // ============================================

  return {
    // États
    loading,
    error,
    profile,
    
    // Données Tribu
    allTribus,
    myTribu,
    myMembership,
    tribuMembers,
    pendingRequests,
    rankings,
    top3Rankings,
    myTribuRanking,
    
    // Chat
    chatMessages,
    chatLoading,
    
    // Activités
    activities,
    
    // Présence
    activeSessions,
    membersWithAlert,
    myAttendanceStats,
    
    // Changement
    changeRequests,
    canChange,
    
    // Helpers
    isPatriarch,
    hasTribu,
    isPending,
    
    // Fonctions Tribu
    loadInitialData,
    getTribu,
    updateTribuInfo,
    refreshRankings,
    
    // Fonctions Membres
    loadTribuMembers,
    loadPendingRequests,
    joinTribu,
    approveMembership,
    rejectMembership,
    leaveTribu,
    
    // Fonctions Changement
    requestTribuChange,
    loadChangeRequests,
    
    // Fonctions Chat
    loadChatMessages,
    sendMessage,
    subscribeToChat,
    
    // Fonctions Activités
    loadActivities,
    createActivity,
    
    // Fonctions Présence
    loadActiveSessions,
    createAttendanceSession,
    checkInWithGPS,
    manualCheckIn,
    bulkCheckIn,
    closeSession,
    getSessionRecords,
    loadMembersWithAlert,
    getMemberAttendanceHistory,
  };
}

// ============================================
// HOOK POUR LE CLASSEMENT (Flash Info)
// ============================================

export function useTribuRankings() {
  const { user } = useAuthStore();
  const { profile } = useUserProfile();
  const [rankings, setRankings] = useState<TribuRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function load() {
      if (!profile?.church_id) return;

      const result = await TribuService.getTribusRanking(profile.church_id);
      if (result.success && result.data) {
        setRankings(result.data);
      }
      setLoading(false);
    }

    load();
  }, [profile?.church_id]);

  useEffect(() => {
    if (rankings.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rankings.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [rankings.length]);

  return {
    rankings,
    loading,
    currentRanking: rankings[currentIndex],
    currentIndex,
    setCurrentIndex,
  };
}

// ============================================
// HOOK POUR LE CHAT
// ============================================

export function useTribuChat(tribuId: string | undefined) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<TribuChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      if (!tribuId) return;

      setLoading(true);
      const result = await TribuService.getTribuChatMessages(tribuId);
      if (result.success && result.data) {
        setMessages(result.data);
      }
      setLoading(false);
    }

    load();
  }, [tribuId]);

  useEffect(() => {
    if (!tribuId) return;

    const unsubscribe = TribuService.subscribeToChatMessages(
      tribuId,
      (newMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    );

    return unsubscribe;
  }, [tribuId]);

  const sendMessage = async (content: string) => {
    if (!tribuId || !user?.id || !content.trim()) return;

    setSending(true);
    await TribuService.sendChatMessage(tribuId, user.id, content.trim());
    setSending(false);
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
  };
}

// ============================================
// HOOK POUR LA PRÉSENCE
// ============================================

export function useAttendance(sessionId: string | undefined) {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<AttendanceSession | null>(null);

  useEffect(() => {
    async function load() {
      if (!sessionId) return;

      setLoading(true);
      const result = await TribuService.getSessionAttendanceRecords(sessionId);
      if (result.success && result.data) {
        setRecords(result.data);
      }
      setLoading(false);
    }

    load();
  }, [sessionId]);

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    presenceRate: records.length > 0
      ? Math.round(
          (records.filter((r) => r.status === "present").length / records.length) * 100
        )
      : 0,
  };

  const refresh = async () => {
    if (!sessionId) return;

    const result = await TribuService.getSessionAttendanceRecords(sessionId);
    if (result.success && result.data) {
      setRecords(result.data);
    }
  };

  return {
    records,
    loading,
    session,
    stats,
    refresh,
  };
}

export default useTribu;