/**
 * Hook pour la gestion des ministères
 */

import { useState, useEffect, useCallback } from "react";
import { ministereService } from "../services/ministere.service";
import {
  Ministere,
  Department,
  DepartmentMember,
  Zone,
} from "../types/database";

export const useMinisteres = () => {
  const [ministeres, setMinisteres] = useState<Ministere[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userDepartments, setUserDepartments] = useState<DepartmentMember[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const [ministeresResult, departmentsResult, userDeptResult, zonesResult] = await Promise.all([
      ministereService.getAllMinisteres(),
      ministereService.getAllDepartments(),
      ministereService.getUserDepartments(),
      ministereService.getAllZones(),
    ]);

    if (ministeresResult.error) {
      setError(ministeresResult.error);
    } else {
      setMinisteres(ministeresResult.data);
    }

    if (!departmentsResult.error) {
      setDepartments(departmentsResult.data);
    }

    if (!userDeptResult.error) {
      setUserDepartments(userDeptResult.data);
    }

    if (!zonesResult.error) {
      setZones(zonesResult.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Rejoindre un département
  const joinDepartment = async (departmentId: string): Promise<boolean> => {
    const { success, error } = await ministereService.joinDepartment(departmentId);

    if (error) {
      setError(error);
      return false;
    }

    await loadData();
    return success;
  };

  // Quitter un département
  const leaveDepartment = async (departmentId: string): Promise<boolean> => {
    const { success, error } = await ministereService.leaveDepartment(departmentId);

    if (error) {
      setError(error);
      return false;
    }

    await loadData();
    return success;
  };

  // Vérifier si membre d'un département
  const isMemberOfDepartment = (departmentId: string): boolean => {
    return userDepartments.some(
      (ud) => ud.department_id === departmentId && ud.status === "active"
    );
  };

  // Obtenir un ministère par slug
  const getMinistereBySlug = (slug: string): Ministere | undefined => {
    return ministeres.find((m) => m.slug === slug);
  };

  // Obtenir les départements d'un ministère
  const getDepartmentsByMinistere = (ministereId: string): Department[] => {
    return departments.filter((d) => d.ministere_id === ministereId);
  };

  // Compter les départements de l'utilisateur
  const getUserDepartmentsCount = (): number => {
    return userDepartments.filter((ud) => ud.status === "active").length;
  };

  return {
    ministeres,
    departments,
    userDepartments,
    zones,
    isLoading,
    error,
    loadData,
    joinDepartment,
    leaveDepartment,
    isMemberOfDepartment,
    getMinistereBySlug,
    getDepartmentsByMinistere,
    getUserDepartmentsCount,
    getIconName: ministereService.getIconName,
  };
};