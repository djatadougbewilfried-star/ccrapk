/**
 * Hook pour l'administration
 */

import { useState, useEffect, useCallback } from "react";
import { adminService } from "../services/admin.service";
import {
  ChurchStats,
  MemberListItem,
  ValidationRequest,
  ActivityLog,
  ChurchSettings,
} from "../types/database";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<ChurchStats | null>(null);
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [membersCount, setMembersCount] = useState(0);
  const [pendingValidations, setPendingValidations] = useState<ValidationRequest[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si admin et charger les données
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Vérifier le statut admin
    const adminStatus = await adminService.isUserAdmin();
    setIsAdmin(adminStatus);

    if (!adminStatus) {
      setIsLoading(false);
      return;
    }

    // Charger les données admin
    const [statsResult, membersResult, validationsResult, activityResult, settingsResult] =
      await Promise.all([
        adminService.getChurchStats(),
        adminService.getMembers({ limit: 10 }),
        adminService.getPendingValidations(),
        adminService.getRecentActivity(10),
        adminService.getChurchSettings(),
      ]);

    if (statsResult.error) {
      setError(statsResult.error);
    } else {
      setStats(statsResult.data);
    }

    if (!membersResult.error) {
      setMembers(membersResult.data);
      setMembersCount(membersResult.count);
    }

    if (!validationsResult.error) {
      setPendingValidations(validationsResult.data);
    }

    if (!activityResult.error) {
      setRecentActivity(activityResult.data);
    }

    if (!settingsResult.error) {
      setSettings(settingsResult.data);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Charger plus de membres
  const loadMembers = async (options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const result = await adminService.getMembers(options);

    if (!result.error) {
      setMembers(result.data);
      setMembersCount(result.count);
    }

    return result;
  };

  // Mettre à jour le statut d'un membre
  const updateMemberStatus = async (
    memberId: string,
    status: "Active" | "Pending" | "Suspended"
  ): Promise<boolean> => {
    const { success, error } = await adminService.updateMemberStatus(memberId, status);

    if (error) {
      setError(error);
      return false;
    }

    // Recharger les membres
    await loadMembers();
    return success;
  };

  // Mettre à jour le rôle d'un membre
  const updateMemberRole = async (memberId: string, role: string): Promise<boolean> => {
    const { success, error } = await adminService.updateMemberRole(memberId, role);

    if (error) {
      setError(error);
      return false;
    }

    await loadMembers();
    return success;
  };

  // Traiter une validation
  const processValidation = async (
    requestId: string,
    approved: boolean,
    notes?: string
  ): Promise<boolean> => {
    const { success, error } = await adminService.processValidation(requestId, approved, notes);

    if (error) {
      setError(error);
      return false;
    }

    // Recharger les validations
    const result = await adminService.getPendingValidations();
    if (!result.error) {
      setPendingValidations(result.data);
    }

    return success;
  };

  // Mettre à jour les paramètres
  const updateSettings = async (newSettings: Partial<ChurchSettings>): Promise<boolean> => {
    const { success, error } = await adminService.updateChurchSettings(newSettings);

    if (error) {
      setError(error);
      return false;
    }

    // Recharger les paramètres
    const result = await adminService.getChurchSettings();
    if (!result.error) {
      setSettings(result.data);
    }

    return success;
  };

  return {
    isAdmin,
    stats,
    members,
    membersCount,
    pendingValidations,
    recentActivity,
    settings,
    isLoading,
    error,
    loadData,
    loadMembers,
    updateMemberStatus,
    updateMemberRole,
    processValidation,
    updateSettings,
    formatNumber: adminService.formatNumber,
    formatAmount: adminService.formatAmount,
  };
};