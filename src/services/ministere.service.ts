/**
 * Service pour la gestion des ministères
 */

import { supabase } from "../lib/supabase";
import {
  Ministere,
  Department,
  DepartmentMember,
  Zone,
  FamilleReveil,
} from "../types/database";

export const ministereService = {
  /**
   * Récupérer tous les ministères
   */
  async getAllMinisteres(): Promise<{ data: Ministere[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("ministeres")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as Ministere[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer un ministère par slug
   */
  async getMinistereBySlug(slug: string): Promise<{ data: Ministere | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("ministeres")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as Ministere, error: null };
    } catch (error) {
      return { data: null, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer tous les départements
   */
  async getAllDepartments(): Promise<{ data: Department[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as Department[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer les départements d'un ministère
   */
  async getDepartmentsByMinistere(ministereId: string): Promise<{ data: Department[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("ministere_id", ministereId)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as Department[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer les membres d'un département
   */
  async getDepartmentMembers(departmentId: string): Promise<{ data: DepartmentMember[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("department_members")
        .select(`
          *,
          profile:profiles(id, first_name, last_name, photo_url)
        `)
        .eq("department_id", departmentId)
        .eq("status", "active")
        .order("role", { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as DepartmentMember[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer les départements de l'utilisateur
   */
  async getUserDepartments(): Promise<{ data: DepartmentMember[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { data: [], error: "Utilisateur non connecté" };
      }

      const { data, error } = await supabase
        .from("department_members")
        .select(`
          *,
          department:departments(*)
        `)
        .eq("user_id", user.id)
        .eq("status", "active");

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as DepartmentMember[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Rejoindre un département
   */
  async joinDepartment(departmentId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      // Vérifier si déjà membre
      const { data: existing } = await supabase
        .from("department_members")
        .select("id")
        .eq("department_id", departmentId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        return { success: false, error: "Vous êtes déjà membre de ce département" };
      }

      // Vérifier le nombre de départements (max 5)
      const { count } = await supabase
        .from("department_members")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active");

      if (count && count >= 5) {
        return { success: false, error: "Vous ne pouvez pas rejoindre plus de 5 départements" };
      }

      // Créer une demande d'adhésion (statut "pending") au lieu d'une insertion directe
      // L'approbation sera faite par le responsable du département
      const { error } = await supabase
        .from("department_members")
        .insert({
          department_id: departmentId,
          user_id: user.id,
          role: "serviteur",
          status: "pending",
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Quitter un département
   */
  async leaveDepartment(departmentId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: "Utilisateur non connecté" };
      }

      const { error } = await supabase
        .from("department_members")
        .update({ status: "inactive" })
        .eq("department_id", departmentId)
        .eq("user_id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer toutes les zones
   */
  async getAllZones(): Promise<{ data: Zone[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as Zone[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer les familles d'une zone
   */
  async getFamillesByZone(zoneId: string): Promise<{ data: FamilleReveil[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("familles_reveil")
        .select(`
          *,
          zone:zones(id, name, color)
        `)
        .eq("zone_id", zoneId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as FamilleReveil[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Vérifier si l'utilisateur est membre d'un département
   */
  async isMemberOf(departmentId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return false;

      const { data } = await supabase
        .from("department_members")
        .select("id")
        .eq("department_id", departmentId)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      return !!data;
    } catch {
      return false;
    }
  },

  /**
   * Obtenir l'icône Ionicons
   */
  getIconName(icon: string): string {
    const iconMap: Record<string, string> = {
      "trending-up": "trending-up",
      "megaphone": "megaphone",
      "school": "school",
      "people": "people",
      "heart": "heart",
      "home": "home",
      "globe": "globe",
      "videocam": "videocam",
      "settings": "settings",
      "book": "book",
      "briefcase": "briefcase",
      "musical-notes": "musical-notes",
      "shield": "shield",
      "calendar": "calendar",
      "star": "star",
      "call": "call",
      "happy": "happy",
      "person": "person",
      "flame": "flame",
      "sparkles": "sparkles",
      "wine": "wine",
      "color-palette": "color-palette",
      "cart": "cart",
      "body": "body",
      "business": "business",
      "calculator": "calculator",
      "stats-chart": "stats-chart",
      "flower": "flower",
      "volume-high": "volume-high",
      "bulb": "bulb",
    };
    return iconMap[icon] || "ellipse";
  },
};