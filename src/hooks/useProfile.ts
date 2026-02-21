/**
 * Hook personnalisé pour la gestion du profil utilisateur
 */

import { useState, useEffect, useCallback } from "react";
import { profileService } from "../services/profile.service";
import { Profile, UpdateProfileData } from "../types/database";
import { useAuthStore } from "../stores/authStore";

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  // Charger le profil
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await profileService.getCurrentProfile();

    if (fetchError) {
      setError(fetchError);
    } else {
      setProfile(data);
    }

    setIsLoading(false);
  }, [user]);

  // Charger le profil au montage et quand l'utilisateur change
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Mettre à jour le profil
  const updateProfile = async (updates: UpdateProfileData): Promise<boolean> => {
    setError(null);
    
    const { success, error: updateError } = await profileService.updateProfile(updates);

    if (updateError) {
      setError(updateError);
      return false;
    }

    // Recharger le profil après la mise à jour
    await loadProfile();
    return success;
  };

  // Mettre à jour la photo de profil
  const updatePhoto = async (uri: string): Promise<string | null> => {
    setError(null);
    
    const { url, error: uploadError } = await profileService.updateProfilePhoto(uri);

    if (uploadError) {
      setError(uploadError);
      return null;
    }

    // Recharger le profil après la mise à jour
    await loadProfile();
    return url;
  };

  // Affecter à une église
  const assignToChurch = async (churchId: string): Promise<boolean> => {
    const { success, error: assignError } = await profileService.assignToChurch(churchId);
    
    if (assignError) {
      setError(assignError);
      return false;
    }

    await loadProfile();
    return success;
  };

  // Affecter à une tribu
  const assignToTribu = async (tribuId: string): Promise<boolean> => {
    const { success, error: assignError } = await profileService.assignToTribu(tribuId);
    
    if (assignError) {
      setError(assignError);
      return false;
    }

    await loadProfile();
    return success;
  };

  return {
    profile,
    isLoading,
    error,
    loadProfile,
    updateProfile,
    updatePhoto,
    assignToChurch,
    assignToTribu,
  };
};