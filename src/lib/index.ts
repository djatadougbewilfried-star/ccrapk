/**
 * Lib - Point d'entrée centralisé pour les utilitaires
 */

// Client Supabase
export { supabase, getSupabaseUrl, isSupabaseConfigured } from "./supabase";
export type { SupabaseClient } from "./supabase";

// Système de logging
export { Logger } from "./logger";
export type { LogLevel, LogMetadata, LogEntry } from "./logger";

// Gestion des erreurs
export {
  AppError,
  NetworkError,
  AuthError,
  ValidationError,
  NotFoundError,
  PermissionError,
  ErrorCode,
  ErrorMessages,
  success,
  failure,
  fromSupabaseError,
  handleError,
  tryCatch,
  isNetworkError,
  isAuthError,
} from "./errors";
export type { Result } from "./errors";

// Support offline
export {
  initNetworkMonitoring,
  getNetworkStatus,
  addNetworkListener,
  cacheData,
  getCachedData,
  invalidateCache,
  clearAllCache,
  queueOfflineAction,
  getOfflineQueue,
  removeFromOfflineQueue,
  syncOfflineQueue,
  getLastSyncTime,
  withOfflineSupport,
  getStorageInfo,
} from "./offline";
export type { OfflineQueueItem, CacheItem } from "./offline";

// React Query
export {
  createQueryClient,
  getQueryClient,
  queryKeys,
  invalidateUserQueries,
  invalidateTribuQueries,
  invalidateDonationQueries,
} from "./queryClient";
export type { QueryClient } from "./queryClient";
