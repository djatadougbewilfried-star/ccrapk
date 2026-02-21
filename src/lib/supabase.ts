/**
 * Configuration du client Supabase
 * Utilise les variables d'environnement pour la sécurité
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient as SupabaseClientType } from "@supabase/supabase-js";

// Récupération sécurisée des variables d'environnement
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validation des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variables d'environnement Supabase manquantes. " +
    "Assurez-vous que EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY " +
    "sont définis dans votre fichier .env"
  );
}

// Création du client Supabase avec configuration optimisée
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // Configuration pour la performance
  global: {
    headers: {
      "x-client-info": "ccr-app",
    },
  },
  // Configuration des retries
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type SupabaseClient = SupabaseClientType;

// Export des utilitaires de configuration
export const getSupabaseUrl = () => supabaseUrl;
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);
