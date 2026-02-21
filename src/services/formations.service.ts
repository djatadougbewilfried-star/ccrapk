/**
 * Service Formations - Centre Chrétien de Réveil
 * Gère toutes les opérations liées aux formations
 */

import { supabase } from "../lib/supabase";

// Types
export interface Formation {
  id: string;
  church_id: string | null;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  duration_months: number;
  is_mandatory: boolean;
  icon: string | null;
  color: string | null;
  requires_academie: boolean;
  requires_pastor_approval: boolean;
  order_index: number;
  created_at: string | null;
  modules_count?: number;
  sessions?: FormationSession[];
}

export interface FormationSession {
  id: string;
  formation_id: string;
  name: string;
  start_date: string;
  end_date: string | null;
  month: number | null;
  year: number | null;
  max_participants: number | null;
  status: string;
  is_open: boolean;
  opened_at: string | null;
  responsible_id: string | null;
  created_at: string | null;
  enrolled_count?: number;
}

export interface FormationModule {
  id: string;
  formation_id: string;
  name: string;
  description: string | null;
  order_index: number;
  duration_weeks: number | null;
  estimated_hours: number | null;
  content_url: string | null;
  content_type: string | null;
  created_at: string | null;
}

export interface FormationEnrollment {
  id: string;
  session_id: string;
  user_id: string;
  class_id: string | null;
  professor_id: string | null;
  status: string;
  motivation: string | null;
  enrolled_at: string;
  validated_by: string | null;
  validated_at: string | null;
  rejection_reason: string | null;
  completed_at: string | null;
  final_score: number | null;
  certificate_url: string | null;
  session?: FormationSession;
  formation?: Formation;
}

export interface FormationProgress {
  id: string;
  enrollment_id: string;
  module_id: string;
  status: string;
  progress_percent: number;
  score: number | null;
  completed_at: string | null;
  module?: FormationModule;
}

export interface FormationAccessRequest {
  id: string;
  formation_id: string;
  user_id: string;
  motivation: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  formation?: Formation;
}

export interface CreateEnrollmentData {
  session_id: string;
  motivation: string;
}

export interface CreateAccessRequestData {
  formation_id: string;
  motivation: string;
}

/**
 * Récupérer toutes les formations
 */
