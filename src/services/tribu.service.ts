/**
 * Service Tribus - Centre Chrétien de Réveil
 * Gestion des 12 Tribus, membres, chat, activités et présence
 */

import { supabase } from "../lib/supabase";
import {
  TRIBUS as TRIBUS_CONSTANTS,
  getTribuConstantByName,
  type TribuConstant,
} from "../constants/tribus";

// ============================================
// TYPES
// ============================================

export interface Tribu {
  id: string;
  church_id: string;
  name: string;
  order_index: number;
  patriarch_id: string | null;
  color: string | null;
  icon: string | null;
  slogan: string | null;
  vision: string | null;
  description_text: string | null;
  biblical_meaning: string | null;
  member_count: number;
  total_points: number;
  ranking: number;
  previous_ranking: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  patriarch?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    phone: string | null;
  } | null;
}

export interface TribuMember {
  id: string;
  tribu_id: string;
  user_id: string;
  status: "Pending" | "Active" | "Left";
  joined_at: string;
  validated_by: string | null;
  validated_at: string | null;
  invited_by: string | null;
  rejection_reason: string | null;
  left_at: string | null;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    neighborhood: string | null;
  };
  inviter?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  // Stats de présence
  attendance_stats?: MemberAttendanceStats;
}

export interface TribuChangeRequest {
  id: string;
  user_id: string;
  church_id: string;
  from_tribu_id: string | null;
  to_tribu_id: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  change_count: number;
  created_at: string;
  from_tribu?: Tribu | null;
  to_tribu?: Tribu;
}

export interface TribuChatMessage {
  id: string;
  tribu_id: string;
  sender_id: string;
  content: string;
  message_type: "text" | "image" | "system";
  is_deleted: boolean;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
  };
}

export interface TribuActivity {
  id: string;
  tribu_id: string;
  title: string;
  description: string | null;
  activity_type: string;
  activity_date: string;
  location: string | null;
  max_participants: number | null;
  is_cancelled: boolean;
  created_by: string;
  created_at: string;
  participants_count?: number;
}

export interface TribuRanking {
  tribu: Tribu;
  position: number;
  evolution: "up" | "down" | "same";
  evolutionValue: number;
}

// Types pour la présence
export interface AttendanceSession {
  id: string;
  church_id: string;
  tribu_id: string | null;
  event_type: string;
  event_name: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_radius: number;
  is_active: boolean;
  is_closed: boolean;
  closed_at: string | null;
  created_by: string;
  created_at: string;
  // Relations
  tribu?: Tribu;
  records_count?: number;
  present_count?: number;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  user_id: string;
  tribu_id: string | null;
  status: "present" | "absent" | "late";
  check_in_method: "auto_gps" | "manual" | "qr_code" | null;
  check_in_time: string | null;
  checked_by: string | null;
  user_lat: number | null;
  user_lng: number | null;
  distance_from_location: number | null;
  notes: string | null;
  created_at: string;
  // Relations
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    phone: string | null;
  };
  session?: AttendanceSession;
}

export interface MemberAttendanceStats {
  user_id: string;
  tribu_id: string | null;
  total_present: number;
  total_absent: number;
  total_late: number;
  total_sessions: number;
  presence_rate: number;
  consecutive_absences: number;
  is_alert: boolean;
}

export interface MemberWithAlert {
  user_id: string;
  tribu_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  photo_url: string | null;
  consecutive_absences: number;
  total_present: number;
  total_absent: number;
  presence_rate: number;
}

// ============================================
// FONCTIONS - TRIBUS
// ============================================

/**
 * Récupérer toutes les Tribus d'une église
 */
