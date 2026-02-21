/**
 * Service Donations - Centre Chrétien de Réveil
 * Gère toutes les opérations liées aux dons
 */

import { supabase } from "../lib/supabase";
import { Config } from "../constants/config";
import { Logger } from "../lib/logger";

// Types
export interface DonationType {
  id: string;
  church_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string | null;
  is_recurring: boolean | null;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DonationTypesByCategory {
  category: string;
  types: DonationType[];
}

export interface Donation {
  id: string;
  church_id: string | null;
  user_id: string | null;
  type_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  payment_status: string;
  is_anonymous: boolean;
  notes: string | null;
  donated_at: string;
  created_at: string;
  donation_types?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  } | null;
}

export interface CreateDonationData {
  type_id: string;
  amount: number;
  payment_method: string;
  is_anonymous?: boolean;
  notes?: string;
  phone_number?: string;
  payment_phone?: string;
  dedication?: string;
}

// Interface pour les données brutes de Supabase
interface DonationRawData {
  id: string;
  church_id: string | null;
  user_id: string | null;
  type_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference: string | null;
  payment_status: string;
  is_anonymous: boolean;
  notes: string | null;
  donated_at: string;
  created_at: string;
  donation_types: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  } | null;
}

/**
 * Récupérer tous les types de dons actifs
 */
export const getDonationTypes = async (): Promise<DonationType[]> => {
  try {
    const { data, error } = await supabase
      .from("donation_types")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      Logger.error("Erreur récupération types de dons", { error });
      return [];
    }

    return data || [];
  } catch (err) {
    Logger.error("Erreur getDonationTypes", { error: err });
    return [];
  }
};

/**
 * Récupérer les types de dons groupés par catégorie
 */
export const getDonationTypesByCategory = async (): Promise<DonationTypesByCategory[]> => {
  try {
    const types = await getDonationTypes();

    // Ordre des catégories
    const categoryOrder = [
      'Dons réguliers',
      'Projets',
      'Ministères',
      'Solidarité',
      'Soutien pastoral',
      'Autre'
    ];

    // Grouper par catégorie
    const grouped: Record<string, DonationType[]> = {};

    types.forEach((type) => {
      const category = type.category || 'Autre';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(type);
    });

    // Convertir en tableau ordonné
    const result: DonationTypesByCategory[] = [];

    categoryOrder.forEach((category) => {
      if (grouped[category] && grouped[category].length > 0) {
        result.push({
          category,
          types: grouped[category],
        });
      }
    });

    return result;
  } catch (err) {
    Logger.error("Erreur getDonationTypesByCategory", { error: err });
    return [];
  }
};

/**
 * Récupérer l'historique des dons de l'utilisateur
 */
export const getUserDonations = async (userId: string, limit: number = 50, offset: number = 0): Promise<Donation[]> => {
  try {
    const { data, error } = await supabase
      .from("donations")
      .select(`
        id,
        church_id,
        user_id,
        type_id,
        amount,
        currency,
        payment_method,
        payment_reference,
        payment_status,
        is_anonymous,
        notes,
        donated_at,
        created_at,
        donation_types (
          id,
          name,
          slug,
          icon,
          color
        )
      `)
      .eq("user_id", userId)
      .order("donated_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      Logger.error("Erreur récupération dons", { error, userId });
      return [];
    }

    // Transformer les données avec typage strict
    const donations: Donation[] = ((data || []) as unknown as DonationRawData[]).map((item) => ({
      id: item.id,
      church_id: item.church_id,
      user_id: item.user_id,
      type_id: item.type_id,
      amount: item.amount,
      currency: item.currency,
      payment_method: item.payment_method,
      payment_reference: item.payment_reference,
      payment_status: item.payment_status,
      is_anonymous: item.is_anonymous,
      notes: item.notes,
      donated_at: item.donated_at,
      created_at: item.created_at,
      donation_types: item.donation_types || null,
    }));

    return donations;
  } catch (err) {
    Logger.error("Erreur getUserDonations", { error: err });
    return [];
  }
};

/**
 * Créer un nouveau don
 */
