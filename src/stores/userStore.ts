/**
 * Store utilisateur - Centre Chrétien de Réveil
 * Gère l'état de l'utilisateur connecté avec Zustand
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Type du profil utilisateur (unifié avec database.ts Profile)
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: "Homme" | "Femme";
  photo_url?: string;
  role: string;
  status: string;
  church_id?: string;
  tribu_id?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  marital_status?: string;
  profession?: string;
  employer?: string;
  whatsapp?: string;
  is_admin?: boolean;
  is_baptized?: boolean;
  baptism_date?: string;
  baptism_certificate_url?: string;
  date_joined?: string;
  profile_completion?: number;
  consent_data_processing?: boolean;
  consent_communications?: boolean;
  consent_date?: string;
  number_of_children?: number;
  country?: string;
  referral_source?: string;
  created_at: string;
  updated_at: string;
}

// Type du store
interface UserStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

// Création du store avec persistance
export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Définir l'utilisateur (après connexion)
      setUser: (user: UserProfile) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Mettre à jour partiellement l'utilisateur
      updateUser: (updates: Partial<UserProfile>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      // Effacer l'utilisateur (déconnexion)
      clearUser: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Définir l'état de chargement
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "ccr-user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Ne persister que certains champs
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook utilitaire pour obtenir le nom complet
export const useUserFullName = () => {
  const user = useUserStore((state) => state.user);
  if (!user) return "";
  return `${user.first_name} ${user.last_name}`.trim();
};

// Hook utilitaire pour obtenir les initiales
export const useUserInitials = () => {
  const user = useUserStore((state) => state.user);
  if (!user) return "";
  const firstInitial = user.first_name?.charAt(0) || "";
  const lastInitial = user.last_name?.charAt(0) || "";
  return `${firstInitial}${lastInitial}`.toUpperCase();
};