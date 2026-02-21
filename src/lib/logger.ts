/**
 * Logger - Système de logging centralisé pour CCR App
 * Fournit des fonctionnalités de logging structuré avec support
 * pour différents niveaux et contextes
 */

import { Config } from "../constants/config";

// Types de niveaux de log
type LogLevel = "debug" | "info" | "warn" | "error";

// Interface pour les métadonnées de log
interface LogMetadata {
  [key: string]: unknown;
}

// Interface pour un entry de log
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  context?: string;
}

// Configuration du logger
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Niveau minimum en fonction de l'environnement
const MIN_LOG_LEVEL: LogLevel = Config.app.env === "production" ? "warn" : "debug";

// Buffer pour les logs (pour envoi batch au serveur si nécessaire)
const logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Formate une entrée de log
 */
const formatLogEntry = (entry: LogEntry): string => {
  const { timestamp, level, message, metadata, context } = entry;
  const contextStr = context ? `[${context}]` : "";
  const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : "";
  return `${timestamp} [${level.toUpperCase()}]${contextStr} ${message}${metaStr}`;
};

/**
 * Vérifie si un niveau de log doit être affiché
 */
const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
};

/**
 * Ajoute une entrée au buffer
 */
const addToBuffer = (entry: LogEntry): void => {
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }
};

/**
 * Crée une entrée de log
 */
const createLogEntry = (
  level: LogLevel,
  message: string,
  metadata?: LogMetadata,
  context?: string
): LogEntry => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata,
    context,
  };
};

/**
 * Fonction de log générique
 */
const log = (
  level: LogLevel,
  message: string,
  metadata?: LogMetadata,
  context?: string
): void => {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, metadata, context);
  addToBuffer(entry);

  const formattedMessage = formatLogEntry(entry);

  switch (level) {
    case "debug":
      console.debug(formattedMessage);
      break;
    case "info":
      console.info(formattedMessage);
      break;
    case "warn":
      console.warn(formattedMessage);
      break;
    case "error":
      console.error(formattedMessage);
      break;
  }
};

/**
 * Logger principal exporté
 */
export const Logger = {
  /**
   * Log de niveau debug (développement uniquement)
   */
  debug: (message: string, metadata?: LogMetadata, context?: string): void => {
    log("debug", message, metadata, context);
  },

  /**
   * Log de niveau info
   */
  info: (message: string, metadata?: LogMetadata, context?: string): void => {
    log("info", message, metadata, context);
  },

  /**
   * Log de niveau warning
   */
  warn: (message: string, metadata?: LogMetadata, context?: string): void => {
    log("warn", message, metadata, context);
  },

  /**
   * Log de niveau error
   */
  error: (message: string, metadata?: LogMetadata, context?: string): void => {
    log("error", message, metadata, context);
  },

  /**
   * Crée un logger avec un contexte prédéfini
   */
  withContext: (context: string) => ({
    debug: (message: string, metadata?: LogMetadata) =>
      log("debug", message, metadata, context),
    info: (message: string, metadata?: LogMetadata) =>
      log("info", message, metadata, context),
    warn: (message: string, metadata?: LogMetadata) =>
      log("warn", message, metadata, context),
    error: (message: string, metadata?: LogMetadata) =>
      log("error", message, metadata, context),
  }),

  /**
   * Récupère les logs en buffer
   */
  getBuffer: (): LogEntry[] => [...logBuffer],

  /**
   * Vide le buffer de logs
   */
  clearBuffer: (): void => {
    logBuffer.length = 0;
  },

  /**
   * Log d'une erreur avec stack trace
   */
  logError: (error: Error, metadata?: LogMetadata, context?: string): void => {
    log(
      "error",
      error.message,
      {
        ...metadata,
        stack: error.stack,
        name: error.name,
      },
      context
    );
  },

  /**
   * Log de performance (mesure du temps d'exécution)
   */
  performance: (label: string): { end: () => void } => {
    const startTime = Date.now();
    return {
      end: () => {
        const duration = Date.now() - startTime;
        log("debug", `${label} completed`, { duration: `${duration}ms` }, "PERF");
      },
    };
  },

  /**
   * Log d'action utilisateur
   */
  userAction: (action: string, metadata?: LogMetadata): void => {
    log("info", action, metadata, "USER_ACTION");
  },

  /**
   * Log de navigation
   */
  navigation: (screen: string, params?: LogMetadata): void => {
    log("debug", `Navigate to ${screen}`, params, "NAV");
  },

  /**
   * Log d'API call
   */
  api: (method: string, endpoint: string, metadata?: LogMetadata): void => {
    log("debug", `${method} ${endpoint}`, metadata, "API");
  },
};

// Export des types
export type { LogLevel, LogMetadata, LogEntry };
