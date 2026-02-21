/**
 * Service Événements - Centre Chrétien de Réveil
 * Gère toutes les opérations liées aux événements
 */

import { supabase } from "../lib/supabase";

// Types
export interface Event {
  id: string;
  church_id: string;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  start_datetime: string;
  end_datetime: string | null;
  location_name: string | null;
  location_address: string | null;
  is_online: boolean | null;
  online_link: string | null;
  registration_required: boolean | null;
  max_participants: number | null;
  current_participants: number | null;
  image_url: string | null;
  is_public: boolean | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  status: string | null;
  created_at: string | null;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  registered_at: string;
}

// Récupérer tous les événements actifs
export const getEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .order("start_datetime", { ascending: true });

  if (error) {
    console.error("Erreur récupération événements:", error);
    throw error;
  }

  return data || [];
};

// Récupérer les événements à venir
export const getUpcomingEvents = async (): Promise<Event[]> => {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("is_active", true)
    .gte("start_datetime", now)
    .order("start_datetime", { ascending: true });

  if (error) {
    console.error("Erreur récupération événements à venir:", error);
    throw error;
  }

  return data || [];
};

// Récupérer un événement par ID
export const getEventById = async (eventId: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) {
    console.error("Erreur récupération événement:", error);
    return null;
  }

  return data;
};

// Vérifier si l'utilisateur est inscrit à un événement
export const isUserRegistered = async (
  eventId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("event_registrations")
      .select("id, status")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    return data.status !== "cancelled";
  } catch {
    return false;
  }
};

// Récupérer les inscriptions de l'utilisateur
export const getUserRegistrations = async (
  userId: string
): Promise<EventRegistration[]> => {
  const { data, error } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "cancelled");

  if (error) {
    console.error("Erreur récupération inscriptions:", error);
    return [];
  }

  return data || [];
};

// S'inscrire à un événement
export const registerToEvent = async (
  eventId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  // Vérifier si déjà inscrit
  const alreadyRegistered = await isUserRegistered(eventId, userId);
  if (alreadyRegistered) {
    return { success: false, error: "Vous êtes déjà inscrit à cet événement" };
  }

  // Vérifier la capacité maximale avant inscription
  const { data: eventData } = await supabase
    .from("events")
    .select("max_participants, current_participants")
    .eq("id", eventId)
    .single();

  if (eventData?.max_participants && eventData.max_participants > 0) {
    const currentCount = eventData.current_participants || 0;
    if (currentCount >= eventData.max_participants) {
      return { success: false, error: "Cet événement est complet. Plus de places disponibles." };
    }
  }

  // Créer l'inscription
  const { error } = await supabase.from("event_registrations").insert({
    event_id: eventId,
    user_id: userId,
    status: "registered",
  });

  if (error) {
    console.error("Erreur inscription événement:", error);
    return { success: false, error: "Erreur lors de l'inscription" };
  }

  // Incrémenter le compteur de participants
  const newCount = (eventData?.current_participants || 0) + 1;
  await supabase
    .from("events")
    .update({ current_participants: newCount })
    .eq("id", eventId);

  return { success: true };
};

// Se désinscrire d'un événement
export const unregisterFromEvent = async (
  eventId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from("event_registrations")
    .update({ status: "cancelled" })
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    console.error("Erreur désinscription événement:", error);
    return { success: false, error: "Erreur lors de la désinscription" };
  }

  // Décrémenter le compteur de participants
  const { data: eventData } = await supabase
    .from("events")
    .select("current_participants")
    .eq("id", eventId)
    .single();

  if (eventData) {
    const newCount = Math.max(0, (eventData.current_participants || 0) - 1);
    await supabase
      .from("events")
      .update({ current_participants: newCount })
      .eq("id", eventId);
  }

  return { success: true };
};

// Récupérer les événements auxquels l'utilisateur est inscrit
export const getUserEvents = async (userId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from("event_registrations")
    .select(`
      event_id,
      events (*)
    `)
    .eq("user_id", userId)
    .neq("status", "cancelled");

  if (error) {
    console.error("Erreur récupération événements utilisateur:", error);
    return [];
  }

  // Extraire les événements
  const events: Event[] = [];
  data?.forEach((reg: any) => {
    if (reg.events) {
      events.push(reg.events);
    }
  });
  
  return events;
};

// Obtenir la couleur du type d'événement
export const getEventTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    culte: "#3B82F6",
    croisade: "#8B5CF6",
    formation: "#10B981",
    mariage: "#EC4899",
    concert: "#F59E0B",
    reunion: "#6366F1",
    jeune: "#EF4444",
    priere: "#14B8A6",
    autre: "#6B7280",
  };
  return colors[type] || colors.autre;
};

// Obtenir le libellé du type d'événement
export const getEventTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    culte: "Culte",
    croisade: "Croisade",
    formation: "Formation",
    mariage: "Mariage",
    concert: "Concert",
    reunion: "Réunion",
    jeune: "Jeûne",
    priere: "Prière",
    autre: "Autre",
  };
  return labels[type] || labels.autre;
};

// Export par défaut du service
export const eventService = {
  getEvents,
  getUpcomingEvents,
  getEventById,
  isUserRegistered,
  getUserRegistrations,
  registerToEvent,
  unregisterFromEvent,
  getUserEvents,
  getEventTypeColor,
  getEventTypeLabel,
};