/**
 * Hook useDepartments - Centre Chrétien de Réveil
 * Gère les données des départements
 */

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "../stores/userStore";
import {
  getDepartments,
  getDepartmentsByMinistere,
  getDepartmentById,
  getUserDepartments,
  getUserDepartmentRequests,
  isUserMemberOfDepartment,
  createDepartmentRequest,
  cancelDepartmentRequest,
  Department,
  DepartmentsByMinistere,
  DepartmentRequest,
  CreateDepartmentRequestData,
} from "../services/departments.service";

export const useDepartments = () => {
  const { user } = useUserStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsByMinistere, setDepartmentsByMinistere] = useState<DepartmentsByMinistere[]>([]);
  const [userDepartments, setUserDepartments] = useState<Department[]>([]);
  const [userRequests, setUserRequests] = useState<DepartmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger tous les départements
      const [allDepartments, groupedDepartments] = await Promise.all([
        getDepartments(),
        getDepartmentsByMinistere(),
      ]);

      setDepartments(allDepartments);
      setDepartmentsByMinistere(groupedDepartments);

      // Charger les départements de l'utilisateur
      if (user?.id) {
        const [userDepts, requests] = await Promise.all([
          getUserDepartments(user.id),
          getUserDepartmentRequests(user.id),
        ]);
        setUserDepartments(userDepts);
        setUserRequests(requests);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      console.error("Erreur chargement départements:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Charger au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Vérifier si l'utilisateur est membre d'un département
  const isMember = (departmentId: string): boolean => {
    return userDepartments.some((d) => d.id === departmentId);
  };

  // Vérifier si l'utilisateur a une demande en attente
  const hasPendingRequest = (departmentId: string): boolean => {
    return userRequests.some(
      (r) => r.department_id === departmentId && r.status === "pending"
    );
  };

  // Obtenir le statut d'un département pour l'utilisateur
  const getDepartmentStatus = (
    departmentId: string
  ): "member" | "pending" | "rejected" | "none" => {
    if (isMember(departmentId)) return "member";

    const request = userRequests.find((r) => r.department_id === departmentId);
    if (request) {
      if (request.status === "pending") return "pending";
      if (request.status === "rejected") return "rejected";
    }

    return "none";
  };

  // Faire une demande d'adhésion
  const requestToJoin = async (
    requestData: CreateDepartmentRequestData
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "Vous devez être connecté" };
    }

    const result = await createDepartmentRequest(user.id, requestData);

    if (result.success) {
      await loadData(); // Rafraîchir les données
    }

    return result;
  };

  // Annuler une demande
  const cancelRequest = async (
    requestId: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "Vous devez être connecté" };
    }

    const result = await cancelDepartmentRequest(requestId, user.id);

    if (result.success) {
      await loadData();
    }

    return result;
  };

  // Obtenir un département par ID
  const getDepartment = (departmentId: string): Department | undefined => {
    return departments.find((d) => d.id === departmentId);
  };

  // Nombre de départements restants
  const remainingSlots = 5 - userDepartments.length - userRequests.filter((r) => r.status === "pending").length;

  return {
    departments,
    departmentsByMinistere,
    userDepartments,
    userRequests,
    isLoading,
    error,
    isMember,
    hasPendingRequest,
    getDepartmentStatus,
    getDepartment,
    requestToJoin,
    cancelRequest,
    remainingSlots,
    refresh: loadData,
  };
};