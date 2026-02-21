/**
 * Service pour la gestion des profils utilisateurs
 */

import { supabase } from "../lib/supabase";
import { Profile, UpdateProfileData, calculateProfileCompletion } from "../types/database";

export const profileService = {
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  async getCurrentProfile(): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: "Utilisateur non connecté" };
      }

      // Essayer de récupérer le profil
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          church:churches(*),
          tribu:tribus(*)
        `)
        .eq("id", user.id)
        .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter l'erreur si 0 rows

      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return { data: null, error: error.message };
      }

      // Si le profil n'existe pas, le créer
      if (!data) {
        console.log("Profil non trouvé, création en cours...");
        const newProfile = await this.createProfile(user.id, user.email || "", user.user_metadata);
        return newProfile;
      }

      return { data: data as Profile, error: null };
    } catch (error) {
      console.error("Erreur inattendue:", error);
      return { data: null, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Créer un nouveau profil
   */
  async createProfile(
    userId: string, 
    email: string, 
    metadata?: { first_name?: string; last_name?: string; phone?: string }
  ): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: email,
          first_name: metadata?.first_name || "",
          last_name: metadata?.last_name || "",
          phone: metadata?.phone || "",
          status: "Active",
          role: "Fidele",
          profile_completion: 20, // Démarre à 20% après inscription Phase 1 (nom, téléphone, genre)
        })
        .select()
        .single();

      if (error) {
        console.error("Erreur lors de la création du profil:", error);
        return { data: null, error: error.message };
      }

      return { data: data as Profile, error: null };
    } catch (error) {
      console.error("Erreur inattendue:", error);
      return { data: null, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Mettre à jour le profil de l'utilisateur
   */
  async updateProfile(updates: UpdateProfileData): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      // S'assurer que le profil existe
      const { data: existingProfile } = await this.getCurrentProfile();
      
      if (!existingProfile) {
        return { success: false, error: "Profil non trouvé" };
      }

      // Calculer la complétion du profil
      const updatedProfile = { ...existingProfile, ...updates } as Profile;
      const completion = calculateProfileCompletion(updatedProfile);

      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          profile_completion: completion,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Erreur inattendue:", error);
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Mettre à jour la photo de profil
   */
  async updateProfilePhoto(uri: string): Promise<{ url: string | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { url: null, error: "Utilisateur non connecté" };
      }

      // Créer un nom de fichier unique
      const fileExt = uri.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Lire le fichier
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        console.error("Erreur lors de l'upload:", uploadError);
        return { url: null, error: uploadError.message };
      }

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from("profiles")
        .getPublicUrl(filePath);

      // Mettre à jour le profil avec la nouvelle URL
      await this.updateProfile({ photo_url: publicUrl });

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error("Erreur inattendue:", error);
      return { url: null, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Affecter l'utilisateur à une église
   */
  async assignToChurch(churchId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      // S'assurer que le profil existe
      await this.getCurrentProfile();

      const { error } = await supabase
        .from("profiles")
        .update({ church_id: churchId })
        .eq("id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Affecter l'utilisateur à une tribu
   */
  async assignToTribu(tribuId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      // S'assurer que le profil existe d'abord
      const { data: profile, error: profileError } = await this.getCurrentProfile();
      
      if (profileError || !profile) {
        return { success: false, error: "Profil non trouvé. Veuillez d'abord compléter votre profil." };
      }

      // Mettre à jour le profil avec la tribu
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ tribu_id: tribuId })
        .eq("id", user.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Ajouter dans la table tribu_members
      const { error: memberError } = await supabase
        .from("tribu_members")
        .upsert({
          tribu_id: tribuId,
          user_id: user.id,
          status: "Active",
        }, {
          onConflict: "user_id"
        });

      if (memberError) {
        console.error("Erreur lors de l'ajout à la tribu:", memberError);
        // Ne pas retourner d'erreur car le profil a été mis à jour
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },
};