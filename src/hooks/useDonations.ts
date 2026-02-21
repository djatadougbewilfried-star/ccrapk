/**
 * Hook useDonations - Centre Chrétien de Réveil
 * Gère les données des dons
 */

import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "../stores/userStore";
import {
  getDonationTypes,
  getDonationTypesByCategory,
  getUserDonations,
  getUserDonationStats,
  createDonation,
  DonationType,
  DonationTypesByCategory,
  Donation,
  CreateDonationData,
} from "../services/donations.service";

export const useDonations = () => {
  const { user } = useUserStore();
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [donationTypesByCategory, setDonationTypesByCategory] = useState<DonationTypesByCategory[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    donationCount: 0,
    thisMonthAmount: 0,
    thisYearAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Charger les types de dons (liste simple et par catégorie)
      const [types, typesByCategory] = await Promise.all([
        getDonationTypes(),
        getDonationTypesByCategory(),
      ]);
      
      setDonationTypes(types);
      setDonationTypesByCategory(typesByCategory);

      // Charger l'historique et les stats si l'utilisateur est connecté
      if (user?.id) {
        const [userDonations, userStats] = await Promise.all([
          getUserDonations(user.id),
          getUserDonationStats(user.id),
        ]);
        setDonations(userDonations);
        setStats(userStats);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors du chargement";
      console.error("Erreur chargement dons:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Charger au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Faire un don
  const makeDonation = async (
    donationData: CreateDonationData
  ): Promise<{ success: boolean; donation?: Donation; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: "Vous devez être connecté" };
    }

    const result = await createDonation(user.id, donationData);

    if (result.success && result.donation) {
      // Rafraîchir les données
      await loadData();
    }

    return result;
  };

  // Formater le montant en FCFA
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR").format(amount) + " F";
  };

  // Obtenir un type de don par ID
  const getDonationTypeById = (typeId: string): DonationType | undefined => {
    return donationTypes.find((t) => t.id === typeId);
  };

  return {
    donationTypes,
    donationTypesByCategory,
    donations,
    stats,
    isLoading,
    error,
    makeDonation,
    formatAmount,
    getDonationTypeById,
    refresh: loadData,
  };
};