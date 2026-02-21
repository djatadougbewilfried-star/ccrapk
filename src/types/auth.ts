/**
 * Types pour l'authentification et les utilisateurs
 */

import { Session, User } from "@supabase/supabase-js";

// État de l'authentification
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Données d'inscription - Étape 1
export interface RegisterStep1Data {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Données d'inscription - Étape 2
export interface RegisterStep2Data {
  firstName: string;
  lastName: string;
  gender: "Homme" | "Femme";
  dateOfBirth: Date;
  maritalStatus: "Célibataire" | "Marié(e)" | "Veuf(ve)" | "Divorcé(e)";
}

// Données d'inscription - Étape 3
export interface RegisterStep3Data {
  city: string;
  neighborhood: string;
  address?: string;
  profession?: string;
  churchId: string;
}

// Données d'inscription - Étape 4 (Confirmation)
export interface RegisterStep4Data {
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptCommunications: boolean;
}

// Données complètes d'inscription
export interface RegisterData extends 
  RegisterStep1Data, 
  RegisterStep2Data, 
  RegisterStep3Data, 
  RegisterStep4Data {}

// Données de connexion
export interface LoginData {
  identifier: string; // Email ou téléphone
  password: string;
  rememberMe?: boolean;
}

// Réponse d'authentification
export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

// Profil utilisateur (extension de auth.users)
export interface UserProfile {
  id: string;
  churchId: string;
  
  // Identité
  firstName: string;
  lastName: string;
  fullName: string;
  gender: "Homme" | "Femme";
  dateOfBirth: Date;
  photoUrl?: string;
  
  // Contact
  email?: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  city: string;
  neighborhood?: string;
  
  // Situation
  maritalStatus: "Célibataire" | "Marié(e)" | "Veuf(ve)" | "Divorcé(e)";
  profession?: string;
  employer?: string;
  
  // Spirituel
  dateJoined?: Date;
  isBaptized: boolean;
  baptismDate?: Date;
  baptismCertificateUrl?: string;
  
  // Système
  role: string;
  status: "Pending" | "Active" | "Suspended" | "Deleted";
  profileCompletion: number;
  lastLogin?: Date;
  
  // Tribu
  tribuId?: string;
  tribuName?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Données de mise à jour du profil
export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  neighborhood?: string;
  profession?: string;
  employer?: string;
  photoUrl?: string;
}