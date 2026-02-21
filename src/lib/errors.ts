/**
 * Errors - Système de gestion d'erreurs centralisé pour CCR App
 * Fournit des classes d'erreurs typées et des utilitaires de gestion
 */

import { Logger } from "./logger";

// Codes d'erreur de l'application
export enum ErrorCode {
  // Erreurs réseau
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  OFFLINE_ERROR = "OFFLINE_ERROR",

  // Erreurs d'authentification
  AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
  AUTH_SESSION_EXPIRED = "AUTH_SESSION_EXPIRED",
  AUTH_UNAUTHORIZED = "AUTH_UNAUTHORIZED",
  AUTH_EMAIL_NOT_VERIFIED = "AUTH_EMAIL_NOT_VERIFIED",

  // Erreurs de validation
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Erreurs de données
  NOT_FOUND = "NOT_FOUND",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  DATA_INTEGRITY_ERROR = "DATA_INTEGRITY_ERROR",

  // Erreurs serveur
  SERVER_ERROR = "SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMITED = "RATE_LIMITED",

  // Erreurs métier
  PERMISSION_DENIED = "PERMISSION_DENIED",
  OPERATION_FAILED = "OPERATION_FAILED",
  TRIBU_CHANGE_LIMIT_REACHED = "TRIBU_CHANGE_LIMIT_REACHED",
  DONATION_MINIMUM_NOT_MET = "DONATION_MINIMUM_NOT_MET",

  // Erreurs inconnues
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

// Messages d'erreur en français
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: "Erreur de connexion. Vérifiez votre connexion internet.",
  [ErrorCode.TIMEOUT_ERROR]: "La requête a expiré. Veuillez réessayer.",
  [ErrorCode.OFFLINE_ERROR]: "Vous êtes hors ligne. Certaines fonctionnalités ne sont pas disponibles.",

  [ErrorCode.AUTH_INVALID_CREDENTIALS]: "Email ou mot de passe incorrect.",
  [ErrorCode.AUTH_SESSION_EXPIRED]: "Votre session a expiré. Veuillez vous reconnecter.",
  [ErrorCode.AUTH_UNAUTHORIZED]: "Vous n'êtes pas autorisé à effectuer cette action.",
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: "Veuillez vérifier votre adresse email avant de continuer.",

  [ErrorCode.VALIDATION_ERROR]: "Les données saisies ne sont pas valides.",
  [ErrorCode.INVALID_INPUT]: "Entrée invalide. Veuillez vérifier vos informations.",
  [ErrorCode.MISSING_REQUIRED_FIELD]: "Certains champs obligatoires sont manquants.",

  [ErrorCode.NOT_FOUND]: "L'élément demandé n'a pas été trouvé.",
  [ErrorCode.DUPLICATE_ENTRY]: "Cet élément existe déjà.",
  [ErrorCode.DATA_INTEGRITY_ERROR]: "Erreur d'intégrité des données.",

  [ErrorCode.SERVER_ERROR]: "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
  [ErrorCode.SERVICE_UNAVAILABLE]: "Le service est temporairement indisponible.",
  [ErrorCode.RATE_LIMITED]: "Trop de requêtes. Veuillez patienter avant de réessayer.",

  [ErrorCode.PERMISSION_DENIED]: "Vous n'avez pas les permissions nécessaires.",
  [ErrorCode.OPERATION_FAILED]: "L'opération a échoué. Veuillez réessayer.",
  [ErrorCode.TRIBU_CHANGE_LIMIT_REACHED]: "Vous avez atteint la limite de changements de tribu.",
  [ErrorCode.DONATION_MINIMUM_NOT_MET]: "Le montant minimum n'est pas atteint.",

  [ErrorCode.UNKNOWN_ERROR]: "Une erreur inattendue est survenue.",
};

/**
 * Classe de base pour les erreurs de l'application
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly metadata?: Record<string, unknown>;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message?: string,
    options?: {
      statusCode?: number;
      metadata?: Record<string, unknown>;
      isOperational?: boolean;
      cause?: Error;
    }
  ) {
    const errorMessage = message || ErrorMessages[code];
    super(errorMessage);

    this.name = "AppError";
    this.code = code;
    this.statusCode = options?.statusCode;
    this.metadata = options?.metadata;
    this.isOperational = options?.isOperational ?? true;
    this.timestamp = new Date().toISOString();

    // Préserver la stack trace de la cause si présente
    if (options?.cause) {
      this.cause = options.cause;
    }

    // Capture la stack trace
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Convertit l'erreur en objet JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      metadata: this.metadata,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Erreur réseau
 */
