/**
 * Hook useEvents - Centre Chrétien de Réveil
 * Gère les données des événements
 */

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "../stores/userStore";
import {
  getUpcomingEvents,
  getUserRegistrations,
  registerToEvent,
  unregisterFromEvent,
  Event,
} from "../services/events.service";

export const useEvents = () => {
  const { user } = useUserStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les événements
  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger les événements
      const eventsData = await getUpcomingEvents();
      setEvents(eventsData);

      // Charger les inscriptions de l'utilisateur
      if (user?.id) {
        const registrations = await getUserRegistrations(user.id);
        setUserRegistrations(registrations.map((r) => r.event_id));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement des événements";
      console.error("Erreur chargement événements:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Charger au montage
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // S'inscrire à un événement
  const register = async (eventId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "Vous devez être connecté" };
    }

    const result = await registerToEvent(eventId, user.id);
    
    if (result.success) {
      setUserRegistrations((prev) => [...prev, eventId]);
    }
    
    return result;
  };

  // Se désinscrire d'un événement
  const unregister = async (eventId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "Vous devez être connecté" };
    }

    const result = await unregisterFromEvent(eventId, user.id);
    
    if (result.success) {
      setUserRegistrations((prev) => prev.filter((id) => id !== eventId));
    }
    
    return result;
  };

  // Vérifier si inscrit
  const isRegistered = (eventId: string): boolean => {
    return userRegistrations.includes(eventId);
  };

  // Filtrer les événements
  const getFilteredEvents = (filter: "all" | "upcoming" | "registered"): Event[] => {
    switch (filter) {
      case "registered":
        return events.filter((e) => userRegistrations.includes(e.id));
      case "upcoming":
        return events.filter(
          (e) => new Date(e.start_datetime) > new Date()
        );
      default:
        return events;
    }
  };

  return {
    events,
    isLoading,
    error,
    userRegistrations,
    register,
    unregister,
    isRegistered,
    getFilteredEvents,
    refresh: loadEvents,
  };
};