/**
 * Service Départements - Centre Chrétien de Réveil
 * Gère toutes les opérations liées aux départements
 */

import { supabase } from "../lib/supabase";

// Types
export interface Department {
  id: string;
  church_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  ministere_name: string | null;
  responsible_id: string | null;
  requires_academie: boolean | null;
  requirements: string | null;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
  member_count?: number;
  responsible?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
  } | null;
}

export interface DepartmentsByMinistere {
  ministere: string;
  departments: Department[];
}

export interface DepartmentMember {
  id: string;
  department_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    photo_url: string | null;
    phone: string | null;
  };
}

export interface DepartmentRequest {
  id: string;
  department_id: string;
  user_id: string;
  motivation: string;
  availability: {
    days: string[];
    slots: string[];
  };
  accepted_rules: boolean;
  accepted_data_processing: boolean;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  department?: Department;
}

export interface CreateDepartmentRequestData {
  department_id: string;
  motivation: string;
  availability: {
    days: string[];
    slots: string[];
  };
  accepted_rules: boolean;
  accepted_data_processing: boolean;
}

/**
 * Récupérer tous les départements actifs
 */
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select(`
        *,
        responsible:profiles!departments_responsible_id_fkey (
          id,
          first_name,
          last_name,
          photo_url
        )
      `)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Erreur récupération départements:", error);
      // Fallback sans la jointure
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (fallbackError) {
        return [];
      }
      return fallbackData || [];
    }

    return data || [];
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer les départements groupés par ministère
 */
export const getDepartmentsByMinistere = async (): Promise<DepartmentsByMinistere[]> => {
  try {
    const departments = await getDepartments();

    // Ordre des ministères
    const ministereOrder = ["Direction des Cultes", "Louange"];

    // Grouper par ministère
    const grouped: Record<string, Department[]> = {};

    departments.forEach((dept) => {
      const ministere = dept.ministere_name || "Autre";
      if (!grouped[ministere]) {
        grouped[ministere] = [];
      }
      grouped[ministere].push(dept);
    });

    // Convertir en tableau ordonné
    const result: DepartmentsByMinistere[] = [];

    ministereOrder.forEach((ministere) => {
      if (grouped[ministere] && grouped[ministere].length > 0) {
        result.push({
          ministere,
          departments: grouped[ministere],
        });
      }
    });

    // Ajouter les ministères non listés
    Object.keys(grouped).forEach((ministere) => {
      if (!ministereOrder.includes(ministere)) {
        result.push({
          ministere,
          departments: grouped[ministere],
        });
      }
    });

    return result;
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer un département par ID
 */
export const getDepartmentById = async (departmentId: string): Promise<Department | null> => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", departmentId)
      .single();

    if (error) {
      console.error("Erreur récupération département:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Erreur:", err);
    return null;
  }
};

/**
 * Récupérer le nombre de membres par département
 */
export const getDepartmentMemberCount = async (departmentId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from("department_members")
      .select("*", { count: "exact", head: true })
      .eq("department_id", departmentId)
      .eq("status", "active");

    if (error) {
      console.error("Erreur comptage membres:", error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error("Erreur:", err);
    return 0;
  }
};

/**
 * Récupérer les membres d'un département
 */
export const getDepartmentMembers = async (departmentId: string): Promise<DepartmentMember[]> => {
  try {
    const { data, error } = await supabase
      .from("department_members")
      .select(`
        *,
        profile:profiles (
          id,
          first_name,
          last_name,
          photo_url,
          phone
        )
      `)
      .eq("department_id", departmentId)
      .eq("status", "active")
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("Erreur récupération membres:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      profile: item.profile || null,
    }));
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Vérifier si un utilisateur est membre d'un département
 */
export const isUserMemberOfDepartment = async (
  departmentId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("department_members")
      .select("id")
      .eq("department_id", departmentId)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      return false;
    }

    return !!data;
  } catch (err) {
    return false;
  }
};

/**
 * Récupérer les départements d'un utilisateur
 */
export const getUserDepartments = async (userId: string): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from("department_members")
      .select(`
        department_id,
        status,
        role,
        departments (*)
      `)
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) {
      console.error("Erreur récupération départements utilisateur:", error);
      return [];
    }

    return (data || [])
      .filter((item: any) => item.departments)
      .map((item: any) => item.departments);
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Récupérer les demandes d'adhésion d'un utilisateur
 */
export const getUserDepartmentRequests = async (userId: string): Promise<DepartmentRequest[]> => {
  try {
    const { data, error } = await supabase
      .from("department_requests")
      .select(`
        *,
        department:departments (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur récupération demandes:", error);
      return [];
    }

    return (data || []).map((item: any) => ({
      ...item,
      department: item.department || null,
    }));
  } catch (err) {
    console.error("Erreur:", err);
    return [];
  }
};

/**
 * Vérifier si une demande existe déjà
 */
export const hasExistingRequest = async (
  departmentId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("department_requests")
      .select("id, status")
      .eq("department_id", departmentId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    // Une demande existe si elle est en attente
    return data.status === "pending";
  } catch (err) {
    return false;
  }
};

/**
 * Créer une demande d'adhésion à un département
 */
export const createDepartmentRequest = async (
  userId: string,
  requestData: CreateDepartmentRequestData
): Promise<{ success: boolean; request?: DepartmentRequest; error?: string }> => {
  try {
    // Vérifier si déjà membre
    const isMember = await isUserMemberOfDepartment(requestData.department_id, userId);
    if (isMember) {
      return { success: false, error: "Vous êtes déjà membre de ce département" };
    }

    // Vérifier si une demande existe déjà
    const hasRequest = await hasExistingRequest(requestData.department_id, userId);
    if (hasRequest) {
      return { success: false, error: "Vous avez déjà une demande en attente pour ce département" };
    }

    // Vérifier le nombre de départements (max 5)
    const userDepartments = await getUserDepartments(userId);
    const userRequests = await getUserDepartmentRequests(userId);
    const pendingRequests = userRequests.filter((r) => r.status === "pending");
    
    if (userDepartments.length + pendingRequests.length >= 5) {
      return { success: false, error: "Vous ne pouvez pas appartenir à plus de 5 départements" };
    }

    // Créer la demande
    const { data, error } = await supabase
      .from("department_requests")
      .insert({
        department_id: requestData.department_id,
        user_id: userId,
        motivation: requestData.motivation,
        availability: requestData.availability,
        accepted_rules: requestData.accepted_rules,
        accepted_data_processing: requestData.accepted_data_processing,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Erreur création demande:", error);
      return { success: false, error: "Erreur lors de la création de la demande" };
    }

    return { success: true, request: data };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Créer plusieurs demandes d'adhésion (pour l'inscription)
 */
export const createMultipleDepartmentRequests = async (
  userId: string,
  requests: CreateDepartmentRequestData[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Limiter à 5 départements
    const limitedRequests = requests.slice(0, 5);

    for (const request of limitedRequests) {
      const result = await createDepartmentRequest(userId, request);
      if (!result.success) {
        console.warn(`Erreur pour département ${request.department_id}:`, result.error);
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};

/**
 * Annuler une demande d'adhésion
 */
export const cancelDepartmentRequest = async (
  requestId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("department_requests")
      .delete()
      .eq("id", requestId)
      .eq("user_id", userId)
      .eq("status", "pending");

    if (error) {
      console.error("Erreur annulation demande:", error);
      return { success: false, error: "Erreur lors de l'annulation" };
    }

    return { success: true };
  } catch (err) {
    console.error("Erreur:", err);
    return { success: false, error: "Une erreur est survenue" };
  }
};