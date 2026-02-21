/**
 * Hook useFormations - Centre Chrétien de Réveil
 * Gère les données des formations
 */

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "../stores/userStore";
import {
  getFormations,
  getFormationById,
  getFormationSessions,
  getFormationModules,
  getUserEnrollments,
  getUserAccessRequests,
  isUserEnrolledInFormation,
  canEnrollInFormation,
  createEnrollment,
  createAccessRequest,
  getEnrollmentProgress,
  calculateOverallProgress,
  Formation,
  FormationSession,
  FormationModule,
  FormationEnrollment,
  FormationAccessRequest,
  CreateEnrollmentData,
  CreateAccessRequestData,
} from "../services/formations.service";

export const useFormations = () => {
  const { user } = useUserStore();
  const [formations, setFormations] = useState<Formation[]>([]);
  const [userEnrollments, setUserEnrollments] = useState<FormationEnrollment[]>([]);
  const [userAccessRequests, setUserAccessRequests] = useState<FormationAccessRequest[]>([]);
  const [enrollmentProgress, setEnrollmentProgress] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger toutes les formations
      const allFormations = await getFormations();
      setFormations(allFormations);

      // Charger les inscriptions et demandes de l'utilisateur
      if (user?.id) {
        const [enrollments, accessRequests] = await Promise.all([
          getUserEnrollments(user.id),
          getUserAccessRequests(user.id),
        ]);
        setUserEnrollments(enrollments);
        setUserAccessRequests(accessRequests);

        // Charger la progression pour chaque inscription active
        const progressMap: Record<string, number> = {};
        const activeEnrolls = enrollments.filter(
          (e) => ["pending", "approved", "in_progress"].includes(e.status)
        );

        await Promise.all(
          activeEnrolls.map(async (enrollment) => {
            const progress = await getEnrollmentProgress(enrollment.id);
            progressMap[enrollment.id] = calculateOverallProgress(progress);
          })
        );
        setEnrollmentProgress(progressMap);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      console.error("Erreur chargement formations:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Charger au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Obtenir le statut d'une formation pour l'utilisateur
  const getFormationStatus = (
    formationId: string
  ): "none" | "pending" | "approved" | "in_progress" | "completed" | "access_pending" | "access_rejected" => {
    // Vérifier les inscriptions
    const enrollment = userEnrollments.find(
      (e) => e.formation?.id === formationId || e.session?.formation_id === formationId
    );
    
    if (enrollment) {
      if (enrollment.status === "completed") return "completed";
      if (enrollment.status === "in_progress") return "in_progress";
      if (enrollment.status === "approved") return "approved";
      if (enrollment.status === "pending") return "pending";
    }

    // Vérifier les demandes d'accès (École de Mission)
    const accessRequest = userAccessRequests.find((r) => r.formation_id === formationId);
    if (accessRequest) {
      if (accessRequest.status === "pending") return "access_pending";
      if (accessRequest.status === "rejected") return "access_rejected";
    }

    return "none";
  };

  // Vérifier si l'utilisateur peut s'inscrire
  const checkCanEnroll = async (formation: Formation) => {
    if (!user?.id) {
      return { canEnroll: false, reason: "Vous devez être connecté" };
    }
    return canEnrollInFormation(user.id, formation);
  };

  // S'inscrire à une formation
  const enroll = async (
    data: CreateEnrollmentData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "Vous devez être connecté" };
    }

    const result = await createEnrollment(user.id, data);

    if (result.success) {
      await loadData();
    }

    return result;
  };

  // Demander l'accès à l'École de Mission
  const requestAccess = async (
    data: CreateAccessRequestData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "Vous devez être connecté" };
    }

    const result = await createAccessRequest(user.id, data);

    if (result.success) {
      await loadData();
    }

    return result;
  };

  // Obtenir une formation par ID
  const getFormation = (formationId: string): Formation | undefined => {
    return formations.find((f) => f.id === formationId);
  };

  // Obtenir les inscriptions actives
  const activeEnrollments = userEnrollments.filter(
    (e) => ["pending", "approved", "in_progress"].includes(e.status)
  );

  // Obtenir les formations complétées
  const completedEnrollments = userEnrollments.filter((e) => e.status === "completed");

  // Obtenir le pourcentage de progression pour une inscription
  const getEnrollmentProgressPercent = (enrollmentId: string): number => {
    return enrollmentProgress[enrollmentId] || 0;
  };

  return {
    formations,
    userEnrollments,
    userAccessRequests,
    activeEnrollments,
    completedEnrollments,
    enrollmentProgress,
    isLoading,
    error,
    getFormationStatus,
    getEnrollmentProgressPercent,
    checkCanEnroll,
    enroll,
    requestAccess,
    getFormation,
    refresh: loadData,
  };
};

/**
 * Hook pour une formation spécifique
 */
export const useFormationDetail = (formationId: string) => {
  const [formation, setFormation] = useState<Formation | null>(null);
  const [sessions, setSessions] = useState<FormationSession[]>([]);
  const [modules, setModules] = useState<FormationModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!formationId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [formationData, sessionsData, modulesData] = await Promise.all([
        getFormationById(formationId),
        getFormationSessions(formationId),
        getFormationModules(formationId),
      ]);

      setFormation(formationData);
      setSessions(sessionsData);
      setModules(modulesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      console.error("Erreur chargement formation:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sessions à venir
  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");

  return {
    formation,
    sessions,
    modules,
    upcomingSessions,
    isLoading,
    error,
    refresh: loadData,
  };
};