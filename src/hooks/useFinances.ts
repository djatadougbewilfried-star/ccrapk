/**
 * Hook pour la gestion des finances
 * Utilise donations.service.ts comme source consolidée
 */

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "../stores/userStore";
import {
  getDonationTypes as fetchDonationTypes,
  getUserDonations as fetchUserDonations,
  getUserDonationStats as fetchUserDonationStats,
  createDonation as createDonationService,
  processPayment as processPaymentService,
  formatAmount,
  getPaymentMethodLabel,
  getStatusLabel,
  getStatusColor,
  DonationType,
  Donation,
  CreateDonationData,
} from "../services/donations.service";

export const useFinances = () => {
  const { user } = useUserStore();
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState<{
    totalAmount: number;
    donationCount: number;
    thisMonthAmount: number;
    thisYearAmount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les données
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const types = await fetchDonationTypes();
      setDonationTypes(types);

      if (user?.id) {
        const [userDonations, userStats] = await Promise.all([
          fetchUserDonations(user.id),
          fetchUserDonationStats(user.id),
        ]);
        setDonations(userDonations);
        setStats(userStats);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      setError(errorMessage);
    }

    setIsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Créer un don
  const createDonation = async (
    donationData: CreateDonationData
  ): Promise<{ donation: Donation | null; error: string | null }> => {
    if (!user?.id) {
      return { donation: null, error: "Utilisateur non connecté" };
    }

    const result = await createDonationService(user.id, donationData);

    if (!result.success || !result.donation) {
      const errMsg = result.error || "Erreur lors de la création du don";
      setError(errMsg);
      return { donation: null, error: errMsg };
    }

    return { donation: result.donation, error: null };
  };

  // Traiter le paiement
  const processPayment = async (
    donationId: string,
    paymentMethod: string,
    phoneNumber: string
  ): Promise<boolean> => {
    const { success, error: paymentError } = await processPaymentService(
      donationId,
      paymentMethod,
      phoneNumber
    );

    if (paymentError) {
      setError(paymentError);
      return false;
    }

    // Recharger les données après paiement
    await loadData();
    return success;
  };

  // Obtenir un type de don par ID
  const getDonationTypeById = (typeId: string): DonationType | undefined => {
    return donationTypes.find((t) => t.id === typeId);
  };

  // Obtenir les dons récents (derniers 5)
  const getRecentDonations = (): Donation[] => {
    return donations.slice(0, 5);
  };

  // Obtenir les dons complétés
  const getCompletedDonations = (): Donation[] => {
    return donations.filter((d) => d.payment_status === "completed");
  };

  return {
    donationTypes,
    donations,
    stats,
    isLoading,
    error,
    loadData,
    createDonation,
    processPayment,
    getDonationTypeById,
    getRecentDonations,
    getCompletedDonations,
    formatAmount,
    getPaymentMethodLabel,
    getStatusLabel,
    getStatusColor,
  };
};