export const createDonation = async (
  userId: string,
  donationData: CreateDonationData
): Promise<{ success: boolean; donation?: Donation; error?: string }> => {
  try {
    // Générer une référence de paiement unique
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    const paymentReference = `DON-${timestamp}-${random}`;

    // Support both phone_number and payment_phone (consolidated from finance.service.ts)
    const phoneNumber = donationData.phone_number || donationData.payment_phone;

    // Construire les notes (SANS le téléphone si anonyme pour protéger l'identité)
    let notes = donationData.notes || "";
    if (phoneNumber && !donationData.is_anonymous) {
      notes = `Tel: ${phoneNumber}${notes ? " | " + notes : ""}`;
    }

    // Préparer les données du don avec church_id depuis la config
    const insertData: Record<string, unknown> = {
      church_id: Config.church.defaultId,
      type_id: donationData.type_id,
      amount: donationData.amount,
      currency: Config.payments.currency,
      payment_method: donationData.payment_method,
      payment_reference: paymentReference,
      payment_status: "pending",
      is_anonymous: donationData.is_anonymous || false,
      notes: notes || null,
      dedication: donationData.dedication || null,
      donated_at: new Date().toISOString(),
    };

    // Ajouter user_id seulement si le don n'est pas anonyme
    if (!donationData.is_anonymous) {
      insertData.user_id = userId;
    }

    const { data, error } = await supabase
      .from("donations")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      Logger.error("Erreur création don", { error, userId });
      return {
        success: false,
        error: error.message || "Erreur lors de la création du don"
      };
    }

    Logger.info("Don créé avec succès", { donationId: data.id, userId });
    return { success: true, donation: data as Donation };
  } catch (err) {
    Logger.error("Erreur createDonation", { error: err });
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Mettre à jour le statut d'un don
 */
export const updateDonationStatus = async (
  donationId: string,
  status: "completed" | "failed" | "refunded"
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("donations")
      .update({ payment_status: status })
      .eq("id", donationId);

    if (error) {
      Logger.error("Erreur mise à jour don", { error, donationId });
      return { success: false, error: "Erreur lors de la mise à jour" };
    }

    Logger.info("Statut du don mis à jour", { donationId, status });
    return { success: true };
  } catch (err) {
    Logger.error("Erreur updateDonationStatus", { error: err });
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Obtenir les statistiques de dons de l'utilisateur
 */
export const getUserDonationStats = async (
  userId: string
): Promise<{
  totalAmount: number;
  donationCount: number;
  thisMonthAmount: number;
  thisYearAmount: number;
}> => {
  try {
    const { data: allDonations, error: allError } = await supabase
      .from("donations")
      .select("amount, donated_at, payment_status")
      .eq("user_id", userId)
      .eq("payment_status", "completed");

    if (allError) {
      Logger.error("Erreur stats dons", { error: allError, userId });
      return { totalAmount: 0, donationCount: 0, thisMonthAmount: 0, thisYearAmount: 0 };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let totalAmount = 0;
    let thisMonthAmount = 0;
    let thisYearAmount = 0;
    let donationCount = 0;

    allDonations?.forEach((donation) => {
      const amount = Number(donation.amount) || 0;
      const donatedAt = new Date(donation.donated_at);

      totalAmount += amount;
      donationCount += 1;

      if (donatedAt >= startOfMonth) {
        thisMonthAmount += amount;
      }

      if (donatedAt >= startOfYear) {
        thisYearAmount += amount;
      }
    });

    return {
      totalAmount,
      donationCount,
      thisMonthAmount,
      thisYearAmount,
    };
  } catch (err) {
    Logger.error("Erreur getUserDonationStats", { error: err });
    return { totalAmount: 0, donationCount: 0, thisMonthAmount: 0, thisYearAmount: 0 };
  }
};

/**
 * Récupérer un don par ID
 */
export const getDonationById = async (donationId: string): Promise<Donation | null> => {
  try {
    const { data, error } = await supabase
      .from("donations")
      .select(`
        *,
        donation_types (
          id,
          name,
          slug,
          icon,
          color
        )
      `)
      .eq("id", donationId)
      .single();

    if (error) {
      Logger.error("Erreur récupération don", { error, donationId });
      return null;
    }

    return data as Donation;
  } catch (err) {
    Logger.error("Erreur getDonationById", { error: err });
    return null;
  }
};

// ============================================================
// Utility functions (consolidated from finance.service.ts)
// ============================================================

/**
 * Simuler le paiement Mobile Money
 * (Dans la vraie app, ceci appellerait les APIs MTN/Orange)
 */
export const processPayment = async (
  donationId: string,
  _paymentMethod: string,
  _phoneNumber: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Simulation d'un délai de traitement
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simuler un succès (90% de chance)
    const isSuccess = Math.random() > 0.1;

    if (!isSuccess) {
      // Mettre à jour le statut à "failed"
      await supabase
        .from("donations")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", donationId);

      return { success: false, error: "Le paiement a échoué. Veuillez réessayer." };
    }

    // Simuler un ID de transaction
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Mettre à jour le don avec le statut "completed"
    await supabase
      .from("donations")
      .update({
        payment_status: "completed",
        payment_provider_id: transactionId,
        payment_reference: transactionId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", donationId);

    return { success: true, error: null };
  } catch (error) {
    Logger.error("Erreur processPayment", { error, donationId });
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
};

/**
 * Formater un montant en XOF
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA";
};

/**
 * Obtenir le libellé du mode de paiement
 */
export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    mtn_momo: "MTN Mobile Money",
    orange_money: "Orange Money",
    wave: "Wave",
    cash: "Espèces",
    bank: "Virement bancaire",
  };
  return labels[method] || method;
};

/**
 * Obtenir le statut en français
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "En attente",
    processing: "En cours",
    completed: "Complété",
    failed: "Échoué",
    refunded: "Remboursé",
    cancelled: "Annulé",
  };
  return labels[status] || status;
};

/**
 * Obtenir la couleur du statut
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    completed: "#22c55e",
    failed: "#ef4444",
    refunded: "#8b5cf6",
    cancelled: "#6b7280",
  };
  return colors[status] || "#6b7280";
};
