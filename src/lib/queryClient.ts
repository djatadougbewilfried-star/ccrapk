/**
 * Configuration de React Query pour CCR App
 * Gère le caching, les retries et la synchronisation des données
 */

import { QueryClient } from "@tanstack/react-query";
import { Config } from "../constants/config";
import { Logger } from "./logger";
import { isNetworkError } from "./errors";

/**
 * Fonction de retry personnalisée
 */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  // Ne pas retry les erreurs 4xx (client)
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;
    if (status >= 400 && status < 500) {
      return false;
    }
  }

  // Retry les erreurs réseau
  if (isNetworkError(error)) {
    return failureCount < Config.api.retryAttempts;
  }

  // Par défaut, retry 2 fois max
  return failureCount < 2;
};

/**
 * Crée et configure le QueryClient
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache par défaut de 5 minutes
        staleTime: Config.cache.defaultTTL,
        // Garder en cache 10 minutes après inutilisation
        gcTime: Config.cache.defaultTTL * 2,
        // Retry configuration
        retry: shouldRetry,
        retryDelay: (attemptIndex) =>
          Math.min(Config.api.retryDelay * 2 ** attemptIndex, 30000),
        // Ne pas refetch automatiquement au focus en prod
        refetchOnWindowFocus: Config.app.env !== "production",
        // Refetch sur reconnexion
        refetchOnReconnect: true,
        // Ne pas refetch sur mount si les données sont fraîches
        refetchOnMount: "always",
        // Gestion des erreurs
        throwOnError: false,
      },
      mutations: {
        // Retry pour les mutations
        retry: 1,
        retryDelay: Config.api.retryDelay,
        // Gestion des erreurs
        onError: (error) => {
          Logger.error("Mutation error", { error }, "QUERY");
        },
      },
    },
  });
};

// Instance singleton du QueryClient
let queryClientInstance: QueryClient | null = null;

/**
 * Récupère l'instance du QueryClient (singleton)
 */
export const getQueryClient = (): QueryClient => {
  if (!queryClientInstance) {
    queryClientInstance = createQueryClient();
  }
  return queryClientInstance;
};

// ============================================
// QUERY KEYS
// ============================================

/**
 * Clés de query centralisées pour éviter les typos et faciliter l'invalidation
 */
export const queryKeys = {
  // Utilisateur
  user: {
    all: ["user"] as const,
    profile: (userId: string) => ["user", "profile", userId] as const,
    stats: (userId: string) => ["user", "stats", userId] as const,
  },

  // Tribus
  tribu: {
    all: ["tribu"] as const,
    list: (churchId: string) => ["tribu", "list", churchId] as const,
    detail: (tribuId: string) => ["tribu", "detail", tribuId] as const,
    members: (tribuId: string) => ["tribu", "members", tribuId] as const,
    rankings: (churchId: string) => ["tribu", "rankings", churchId] as const,
    chat: (tribuId: string) => ["tribu", "chat", tribuId] as const,
    activities: (tribuId: string) => ["tribu", "activities", tribuId] as const,
  },

  // Dons
  donations: {
    all: ["donations"] as const,
    types: () => ["donations", "types"] as const,
    history: (userId: string) => ["donations", "history", userId] as const,
    stats: (userId: string) => ["donations", "stats", userId] as const,
  },

  // Événements
  events: {
    all: ["events"] as const,
    list: (churchId: string) => ["events", "list", churchId] as const,
    detail: (eventId: string) => ["events", "detail", eventId] as const,
    upcoming: (churchId: string) => ["events", "upcoming", churchId] as const,
  },

  // Formations
  formations: {
    all: ["formations"] as const,
    list: () => ["formations", "list"] as const,
    detail: (formationId: string) => ["formations", "detail", formationId] as const,
    enrollments: (userId: string) => ["formations", "enrollments", userId] as const,
  },

  // Prière
  prayer: {
    all: ["prayer"] as const,
    logs: (userId: string) => ["prayer", "logs", userId] as const,
    streaks: (userId: string) => ["prayer", "streaks", userId] as const,
    requests: (tribuId?: string) => ["prayer", "requests", tribuId] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (userId: string) => ["notifications", "list", userId] as const,
    unread: (userId: string) => ["notifications", "unread", userId] as const,
  },

  // Présence
  attendance: {
    all: ["attendance"] as const,
    sessions: (churchId: string) => ["attendance", "sessions", churchId] as const,
    records: (sessionId: string) => ["attendance", "records", sessionId] as const,
    stats: (userId: string) => ["attendance", "stats", userId] as const,
  },

  // Admin
  admin: {
    all: ["admin"] as const,
    stats: (churchId: string) => ["admin", "stats", churchId] as const,
    members: (churchId: string) => ["admin", "members", churchId] as const,
  },
} as const;

// ============================================
// INVALIDATION HELPERS
// ============================================

/**
 * Invalide toutes les queries liées à un utilisateur
 */
export const invalidateUserQueries = async (
  queryClient: QueryClient,
  userId: string
): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(userId) });
  await queryClient.invalidateQueries({ queryKey: queryKeys.user.stats(userId) });
};

/**
 * Invalide toutes les queries liées aux tribus
 */
export const invalidateTribuQueries = async (
  queryClient: QueryClient,
  tribuId?: string
): Promise<void> => {
  if (tribuId) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tribu.detail(tribuId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.tribu.members(tribuId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.tribu.chat(tribuId) });
  } else {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tribu.all });
  }
};

/**
 * Invalide toutes les queries liées aux dons
 */
export const invalidateDonationQueries = async (
  queryClient: QueryClient,
  userId?: string
): Promise<void> => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.donations.types() });
  if (userId) {
    await queryClient.invalidateQueries({ queryKey: queryKeys.donations.history(userId) });
    await queryClient.invalidateQueries({ queryKey: queryKeys.donations.stats(userId) });
  }
};

// Export du type QueryClient pour usage externe
export type { QueryClient };