export const getFormations = async (): Promise<Formation[]> => {
  try {
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Erreur récupération formations:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer une formation par ID
 */
export const getFormationById = async (formationId: string): Promise<Formation | null> => {
  try {
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .eq("id", formationId)
      .single();

    if (error) {
      console.error("Erreur récupération formation:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur:", err);
    return null;
  }
};

/**
 * Récupérer une formation par slug
 */
export const getFormationBySlug = async (slug: string): Promise<Formation | null> => {
  try {
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Erreur récupération formation:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur:", err);
    return null;
  }
};

/**
 * Récupérer les sessions d'une formation
 */
export const getFormationSessions = async (formationId: string): Promise<FormationSession[]> => {
  try {
    const { data, error } = await supabase
      .from("formation_sessions")
      .select("*")
      .eq("formation_id", formationId)
      .order("year", { ascending: true })
      .order("month", { ascending: true });

    if (error) {
      console.error("Erreur récupération sessions:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer les modules d'une formation
 */
export const getFormationModules = async (formationId: string): Promise<FormationModule[]> => {
  try {
    const { data, error } = await supabase
      .from("formation_modules")
      .select("*")
      .eq("formation_id", formationId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Erreur récupération modules:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer les inscriptions d'un utilisateur
 */
export const getUserEnrollments = async (userId: string): Promise<FormationEnrollment[]> => {
  try {
    const { data, error } = await supabase
      .from("formation_enrollments")
      .select(`
        *,
        session:formation_sessions (
          *,
          formation:formations (*)
        )
      `)
      .eq("user_id", userId)
      .order("enrolled_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération inscriptions:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      session: item.session || null,
      formation: item.session?.formation || null,
    }));
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Vérifier si l'utilisateur est inscrit à une formation
 */
export const isUserEnrolledInFormation = async (
  userId: string,
  formationId: string
): Promise<{ enrolled: boolean; enrollment?: FormationEnrollment }> => {
  try {
    const { data, error } = await supabase
      .from("formation_enrollments")
      .select(`
        *,
        session:formation_sessions!inner (
          formation_id
        )
      `)
      .eq("user_id", userId)
      .eq("session.formation_id", formationId)
      .in("status", ["pending", "approved", "in_progress"])
      .maybeSingle();

    if (error || !data) {
      return { enrolled: false };
    }

    return { enrolled: true, enrollment: data };
  } catch (err) {
    return { enrolled: false };
  }
};

/**
 * Vérifier si l'utilisateur a complété l'Académie
 */
export const hasCompletedAcademie = async (userId: string): Promise<boolean> => {
  try {
    const academie = await getFormationBySlug("academie-reveil");
    if (!academie) return false;

    const { data, error } = await supabase
      .from("formation_enrollments")
      .select(`
        status,
        session:formation_sessions!inner (
          formation_id
        )
      `)
      .eq("user_id", userId)
      .eq("session.formation_id", academie.id)
      .eq("status", "completed")
      .maybeSingle();

    return !!data;
  } catch (err) {
    return false;
  }
};

/**
 * Vérifier si l'utilisateur est inscrit à l'Académie (en cours)
 */
export const isEnrolledInAcademie = async (userId: string): Promise<boolean> => {
  try {
    const academie = await getFormationBySlug("academie-reveil");
    if (!academie) return false;

    const result = await isUserEnrolledInFormation(userId, academie.id);
    return result.enrolled;
  } catch (err) {
    return false;
  }
};

/**
 * Vérifier si l'utilisateur peut s'inscrire à une formation
 */
export const canEnrollInFormation = async (
  userId: string,
  formation: Formation
): Promise<{ canEnroll: boolean; reason?: string }> => {
  try {
    // Vérifier si déjà inscrit
    const { enrolled } = await isUserEnrolledInFormation(userId, formation.id);
    if (enrolled) {
      return { canEnroll: false, reason: "Vous êtes déjà inscrit à cette formation" };
    }

    // Vérifier le pré-requis Académie
    if (formation.requires_academie) {
      const hasAcademie = await hasCompletedAcademie(userId);
      const inAcademie = await isEnrolledInAcademie(userId);
      
      if (!hasAcademie && !inAcademie) {
        return { 
          canEnroll: false, 
          reason: "Vous devez être inscrit ou avoir complété l'Académie de Réveil" 
        };
      }
    }

    // Vérifier si approbation pastorale requise (École de Mission)
    if (formation.requires_pastor_approval) {
      const { data } = await supabase
        .from("formation_access_requests")
        .select("status")
        .eq("formation_id", formation.id)
        .eq("user_id", userId)
        .eq("status", "approved")
        .maybeSingle();

      if (!data) {
        return { 
          canEnroll: false, 
          reason: "Cette formation nécessite une recommandation pastorale" 
        };
      }
    }

    return { canEnroll: true };
  } catch (err) {
    return { canEnroll: false, reason: "Erreur de vérification" };
  }
};

/**
 * Créer une inscription à une formation
 */
export const createEnrollment = async (
  userId: string,
  data: CreateEnrollmentData
): Promise<{ success: boolean; enrollment?: FormationEnrollment; error?: string }> => {
  try {
    // Récupérer la session pour avoir la formation
    const { data: session, error: sessionError } = await supabase
      .from("formation_sessions")
      .select("*, formation:formations(*)")
      .eq("id", data.session_id)
      .single();

    if (sessionError || !session) {
      return { success: false, error: "Session introuvable" };
    }

    // Vérifier si peut s'inscrire
    const canEnroll = await canEnrollInFormation(userId, session.formation);
    if (!canEnroll.canEnroll) {
      return { success: false, error: canEnroll.reason };
    }

    // Créer l'inscription
    const { data: enrollment, error } = await supabase
      .from("formation_enrollments")
      .insert({
        session_id: data.session_id,
        user_id: userId,
        motivation: data.motivation,
        status: "pending",
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création inscription:", error);
      return { success: false, error: "Erreur lors de l'inscription" };
    }

    return { success: true, enrollment };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Créer une demande d'accès à l'École de Mission
 */
export const createAccessRequest = async (
  userId: string,
  data: CreateAccessRequestData
): Promise<{ success: boolean; request?: FormationAccessRequest; error?: string }> => {
  try {
    // Vérifier si une demande existe déjà
    const { data: existing } = await supabase
      .from("formation_access_requests")
      .select("id, status")
      .eq("formation_id", data.formation_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      if (existing.status === "pending") {
        return { success: false, error: "Vous avez déjà une demande en attente" };
      }
      if (existing.status === "approved") {
        return { success: false, error: "Votre demande a déjà été approuvée" };
      }
    }

    // Créer la demande
    const { data: request, error } = await supabase
      .from("formation_access_requests")
      .insert({
        formation_id: data.formation_id,
        user_id: userId,
        motivation: data.motivation,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création demande:", error);
      return { success: false, error: "Erreur lors de la création de la demande" };
    }

    return { success: true, request };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Récupérer les demandes d'accès d'un utilisateur
 */
export const getUserAccessRequests = async (userId: string): Promise<FormationAccessRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("formation_access_requests")
      .select(`
        *,
        formation:formations (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération demandes:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      formation: item.formation || null,
    }));
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer la progression d'une inscription
 */
export const getEnrollmentProgress = async (enrollmentId: string): Promise<FormationProgress[]> => {
  try {
    const { data, error } = await supabase
      .from("formation_progress")
      .select(`
        *,
        module:formation_modules (*)
      `)
      .eq("enrollment_id", enrollmentId)
      .order("module.order_index", { ascending: true });

    if (error) {
      console.error("Erreur récupération progression:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      module: item.module || null,
    }));
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Calculer le pourcentage de progression global
 */
export const calculateOverallProgress = (progress: FormationProgress[]): number => {
  if (progress.length === 0) return 0;
  
  const totalProgress = progress.reduce((sum, p) => sum + (p.progress_percent || 0), 0);
  return Math.round(totalProgress / progress.length);
};

/**
 * Formater le mois en français
 */
export const formatMonth = (month: number): string => {
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  return months[month - 1] || "";
};