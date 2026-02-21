/**
 * Index des types - Point d'entrée centralisé pour tous les types
 * Résout les problèmes de duplication en réexportant de manière cohérente
 */

// ============================================
// RÉEXPORTS depuis database.ts (source de vérité)
// ============================================

export type {
  // Entités principales
  Church,
  Tribu,
  Profile,
  Role,
  TribuMember,
  UserRole,

  // Formations
  Formation,
  FormationSession,
  FormationModule,
  FormationEnrollment,
  FormationProgress,

  // Prière
  PrayerLog,
  PrayerGoal,
  FastingLog,
  PrayerRequest,
  PrayerStreak,

  // Finances
  DonationType,
  Donation,
  DonationReceipt,
  FundraisingProject,
  CreateDonationData,
  DonationStats,
  PaymentMethod,
  PaymentStatus,

  // Événements
  Event,
  EventRegistration,
  EventReminder,
  EventType,
  EventStatus,
  RegistrationStatus,

  // Communication
  Announcement,
  AnnouncementRead,
  Notification,
  AnnouncementType,
  NotificationType,

  // Ministères
  Ministere,
  Department,
  DepartmentMember,
  Zone,
  FamilleReveil,
  FamilleMember,
  FamilleReport,

  // Administration
  ChurchStats,
  ValidationRequest,
  ActivityLog,
  ChurchSettings,
  ServiceTime,
  MemberListItem,

  // Mise à jour profil (source de vérité)
  UpdateProfileData,
} from "./database";

// Réexport des fonctions utilitaires
export { calculateProfileCompletion } from "./database";

// ============================================
// RÉEXPORTS depuis auth.ts
// ============================================

export type {
  AuthState,
  RegisterStep1Data,
  RegisterStep2Data,
  RegisterStep3Data,
  RegisterStep4Data,
  RegisterData,
  LoginData,
  AuthResponse,
  UserProfile,
} from "./auth";

// ============================================
// TYPES GÉNÉRIQUES RÉUTILISABLES
// ============================================

/**
 * Type générique pour les résultats d'API
 */
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Alias pour compatibilité
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Type pour la pagination
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Alias pour compatibilité
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Type pour les options de pagination
 */
export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Type pour les filtres de recherche
 */
export interface SearchFilters {
  query?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

/**
 * Type pour les options de sélection
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Type pour les erreurs de champ de formulaire
 */
export interface FormFieldError {
  field: string;
  message: string;
}

/**
 * Type pour les statuts génériques
 */
export type Status = "Pending" | "Active" | "Completed" | "Cancelled" | "Failed";
export type GenericStatus = "pending" | "active" | "inactive" | "deleted";

/**
 * Type pour les genres
 */
export type Gender = "Homme" | "Femme";

/**
 * Type pour les états civils
 */
export type MaritalStatus = "Célibataire" | "Marié(e)" | "Veuf(ve)" | "Divorcé(e)";

/**
 * Type pour les rôles utilisateur
 */
export type UserRoleType =
  | "member"
  | "servant"
  | "deacon"
  | "elder"
  | "pastor"
  | "admin"
  | "super_admin";

/**
 * Type pour les niveaux d'urgence
 */
export type UrgencyLevel = "normal" | "urgent" | "critical";

/**
 * Type pour les statuts de validation
 */
export type ValidationStatus = "pending" | "approved" | "rejected" | "cancelled";

/**
 * Type pour les informations de localisation
 */
export interface LocationInfo {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  neighborhood?: string;
}

/**
 * Type pour les métadonnées de fichier
 */
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

/**
 * Type pour les paramètres de notification push
 */
export interface PushNotificationParams {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: string;
}

/**
 * Type pour le contexte de l'application
 */
export interface AppContext {
  isOnline: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  churchId: string | null;
  userRole: UserRoleType | null;
}

/**
 * Type pour les paramètres de navigation
 */
export type RootStackParamList = {
  "(auth)": undefined;
  "(tabs)": undefined;
  login: undefined;
  register: undefined;
  "forgot-password": undefined;
};