export class NetworkError extends AppError {
  constructor(message?: string, cause?: Error) {
    super(ErrorCode.NETWORK_ERROR, message, { cause });
    this.name = "NetworkError";
  }
}

/**
 * Erreur d'authentification
 */
export class AuthError extends AppError {
  constructor(code: ErrorCode, message?: string, cause?: Error) {
    super(code, message, { statusCode: 401, cause });
    this.name = "AuthError";
  }
}

/**
 * Erreur de validation
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string>;

  constructor(
    fields: Record<string, string>,
    message?: string
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, {
      statusCode: 400,
      metadata: { fields },
    });
    this.name = "ValidationError";
    this.fields = fields;
  }
}

/**
 * Erreur "Non trouvé"
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(ErrorCode.NOT_FOUND, `${resource}${id ? ` (${id})` : ""} non trouvé`, {
      statusCode: 404,
      metadata: { resource, id },
    });
    this.name = "NotFoundError";
  }
}

/**
 * Erreur de permission
 */
export class PermissionError extends AppError {
  constructor(action: string, message?: string) {
    super(ErrorCode.PERMISSION_DENIED, message, {
      statusCode: 403,
      metadata: { action },
    });
    this.name = "PermissionError";
  }
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Type pour le résultat d'une opération (success/failure pattern)
 */
export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Crée un résultat de succès
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Crée un résultat d'échec
 */
export function failure<E extends AppError>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Convertit une erreur Supabase en AppError
 */
export function fromSupabaseError(error: {
  message?: string;
  code?: string;
  status?: number;
}): AppError {
  // Mapper les codes d'erreur Supabase
  const supabaseErrorMap: Record<string, ErrorCode> = {
    "PGRST116": ErrorCode.NOT_FOUND,
    "23505": ErrorCode.DUPLICATE_ENTRY,
    "42501": ErrorCode.PERMISSION_DENIED,
    "invalid_credentials": ErrorCode.AUTH_INVALID_CREDENTIALS,
    "user_not_found": ErrorCode.AUTH_INVALID_CREDENTIALS,
    "email_not_confirmed": ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
  };

  const code = error.code ? supabaseErrorMap[error.code] : undefined;

  return new AppError(
    code || ErrorCode.SERVER_ERROR,
    error.message,
    {
      statusCode: error.status,
      metadata: { originalCode: error.code },
    }
  );
}

/**
 * Gère une erreur de manière centralisée
 */
export function handleError(error: unknown, context?: string): AppError {
  // Si c'est déjà une AppError, la retourner
  if (error instanceof AppError) {
    Logger.error(error.message, error.toJSON(), context);
    return error;
  }

  // Si c'est une Error standard
  if (error instanceof Error) {
    Logger.logError(error, { context }, context);
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, {
      cause: error,
    });
  }

  // Si c'est une string
  if (typeof error === "string") {
    Logger.error(error, undefined, context);
    return new AppError(ErrorCode.UNKNOWN_ERROR, error);
  }

  // Erreur inconnue
  Logger.error("Erreur inconnue", { error }, context);
  return new AppError(ErrorCode.UNKNOWN_ERROR);
}

/**
 * Wrapper pour les appels async avec gestion d'erreur
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<Result<T, AppError>> {
  try {
    const data = await fn();
    return success(data);
  } catch (error) {
    return failure(handleError(error, context));
  }
}

/**
 * Vérifie si une erreur est une erreur de réseau
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof AppError && error.code === ErrorCode.NETWORK_ERROR) return true;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection")
    );
  }
  return false;
}

/**
 * Vérifie si une erreur est une erreur d'authentification
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AuthError) return true;
  if (error instanceof AppError) {
    return [
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      ErrorCode.AUTH_SESSION_EXPIRED,
      ErrorCode.AUTH_UNAUTHORIZED,
    ].includes(error.code);
  }
  return false;
}
