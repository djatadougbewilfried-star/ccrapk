/**
 * Store d'authentification avec Zustand
 * Source unique de vérité pour l'état d'authentification
 */

import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isActionLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setActionLoading: (isActionLoading: boolean) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setError: (error: string | null) => void;

  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: object) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isActionLoading: false,
  isAuthenticated: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setActionLoading: (isActionLoading) => set({ isActionLoading }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setError: (error) => set({ error }),

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erreur d'initialisation:", error);
        set({ error: error.message, isLoading: false });
        return;
      }

      if (session) {
        set({
          user: session.user,
          session,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Erreur inattendue:", error);
      set({ error: "Une erreur inattendue s'est produite" });
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = error.message;

        // Traduction des erreurs courantes
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou mot de passe incorrect";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Veuillez confirmer votre email avant de vous connecter";
        }

        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      const message = "Une erreur inattendue s'est produite";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  signUp: async (email, password, metadata = {}) => {
    try {
      set({ isLoading: true, error: null });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        let errorMessage = error.message;

        if (error.message.includes("already registered")) {
          errorMessage = "Cet email est déjà utilisé";
        }

        set({ error: errorMessage, isLoading: false });
        return { success: false, error: errorMessage };
      }

      // Vérifier si une confirmation email est nécessaire
      if (data.user && !data.session) {
        set({ isLoading: false });
        return {
          success: true,
          error: "Veuillez vérifier votre email pour confirmer votre inscription",
        };
      }

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.session,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      const message = "Une erreur inattendue s'est produite";
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Erreur de déconnexion:", error);
      }

      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        isActionLoading: false,
      });
    } catch (error) {
      console.error("Erreur inattendue:", error);
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        isActionLoading: false,
      });
    }
  },

  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "ccr-app://reset-password",
      });

      set({ isLoading: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },
}));