export async function getAllTribus(churchId: string): Promise<{
  success: boolean;
  data?: Tribu[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("tribus")
      .select(`
        *,
        patriarch:patriarch_id (
          id,
          first_name,
          last_name,
          photo_url,
          phone
        )
      `)
      .eq("church_id", churchId)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Erreur getAllTribus:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer une Tribu par son ID
 */
export async function getTribuById(tribuId: string): Promise<{
  success: boolean;
  data?: Tribu;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("tribus")
      .select(`
        *,
        patriarch:patriarch_id (
          id,
          first_name,
          last_name,
          photo_url,
          phone
        )
      `)
      .eq("id", tribuId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Erreur getTribuById:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer le classement des Tribus
 */
export async function getTribusRanking(churchId: string): Promise<{
  success: boolean;
  data?: TribuRanking[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("tribus")
      .select(`
        *,
        patriarch:patriarch_id (
          id,
          first_name,
          last_name,
          photo_url
        )
      `)
      .eq("church_id", churchId)
      .eq("is_active", true)
      .order("total_points", { ascending: false });

    if (error) throw error;

    const rankings: TribuRanking[] = (data || []).map((tribu, index) => {
      const position = index + 1;
      const previousPosition = tribu.previous_ranking || position;
      let evolution: "up" | "down" | "same" = "same";
      let evolutionValue = 0;

      if (previousPosition > position) {
        evolution = "up";
        evolutionValue = previousPosition - position;
      } else if (previousPosition < position) {
        evolution = "down";
        evolutionValue = position - previousPosition;
      }

      return {
        tribu,
        position,
        evolution,
        evolutionValue,
      };
    });

    return { success: true, data: rankings };
  } catch (error: any) {
    console.error("Erreur getTribusRanking:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Mettre à jour les informations d'une Tribu (Patriarche uniquement)
 */
export async function updateTribu(
  tribuId: string,
  updates: {
    color?: string;
    slogan?: string;
    vision?: string;
    description_text?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("tribus")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tribuId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur updateTribu:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// FONCTIONS - MEMBRES
// ============================================

/**
 * Récupérer la Tribu d'un utilisateur
 */
export async function getUserTribu(userId: string): Promise<{
  success: boolean;
  data?: { membership: TribuMember; tribu: Tribu } | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("tribu_members")
      .select(`
        *,
        tribu:tribu_id (
          *,
          patriarch:patriarch_id (
            id,
            first_name,
            last_name,
            photo_url,
            phone
          )
        )
      `)
      .eq("user_id", userId)
      .in("status", ["Active", "Pending"])
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        membership: data,
        tribu: data.tribu,
      },
    };
  } catch (error: any) {
    console.error("Erreur getUserTribu:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les membres d'une Tribu avec leurs stats de présence
 */
export async function getTribuMembers(
  tribuId: string,
  status?: "Active" | "Pending" | "Left"
): Promise<{
  success: boolean;
  data?: TribuMember[];
  error?: string;
}> {
  try {
    let query = supabase
      .from("tribu_members")
      .select(`
        *,
        profile:user_id (
          id,
          first_name,
          last_name,
          photo_url,
          phone,
          email,
          city,
          neighborhood
        ),
        inviter:invited_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq("tribu_id", tribuId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("joined_at", { ascending: false });

    if (error) throw error;

    // Récupérer les stats de présence pour chaque membre
    const membersWithStats = await Promise.all(
      (data || []).map(async (member) => {
        const stats = await getMemberAttendanceStats(member.user_id);
        return {
          ...member,
          attendance_stats: stats.data || undefined,
        };
      })
    );

    return { success: true, data: membersWithStats };
  } catch (error: any) {
    console.error("Erreur getTribuMembers:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les demandes d'adhésion en attente (pour Patriarche)
 */
export async function getPendingMembershipRequests(tribuId: string): Promise<{
  success: boolean;
  data?: TribuMember[];
  error?: string;
}> {
  return getTribuMembers(tribuId, "Pending");
}

/**
 * Rejoindre une Tribu (demande d'adhésion)
 */
export async function joinTribu(
  userId: string,
  tribuId: string,
  invitedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existing } = await supabase
      .from("tribu_members")
      .select("id")
      .eq("user_id", userId)
      .in("status", ["Active", "Pending"])
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: "Vous êtes déjà membre d'une Tribu ou avez une demande en attente",
      };
    }

    const { error } = await supabase.from("tribu_members").insert({
      tribu_id: tribuId,
      user_id: userId,
      status: "Pending",
      invited_by: invitedBy || null,
      joined_at: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur joinTribu:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Valider ou rejeter une demande d'adhésion (Patriarche)
 */
export async function reviewMembershipRequest(
  membershipId: string,
  approved: boolean,
  reviewerId: string,
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = {
      status: approved ? "Active" : "Left",
      validated_by: reviewerId,
      validated_at: new Date().toISOString(),
    };

    if (!approved && rejectionReason) {
      updates.rejection_reason = rejectionReason;
      updates.left_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("tribu_members")
      .update(updates)
      .eq("id", membershipId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur reviewMembershipRequest:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Quitter une Tribu
 */
export async function leaveTribu(
  membershipId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("tribu_members")
      .update({
        status: "Left",
        left_at: new Date().toISOString(),
      })
      .eq("id", membershipId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur leaveTribu:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// FONCTIONS - CHANGEMENT DE TRIBU
// ============================================

/**
 * Compter les changements de Tribu d'un utilisateur
 */
export async function countUserTribuChanges(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("tribu_change_requests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "approved");

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error("Erreur countUserTribuChanges:", error);
    return 0;
  }
}

/**
 * Vérifier si un changement est possible
 */
export async function canRequestTribuChange(userId: string): Promise<{
  canChange: boolean;
  reason?: string;
  remainingChanges?: number;
  nextChangeDate?: string;
}> {
  try {
    const changeCount = await countUserTribuChanges(userId);

    if (changeCount >= 12) {
      return {
        canChange: false,
        reason: "Vous avez atteint le maximum de 12 changements de Tribu",
        remainingChanges: 0,
      };
    }

    const { data: lastChange } = await supabase
      .from("tribu_change_requests")
      .select("reviewed_at")
      .eq("user_id", userId)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastChange?.reviewed_at) {
      const lastChangeDate = new Date(lastChange.reviewed_at);
      const threeMonthsLater = new Date(lastChangeDate);
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      if (new Date() < threeMonthsLater) {
        return {
          canChange: false,
          reason: "Vous devez attendre 3 mois entre deux changements de Tribu",
          remainingChanges: 12 - changeCount,
          nextChangeDate: threeMonthsLater.toISOString(),
        };
      }
    }

    const { data: pendingRequest } = await supabase
      .from("tribu_change_requests")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (pendingRequest) {
      return {
        canChange: false,
        reason: "Vous avez déjà une demande de changement en attente",
        remainingChanges: 12 - changeCount,
      };
    }

    return {
      canChange: true,
      remainingChanges: 12 - changeCount,
    };
  } catch (error) {
    console.error("Erreur canRequestTribuChange:", error);
    return { canChange: false, reason: "Erreur lors de la vérification" };
  }
}

/**
 * Demander un changement de Tribu
 */
export async function requestTribuChange(
  userId: string,
  churchId: string,
  fromTribuId: string | null,
  toTribuId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const canChange = await canRequestTribuChange(userId);
    if (!canChange.canChange) {
      return { success: false, error: canChange.reason };
    }

    const changeCount = await countUserTribuChanges(userId);

    const { error } = await supabase.from("tribu_change_requests").insert({
      user_id: userId,
      church_id: churchId,
      from_tribu_id: fromTribuId,
      to_tribu_id: toTribuId,
      reason,
      status: "pending",
      change_count: changeCount + 1,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur requestTribuChange:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les demandes de changement d'un utilisateur
 */
export async function getUserChangeRequests(userId: string): Promise<{
  success: boolean;
  data?: TribuChangeRequest[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("tribu_change_requests")
      .select(`
        *,
        from_tribu:from_tribu_id (id, name, color, icon),
        to_tribu:to_tribu_id (id, name, color, icon)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Erreur getUserChangeRequests:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// FONCTIONS - CHAT
// ============================================

/**
 * Récupérer les messages du chat d'une Tribu
 */
export async function getTribuChatMessages(
  tribuId: string,
  limit: number = 50
): Promise<{
  success: boolean;
  data?: TribuChatMessage[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("tribu_chat_messages")
      .select(`
        *,
        sender:sender_id (
          id,
          first_name,
          last_name,
          photo_url
        )
      `)
      .eq("tribu_id", tribuId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: (data || []).reverse() };
  } catch (error: any) {
    console.error("Erreur getTribuChatMessages:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Envoyer un message dans le chat
 */
export async function sendChatMessage(
  tribuId: string,
  senderId: string,
  content: string,
  messageType: "text" | "image" = "text"
): Promise<{ success: boolean; data?: TribuChatMessage; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("tribu_chat_messages")
      .insert({
        tribu_id: tribuId,
        sender_id: senderId,
        content,
        message_type: messageType,
      })
      .select(`
        *,
        sender:sender_id (
          id,
          first_name,
          last_name,
          photo_url
        )
      `)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Erreur sendChatMessage:", error);
    return { success: false, error: error.message };
  }
}

/**
 * S'abonner aux nouveaux messages du chat (Realtime)
 */
export function subscribeToChatMessages(
  tribuId: string,
  onNewMessage: (message: TribuChatMessage) => void
) {
  const channel = supabase
    .channel(`tribu-chat-${tribuId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "tribu_chat_messages",
        filter: `tribu_id=eq.${tribuId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from("tribu_chat_messages")
          .select(`
            *,
            sender:sender_id (
              id,
              first_name,
              last_name,
              photo_url
            )
          `)
          .eq("id", payload.new.id)
          .single();

        if (data) {
          onNewMessage(data);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================
// FONCTIONS - ACTIVITÉS
// ============================================

/**
 * Récupérer les activités d'une Tribu
 */
export async function getTribuActivities(
  tribuId: string,
  upcoming: boolean = true
): Promise<{
  success: boolean;
  data?: TribuActivity[];
  error?: string;
}> {
  try {
    let query = supabase
      .from("tribu_activities")
      .select("*")
      .eq("tribu_id", tribuId)
      .eq("is_cancelled", false);

    if (upcoming) {
      query = query.gte("activity_date", new Date().toISOString());
    }

    const { data, error } = await query.order("activity_date", {
      ascending: true,
    });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Erreur getTribuActivities:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Créer une activité (Patriarche)
 */
export async function createTribuActivity(
  tribuId: string,
  createdBy: string,
  activity: {
    title: string;
    description?: string;
    activity_type: string;
    activity_date: string;
    location?: string;
    max_participants?: number;
  }
): Promise<{ success: boolean; data?: TribuActivity; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("tribu_activities")
      .insert({
        tribu_id: tribuId,
        created_by: createdBy,
        ...activity,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Erreur createTribuActivity:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// FONCTIONS - PRÉSENCE
// ============================================

/**
 * Créer une session de présence
 */
export async function createAttendanceSession(
  churchId: string,
  createdBy: string,
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
): Promise<{ success: boolean; data?: AttendanceSession; error?: string }> {
  try {
    const { data, error } = await supabase
      .from("attendance_sessions")
      .insert({
        church_id: churchId,
        created_by: createdBy,
        ...session,
        is_active: true,
        is_closed: false,
      })
      .select()
      .single();

    if (error) throw error;

    // Si c'est une session de tribu, créer les enregistrements pour tous les membres
    if (session.tribu_id && data) {
      await supabase.rpc("create_attendance_records_for_tribu", {
        p_session_id: data.id,
        p_tribu_id: session.tribu_id,
      });
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Erreur createAttendanceSession:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les sessions de présence actives
 */
export async function getActiveAttendanceSessions(
  churchId: string,
  tribuId?: string
): Promise<{
  success: boolean;
  data?: AttendanceSession[];
  error?: string;
}> {
  try {
    let query = supabase
      .from("attendance_sessions")
      .select(`
        *,
        tribu:tribu_id (id, name, color, icon)
      `)
      .eq("church_id", churchId)
      .eq("is_active", true)
      .eq("is_closed", false);

    if (tribuId) {
      query = query.or(`tribu_id.eq.${tribuId},tribu_id.is.null`);
    }

    const { data, error } = await query.order("event_date", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Erreur getActiveAttendanceSessions:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les enregistrements de présence d'une session
 */
export async function getSessionAttendanceRecords(sessionId: string): Promise<{
  success: boolean;
  data?: AttendanceRecord[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("attendance_records")
      .select(`
        *,
        profile:user_id (
          id,
          first_name,
          last_name,
          photo_url,
          phone
        )
      `)
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Erreur getSessionAttendanceRecords:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Auto-pointage avec GPS
 */
export async function checkInWithGPS(
  sessionId: string,
  userId: string,
  userLat: number,
  userLng: number
): Promise<{ success: boolean; error?: string; distance?: number }> {
  try {
    // Récupérer la session pour avoir les coordonnées de l'église
    const { data: session } = await supabase
      .from("attendance_sessions")
      .select("location_lat, location_lng, location_radius")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return { success: false, error: "Session non trouvée" };
    }

    // Calculer la distance
    let distance: number | null = null;
    let isWithinRadius = true;

    if (session.location_lat && session.location_lng) {
      const { data: distanceData } = await supabase.rpc("calculate_distance_meters", {
        lat1: userLat,
        lng1: userLng,
        lat2: session.location_lat,
        lng2: session.location_lng,
      });

      distance = distanceData;
      isWithinRadius = distance !== null && distance <= (session.location_radius || 500);
    }

    if (!isWithinRadius) {
      return {
        success: false,
        error: `Vous êtes trop loin du lieu (${distance}m). Rapprochez-vous à moins de ${session.location_radius || 500}m.`,
        distance: distance || undefined,
      };
    }

    // Enregistrer la présence
    const { error } = await supabase
      .from("attendance_records")
      .upsert(
        {
          session_id: sessionId,
          user_id: userId,
          status: "present",
          check_in_method: "auto_gps",
          check_in_time: new Date().toISOString(),
          user_lat: userLat,
          user_lng: userLng,
          distance_from_location: distance,
        },
        {
          onConflict: "session_id,user_id",
        }
      );

    if (error) throw error;

    return { success: true, distance: distance || undefined };
  } catch (error: any) {
    console.error("Erreur checkInWithGPS:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Pointage manuel par le Patriarche
 */
export async function manualCheckIn(
  sessionId: string,
  userId: string,
  status: "present" | "absent" | "late",
  checkedBy: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendance_records")
      .upsert(
        {
          session_id: sessionId,
          user_id: userId,
          status,
          check_in_method: "manual",
          check_in_time: status !== "absent" ? new Date().toISOString() : null,
          checked_by: checkedBy,
          notes,
        },
        {
          onConflict: "session_id,user_id",
        }
      );

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur manualCheckIn:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Pointage en masse (plusieurs membres)
 */
export async function bulkManualCheckIn(
  sessionId: string,
  records: Array<{ userId: string; status: "present" | "absent" | "late" }>,
  checkedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const upsertData = records.map((record) => ({
      session_id: sessionId,
      user_id: record.userId,
      status: record.status,
      check_in_method: "manual" as const,
      check_in_time: record.status !== "absent" ? new Date().toISOString() : null,
      checked_by: checkedBy,
    }));

    const { error } = await supabase
      .from("attendance_records")
      .upsert(upsertData, {
        onConflict: "session_id,user_id",
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur bulkManualCheckIn:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Clôturer une session de présence
 */
export async function closeAttendanceSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("attendance_sessions")
      .update({
        is_closed: true,
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Erreur closeAttendanceSession:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les statistiques de présence d'un membre
 */
export async function getMemberAttendanceStats(userId: string): Promise<{
  success: boolean;
  data?: MemberAttendanceStats;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("member_attendance_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    // Si pas de données, retourner des valeurs par défaut
    if (!data) {
      return {
        success: true,
        data: {
          user_id: userId,
          tribu_id: null,
          total_present: 0,
          total_absent: 0,
          total_late: 0,
          total_sessions: 0,
          presence_rate: 0,
          consecutive_absences: 0,
          is_alert: false,
        },
      };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Erreur getMemberAttendanceStats:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer les membres en alerte (3+ absences consécutives)
 */
export async function getMembersWithAttendanceAlert(tribuId?: string): Promise<{
  success: boolean;
  data?: MemberWithAlert[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase.rpc("get_members_with_attendance_alert", {
      p_tribu_id: tribuId || null,
    });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Erreur getMembersWithAttendanceAlert:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Récupérer l'historique de présence d'un membre
 */
export async function getMemberAttendanceHistory(
  userId: string,
  limit: number = 20
): Promise<{
  success: boolean;
  data?: AttendanceRecord[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("attendance_records")
      .select(`
        *,
        session:session_id (
          id,
          event_type,
          event_name,
          event_date
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Erreur getMemberAttendanceHistory:", error);
    return { success: false, error: error.message };
  }
}

// ============================================
// HELPERS
// ============================================

/**
 * Obtenir l'icône Ionicons pour une Tribu.
 * Mappe les noms d'icônes stockés en base (ou dans les constantes)
 * vers des noms valides Ionicons.
 */
export function getTribuIcon(iconName: string | null): string {
  const iconMap: Record<string, string> = {
    // Icônes des constantes tribus.ts
    water: "water",
    ear: "ear",
    heart: "heart",
    crown: "ribbon",       // Ionicons n'a pas "crown", on utilise "ribbon"
    scale: "scale",
    trophy: "trophy",
    smile: "happy",        // Ionicons n'a pas "smile", on utilise "happy"
    star: "star",
    gift: "gift",
    home: "home",
    "plus-circle": "add-circle",  // Ionicons utilise "add-circle"
    shield: "shield",
    // Icônes existantes supplémentaires
    eye: "eye",
    book: "book",
    flash: "flash",
    nutrition: "nutrition",
    fitness: "fitness",
    boat: "boat",
    leaf: "leaf",
    paw: "paw",
    people: "people",
  };

  return iconMap[iconName || ""] || "people";
}

/**
 * Obtenir les données constantes (description biblique, icône, couleur par défaut)
 * pour une Tribu à partir de son nom Supabase.
 * Retourne undefined si la tribu n'est pas trouvée dans les constantes.
 */
export function getTribuConstantData(tribuName: string): TribuConstant | undefined {
  return getTribuConstantByName(tribuName);
}

/**
 * Obtenir toutes les constantes des 12 tribus.
 * Utile pour l'affichage des tribus quand les données Supabase manquent.
 */
export function getAllTribuConstants(): TribuConstant[] {
  return TRIBUS_CONSTANTS;
}

/**
 * Formater le nom complet
 */
export function formatMemberName(
  firstName?: string,
  lastName?: string
): string {
  return `${firstName || ""} ${lastName || ""}`.trim() || "Membre";
}

/**
 * Obtenir la couleur de statut de présence
 */
export function getAttendanceStatusColor(status: string): string {
  switch (status) {
    case "present":
      return "#22C55E";
    case "late":
      return "#F59E0B";
    case "absent":
      return "#EF4444";
    default:
      return "#9CA3AF";
  }
}

/**
 * Obtenir le libellé du statut de présence
 */
export function getAttendanceStatusLabel(status: string): string {
  switch (status) {
    case "present":
      return "Présent";
    case "late":
      return "En retard";
    case "absent":
      return "Absent";
    default:
      return "Inconnu";
  }
}