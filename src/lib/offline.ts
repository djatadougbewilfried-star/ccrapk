/**
 * Offline - Support hors ligne pour CCR App
 * Gère la persistance locale et la synchronisation
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { Logger } from "./logger";
import { Config } from "../constants/config";

// Types pour le stockage offline
interface OfflineQueueItem {
  id: string;
  action: string;
  data: unknown;
  timestamp: string;
  retries: number;
}

interface CacheItem<T> {
  data: T;
  timestamp: string;
  expiresAt: string;
}

// Clés de stockage
const STORAGE_KEYS = {
  OFFLINE_QUEUE: "ccr_offline_queue",
  CACHE_PREFIX: "ccr_cache_",
  NETWORK_STATUS: "ccr_network_status",
  LAST_SYNC: "ccr_last_sync",
};

// État de connexion
let isOnline = true;
let networkListeners: ((status: boolean) => void)[] = [];

/**
 * Initialise le monitoring du réseau
 */
export const initNetworkMonitoring = (): (() => void) => {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const newStatus = state.isConnected ?? false;

    if (newStatus !== isOnline) {
      isOnline = newStatus;
      Logger.info(`Connexion réseau: ${isOnline ? "En ligne" : "Hors ligne"}`, undefined, "NETWORK");

      // Notifier les listeners
      networkListeners.forEach((listener) => listener(isOnline));

      // Si on repasse en ligne, synchroniser
      if (isOnline) {
        syncOfflineQueue().catch((err) =>
          Logger.error("Erreur sync automatique", { error: err })
        );
      }
    }
  });

  return unsubscribe;
};

/**
 * Vérifie si l'appareil est en ligne
 */
export const getNetworkStatus = (): boolean => isOnline;

/**
 * Ajoute un listener pour les changements de statut réseau
 */
export const addNetworkListener = (listener: (status: boolean) => void): (() => void) => {
  networkListeners.push(listener);
  return () => {
    networkListeners = networkListeners.filter((l) => l !== listener);
  };
};

// ============================================
// CACHE MANAGEMENT
// ============================================

/**
 * Sauvegarde des données en cache
 */
export const cacheData = async <T>(
  key: string,
  data: T,
  ttlMs: number = Config.cache.defaultTTL
): Promise<void> => {
  try {
    const now = new Date();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.CACHE_PREFIX + key,
      JSON.stringify(cacheItem)
    );

    Logger.debug(`Cache sauvegardé: ${key}`, { ttlMs }, "CACHE");
  } catch (error) {
    Logger.error(`Erreur cache save: ${key}`, { error }, "CACHE");
  }
};

/**
 * Récupère des données du cache
 */
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CACHE_PREFIX + key);

    if (!raw) return null;

    const cacheItem: CacheItem<T> = JSON.parse(raw);
    const now = new Date();
    const expiresAt = new Date(cacheItem.expiresAt);

    // Vérifier si le cache est expiré
    if (now > expiresAt) {
      Logger.debug(`Cache expiré: ${key}`, undefined, "CACHE");
      await AsyncStorage.removeItem(STORAGE_KEYS.CACHE_PREFIX + key);
      return null;
    }

    Logger.debug(`Cache hit: ${key}`, undefined, "CACHE");
    return cacheItem.data;
  } catch (error) {
    Logger.error(`Erreur cache get: ${key}`, { error }, "CACHE");
    return null;
  }
};

/**
 * Invalide un cache spécifique
 */
export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CACHE_PREFIX + key);
    Logger.debug(`Cache invalidé: ${key}`, undefined, "CACHE");
  } catch (error) {
    Logger.error(`Erreur invalidation cache: ${key}`, { error }, "CACHE");
  }
};

/**
 * Vide tout le cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) =>
      key.startsWith(STORAGE_KEYS.CACHE_PREFIX)
    );

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      Logger.info(`Cache vidé: ${cacheKeys.length} entrées`, undefined, "CACHE");
    }
  } catch (error) {
    Logger.error("Erreur clear cache", { error }, "CACHE");
  }
};

// ============================================
// OFFLINE QUEUE
// ============================================

/**
 * Ajoute une action à la file d'attente offline
 */
export const queueOfflineAction = async (
  action: string,
  data: unknown
): Promise<string> => {
  try {
    const queue = await getOfflineQueue();
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const item: OfflineQueueItem = {
      id,
      action,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    queue.push(item);
    await saveOfflineQueue(queue);

    Logger.info(`Action en file d'attente: ${action}`, { id }, "OFFLINE");
    return id;
  } catch (error) {
    Logger.error("Erreur ajout queue offline", { error }, "OFFLINE");
    throw error;
  }
};

/**
 * Récupère la file d'attente offline
 */
export const getOfflineQueue = async (): Promise<OfflineQueueItem[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    Logger.error("Erreur lecture queue offline", { error }, "OFFLINE");
    return [];
  }
};

/**
 * Sauvegarde la file d'attente offline
 */
