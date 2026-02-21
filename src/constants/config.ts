/**
 * Configuration globale de l'application CCR
 * Les valeurs sensibles sont récupérées des variables d'environnement
 */

// Configuration de l'église par défaut
const DEFAULT_CHURCH_ID = process.env.EXPO_PUBLIC_DEFAULT_CHURCH_ID || "00000000-0000-0000-0000-000000000001";

export const Config = {
  // Informations de l'application
  app: {
    name: "CCR",
    fullName: "Centre Chrétien de Réveil",
    description: "Écosystème Numérique de Croissance d'Église",
    version: process.env.EXPO_PUBLIC_APP_VERSION || "1.0.0",
    buildNumber: 1,
    env: process.env.EXPO_PUBLIC_APP_ENV || "development",
  },

  // Configuration de l'église
  church: {
    defaultId: DEFAULT_CHURCH_ID,
    name: "Centre Chrétien de Réveil",
    slogan: "Aimer Dieu de tout son cœur",
  },

  // Configuration de l'authentification
  auth: {
    // Durée de validité de l'OTP (en minutes)
    otpExpiryMinutes: 10,
    // Nombre maximum de tentatives de connexion
    maxLoginAttempts: 5,
    // Durée du blocage après trop de tentatives (en minutes)
    lockoutDurationMinutes: 15,
    // Longueur minimale du mot de passe
    minPasswordLength: 8,
  },

  // Configuration des paiements
  payments: {
    currency: "XOF",
    currencySymbol: "FCFA",
    // Montants minimum par type de don
    minimumAmounts: {
      dime: 100,
      offering: 100,
      special: 500,
    },
    // Méthodes de paiement disponibles
    methods: ["mtn_momo", "orange_money", "wave", "cash", "bank"] as const,
  },

  // Configuration de l'API
  api: {
    timeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 30000,
    retryAttempts: Number(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS) || 3,
    retryDelay: 1000, // 1 seconde
  },

  // Configuration du cache
  cache: {
    // Durée de cache par défaut (en millisecondes)
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    // Durée de cache pour les données statiques
    staticTTL: 24 * 60 * 60 * 1000, // 24 heures
    // Durée de cache pour les données utilisateur
    userTTL: 10 * 60 * 1000, // 10 minutes
  },

  // Paramètres régionaux
  locale: {
    default: "fr-CI",
    timezone: "Africa/Abidjan",
    country: "Côte d'Ivoire",
    countryCode: "CI",
    phonePrefix: "+225",
    dateFormat: "dd/MM/yyyy",
    timeFormat: "HH:mm",
  },

  // Liens externes
  links: {
    privacyPolicy: "https://ccr.church/privacy",
    termsOfService: "https://ccr.church/terms",
    support: "https://ccr.church/support",
    website: "https://ccr.church",
  },

  // Configuration des formations
  formations: {
    academieReveil: {
      durationMonths: 9,
      modulesCount: 7,
    },
    ecoleDesBergers: {
      durationMonths: 6,
    },
  },

  // Configuration de la prière
  prayer: {
    // Durée minimale de prière pour compter (en minutes)
    minimumDurationMinutes: 5,
    // Objectif quotidien par défaut (en minutes)
    dailyGoalMinutes: 30,
  },

  // Configuration des tribus
  tribu: {
    // Nombre maximum de changements de tribu autorisés
    maxChangeRequests: 12,
    // Délai minimum entre les changements (en mois)
    changeCooldownMonths: 3,
  },

  // Feature flags
  features: {
    enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === "true",
    enableCrashReporting: process.env.EXPO_PUBLIC_ENABLE_CRASH_REPORTING === "true",
    enableOfflineMode: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE !== "false",
    enablePushNotifications: true,
    enableBiometricAuth: false,
  },

  // Configuration du stockage
  storage: {
    keys: {
      authToken: "ccr_auth_token",
      userProfile: "ccr_user_profile",
      settings: "ccr_settings",
      offlineData: "ccr_offline_data",
      lastSync: "ccr_last_sync",
    },
    buckets: {
      profiles: "profiles",
      documents: "documents",
      events: "events",
    },
  },
} as const;

export type AppConfig = typeof Config;

// Export des utilitaires de configuration
export const getChurchId = () => Config.church.defaultId;
export const isProduction = () => Config.app.env === "production";
export const isDevelopment = () => Config.app.env === "development";
