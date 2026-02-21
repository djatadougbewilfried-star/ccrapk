/**
 * Hook d'authentification - Centre Chretien de Reveil
 * Gere l'inscription, la connexion et la deconnexion
 * Le profil est cree automatiquement par un trigger Supabase
 *
 * Ce hook delegue entierement a authStore (source unique de verite)
 * et synchronise le profil utilisateur avec userStore.
 */

import { supabase } from "../lib/supabase";
import { useUserStore } from "../stores/userStore";
import { useAuthStore } from "../stores/authStore";

interface SignUpData {
  first_name: string;
  last_name: string;
  phone: string;
  gender: "Homme" | "Femme";
  consent_data_processing?: boolean;
  consent_communications?: boolean;
  consent_date?: string;
}

interface AuthResult {
  error: string | null;
  success: boolean;
}

export function useAuth() {
  const { setUser, clearUser } = useUserStore();
  const {
    isAuthenticated,
    isLoading: authStoreLoading,
    isActionLoading,
    setActionLoading,
    setUser: setAuthUser,
    setSession: setAuthSession,
  } = useAuthStore();

  // Combine initialization loading and action loading
  const isLoading = authStoreLoading || isActionLoading;

  /**
   * Inscription d'un nouvel utilisateur
   * Le profil est cree automatiquement par le trigger Supabase
   */
  const signUp = async (
    email: string,
    password: string,
    userData: SignUpData
  ): Promise<AuthResult> => {
    setActionLoading(true);

    try {
      // Creer l'utilisateur avec les metadonnees
      // Le trigger creera automatiquement le profil
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            gender: userData.gender,
          },
        },
      });

      if (authError) {
        console.error("Erreur auth:", authError);

        if (authError.message.includes("already registered")) {
          return {
            error: "Cet email est deja utilise. Essayez de vous connecter.",
            success: false,
          };
        }

        if (authError.message.includes("valid email")) {
          return {
            error: "Veuillez entrer une adresse email valide.",
            success: false,
          };
        }

        return { error: authError.message, success: false };
      }

      if (!authData.user) {
        return { error: "Erreur lors de la creation du compte", success: false };
      }

      // Deconnecter pour forcer la connexion manuelle
      await supabase.auth.signOut();

      return { error: null, success: true };
    } catch (error) {
      console.error("Erreur inscription:", error);
      return { error: "Une erreur inattendue s'est produite", success: false };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Connexion d'un utilisateur existant
   */
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setActionLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erreur connexion:", error);

        if (error.message.includes("Invalid login credentials")) {
          return { error: "Email ou mot de passe incorrect", success: false };
        }
        if (error.message.includes("Email not confirmed")) {
          return {
            error: "Veuillez confirmer votre email avant de vous connecter",
            success: false,
          };
        }

        return { error: error.message, success: false };
      }

      if (data.user) {
        // Update authStore with auth user and session
        setAuthUser(data.user);
        setAuthSession(data.session);

        // Charger le profil utilisateur
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("Erreur chargement profil:", profileError);
        }

        if (profile) {
          // Verifier si le compte est suspendu ou supprime
          if (profile.status === "Suspended") {
            await supabase.auth.signOut();
            setAuthUser(null);
            setAuthSession(null);
            return {
              error: "Votre compte a ete suspendu. Veuillez contacter l'administration de votre eglise.",
              success: false,
            };
          }

          if (profile.status === "Deleted") {
            await supabase.auth.signOut();
            setAuthUser(null);
            setAuthSession(null);
            return {
              error: "Ce compte a ete supprime. Veuillez contacter l'administration pour plus d'informations.",
              success: false,
            };
          }

          setUser(profile);
        }
      }

      return { error: null, success: true };
    } catch (error) {
      console.error("Erreur connexion:", error);
      return { error: "Une erreur inattendue s'est produite", success: false };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Deconnexion
   */
  const signOut = async (): Promise<AuthResult> => {
    setActionLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: error.message, success: false };
      }

      // Clear both stores
      clearUser();
      setAuthUser(null);
      setAuthSession(null);

      return { error: null, success: true };
    } catch (error) {
      console.error("Erreur deconnexion:", error);
      return { error: "Une erreur inattendue s'est produite", success: false };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Reinitialisation du mot de passe
   */
  const resetPassword = async (email: string): Promise<AuthResult> => {
    setActionLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "ccr-app://reset-password",
      });

      if (error) {
        return { error: error.message, success: false };
      }

      return { error: null, success: true };
    } catch (error) {
      console.error("Erreur reset password:", error);
      return { error: "Une erreur inattendue s'est produite", success: false };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Recuperer la session actuelle
   */
  const getSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  };

  /**
   * Recuperer l'utilisateur actuel
   */
  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  };

  return {
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    resetPassword,
    getSession,
    getCurrentUser,
  };
}