const saveOfflineQueue = async (queue: OfflineQueueItem[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
};

/**
 * Supprime une action de la file d'attente
 */
export const removeFromOfflineQueue = async (id: string): Promise<void> => {
  try {
    const queue = await getOfflineQueue();
    const filteredQueue = queue.filter((item) => item.id !== id);
    await saveOfflineQueue(filteredQueue);
    Logger.debug(`Action retirée de la queue: ${id}`, undefined, "OFFLINE");
  } catch (error) {
    Logger.error("Erreur suppression queue", { error, id }, "OFFLINE");
  }
};

/**
 * Synchronise la file d'attente offline
 */
export const syncOfflineQueue = async (
  processAction?: (item: OfflineQueueItem) => Promise<boolean>
): Promise<{ processed: number; failed: number }> => {
  if (!isOnline) {
    Logger.warn("Sync annulée: hors ligne", undefined, "OFFLINE");
    return { processed: 0, failed: 0 };
  }

  const queue = await getOfflineQueue();
  let processed = 0;
  let failed = 0;

  Logger.info(`Début sync: ${queue.length} actions en attente`, undefined, "OFFLINE");

  for (const item of queue) {
    try {
      // Si un processeur personnalisé est fourni, l'utiliser
      if (processAction) {
        const success = await processAction(item);
        if (success) {
          await removeFromOfflineQueue(item.id);
          processed++;
        } else {
          failed++;
          // Incrémenter le compteur de retries
          item.retries++;
        }
      } else {
        // Sans processeur, simplement marquer comme traité
        await removeFromOfflineQueue(item.id);
        processed++;
      }
    } catch (error) {
      Logger.error(`Erreur sync action: ${item.action}`, { error, item }, "OFFLINE");
      failed++;
      item.retries++;
    }
  }

  // Sauvegarder la queue mise à jour (avec retries incrémentés)
  const remainingQueue = await getOfflineQueue();
  const MAX_RETRIES = 5;
  const filteredQueue = remainingQueue.filter((item) => item.retries < MAX_RETRIES);

  if (filteredQueue.length !== remainingQueue.length) {
    await saveOfflineQueue(filteredQueue);
    Logger.warn(
      `Actions abandonnées après ${MAX_RETRIES} tentatives`,
      { count: remainingQueue.length - filteredQueue.length },
      "OFFLINE"
    );
  }

  // Enregistrer le timestamp de la dernière sync
  await AsyncStorage.setItem(
    STORAGE_KEYS.LAST_SYNC,
    new Date().toISOString()
  );

  Logger.info(`Sync terminée: ${processed} réussies, ${failed} échouées`, undefined, "OFFLINE");
  return { processed, failed };
};

/**
 * Récupère la date de la dernière synchronisation
 */
export const getLastSyncTime = async (): Promise<Date | null> => {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? new Date(timestamp) : null;
  } catch {
    return null;
  }
};

// ============================================
// UTILITIES
// ============================================

/**
 * Wrapper pour les appels API avec support offline
 */
export const withOfflineSupport = async <T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  options?: {
    ttl?: number;
    queueAction?: string;
    queueData?: unknown;
  }
): Promise<T> => {
  const { ttl = Config.cache.defaultTTL, queueAction, queueData } = options || {};

  // Si en ligne, essayer de fetch
  if (isOnline) {
    try {
      const data = await fetchFn();
      // Mettre en cache le résultat
      await cacheData(cacheKey, data, ttl);
      return data;
    } catch (error) {
      Logger.warn(`Fetch échoué, tentative cache: ${cacheKey}`, { error }, "OFFLINE");
      // En cas d'erreur, essayer le cache
    }
  }

  // Essayer de récupérer du cache
  const cachedData = await getCachedData<T>(cacheKey);
  if (cachedData !== null) {
    Logger.info(`Données servies depuis le cache: ${cacheKey}`, undefined, "OFFLINE");
    return cachedData;
  }

  // Si on a une action à mettre en queue
  if (queueAction && queueData) {
    await queueOfflineAction(queueAction, queueData);
  }

  throw new Error(
    isOnline
      ? "Données non disponibles"
      : "Vous êtes hors ligne et les données ne sont pas en cache"
  );
};

/**
 * Vérifie la taille du stockage utilisé
 */
export const getStorageInfo = async (): Promise<{
  cacheSize: number;
  queueSize: number;
  cacheEntries: number;
  queueEntries: number;
}> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const cacheKeys = allKeys.filter((key) =>
      key.startsWith(STORAGE_KEYS.CACHE_PREFIX)
    );

    const queue = await getOfflineQueue();
    const queueRaw = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);

    let cacheSize = 0;
    for (const key of cacheKeys) {
      const item = await AsyncStorage.getItem(key);
      if (item) cacheSize += item.length;
    }

    return {
      cacheSize,
      queueSize: queueRaw?.length || 0,
      cacheEntries: cacheKeys.length,
      queueEntries: queue.length,
    };
  } catch (error) {
    Logger.error("Erreur calcul storage info", { error }, "OFFLINE");
    return { cacheSize: 0, queueSize: 0, cacheEntries: 0, queueEntries: 0 };
  }
};

// Export des types
export type { OfflineQueueItem, CacheItem };
