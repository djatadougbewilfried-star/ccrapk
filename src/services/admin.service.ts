/**
 * Service pour l'administration
 */

import { supabase } from "../lib/supabase";
import {
  ChurchStats,
  Profile,
  ValidationRequest,
  ActivityLog,
  ChurchSettings,
  MemberListItem,
} from "../types/database";
import { ROLES, getRoleById } from "../constants/roles";
import { Config } from "../constants/config";

const DEFAULT_CHURCH_ID = Config.church.defaultId;

export const adminService = {
  /**
   * Vérifier si l'utilisateur est admin
   * Seuls les niveaux pastoraux élevés (Principal, Consacré, Résidant) ont un accès admin complet
   * Pasteur Assistant et Assistant Pasteur ont un accès lecture seule
   */
  async isUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return false;

      const { data } = await supabase
        .from("profiles")
        .select("is_admin, role")
        .eq("id", user.id)
        .single();

      if (!data) return false;

      // Admin explicite
      if (data.is_admin === true) return true;

      // Rôles pastoraux avec accès admin
      const adminRoles = [
        "Pasteur Principal",
        "Pasteur Consacré",
        "Pasteur Résidant",
      ];

      return adminRoles.includes(data.role);
    } catch {
      return false;
    }
  },

  /**
   * Vérifier le niveau d'accès admin de l'utilisateur
   * Retourne 'full', 'readonly' ou 'none'
   */
  async getAdminLevel(): Promise<"full" | "readonly" | "none"> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "none";

      const { data } = await supabase
        .from("profiles")
        .select("is_admin, role")
        .eq("id", user.id)
        .single();

      if (!data) return "none";

      if (data.is_admin === true) return "full";

      const fullAccessRoles = ["Pasteur Principal", "Pasteur Consacré", "Pasteur Résidant"];
      if (fullAccessRoles.includes(data.role)) return "full";

      const readonlyRoles = ["Pasteur Assistant", "Assistant Pasteur"];
      if (readonlyRoles.includes(data.role)) return "readonly";

      return "none";
    } catch {
      return "none";
    }
  },

  /**
   * Récupérer les statistiques de l'église
   */
  async getChurchStats(): Promise<{ data: ChurchStats | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .rpc("get_church_stats", { p_church_id: DEFAULT_CHURCH_ID });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as ChurchStats, error: null };
    } catch (error) {
      return { data: null, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer la liste des membres
   */
  async getMembers(options?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: MemberListItem[]; count: number; error: string | null }> {
    try {
      let query = supabase
        .from("profiles")
        .select(`
          *,
          tribu_member:tribu_members(
            tribu:tribus(name)
          )
        `, { count: "exact" })
        .eq("church_id", DEFAULT_CHURCH_ID)
        .order("created_at", { ascending: false });

      if (options?.status) {
        query = query.eq("status", options.status);
      }

      if (options?.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,phone.ilike.%${options.search}%`);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, count, error } = await query;

      if (error) {
        return { data: [], count: 0, error: error.message };
      }

      // Transformer les données pour extraire le nom de la tribu
      const members = data?.map((member: any) => ({
        ...member,
        tribu_name: member.tribu_member?.[0]?.tribu?.name || null,
      })) || [];

      return { data: members as MemberListItem[], count: count || 0, error: null };
    } catch (error) {
      return { data: [], count: 0, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer un membre par ID
   */
  async getMemberById(memberId: string): Promise<{ data: Profile | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", memberId)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as Profile, error: null };
    } catch (error) {
      return { data: null, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Mettre à jour le statut d'un membre
   */
  async updateMemberStatus(
    memberId: string,
    status: "Active" | "Pending" | "Suspended"
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Logger l'activité
      await adminService.logActivity("member_status_changed", "profile", memberId, `Statut changé à ${status}`);

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Mettre à jour le rôle d'un membre avec validation N+1
   * Vérifie que l'admin actuel a l'autorité d'attribuer ce rôle
   */
  async updateMemberRole(
    memberId: string,
    newRole: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Récupérer le rôle de l'admin actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: "Non authentifié" };

      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!adminProfile) return { success: false, error: "Profil admin introuvable" };

      // Trouver le rôle admin dans la hiérarchie
      const adminRoleDef = ROLES.find(
        (r) => r.displayName === adminProfile.role || r.name === adminProfile.role || r.id === adminProfile.role
      );

      // Trouver le rôle cible dans la hiérarchie
      const targetRoleDef = ROLES.find(
        (r) => r.displayName === newRole || r.name === newRole || r.id === newRole
      );

      // Validation N+1 : vérifier que l'admin a l'autorité
      if (adminRoleDef && targetRoleDef) {
        // L'admin ne peut attribuer que des rôles de niveau inférieur au sien
        if (targetRoleDef.level <= adminRoleDef.level) {
          return {
            success: false,
            error: `Vous ne pouvez pas attribuer un rôle de niveau égal ou supérieur au vôtre (${adminRoleDef.displayName})`,
          };
        }

        // Vérifier que le rôle cible est dans la liste canApprove
        if (adminRoleDef.canApprove.length > 0 && !adminRoleDef.canApprove.includes(targetRoleDef.id)) {
          return {
            success: false,
            error: `Votre rôle (${adminRoleDef.displayName}) ne peut pas attribuer le rôle ${targetRoleDef.displayName}`,
          };
        }
      }

      // Si le Pasteur Principal, il peut tout faire (permissions: ["*"])
      if (adminRoleDef?.permissions?.includes("*")) {
        // Pas de restriction
      }

      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq("id", memberId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Logger l'activité
      await adminService.logActivity(
        "member_role_changed",
        "profile",
        memberId,
        `Rôle changé à ${newRole} par ${adminProfile.role}`
      );

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer les demandes de validation en attente
   */
  async getPendingValidations(): Promise<{ data: ValidationRequest[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("validation_requests")
        .select(`
          *,
          requester:profiles!requester_id(id, first_name, last_name, photo_url)
        `)
        .eq("church_id", DEFAULT_CHURCH_ID)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as ValidationRequest[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Traiter une demande de validation et exécuter l'action associée
   */
  async processValidation(
    requestId: string,
    approved: boolean,
    notes?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Récupérer la demande pour connaître l'action à exécuter
      const { data: request } = await supabase
        .from("validation_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (!request) {
        return { success: false, error: "Demande de validation introuvable" };
      }

      // Mettre à jour le statut de la validation
      const { error } = await supabase
        .from("validation_requests")
        .update({
          status: approved ? "approved" : "rejected",
          validator_id: user?.id,
          validated_at: new Date().toISOString(),
          validator_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Si approuvé, exécuter l'action concrète selon le type de demande
      if (approved && request.request_type) {
        try {
          switch (request.request_type) {
            case "role_change":
              if (request.requested_value && request.requester_id) {
                await supabase
                  .from("profiles")
                  .update({ role: request.requested_value, updated_at: new Date().toISOString() })
                  .eq("id", request.requester_id);
              }
              break;

            case "tribu_change":
              if (request.requested_value && request.requester_id) {
                // Désactiver l'ancien membre de tribu
                await supabase
                  .from("tribu_members")
                  .update({ status: "Inactive", left_at: new Date().toISOString() })
                  .eq("user_id", request.requester_id)
                  .eq("status", "Active");
                // Activer le nouveau
                await supabase
                  .from("tribu_members")
                  .update({ status: "Active" })
                  .eq("user_id", request.requester_id)
                  .eq("tribu_id", request.requested_value)
                  .eq("status", "Pending");
              }
              break;

            case "formation_enrollment":
              if (request.entity_id && request.requester_id) {
                await supabase
                  .from("formation_enrollments")
                  .update({ status: "approved", updated_at: new Date().toISOString() })
                  .eq("id", request.entity_id);
              }
              break;

            case "department_join":
              if (request.entity_id && request.requester_id) {
                await supabase
                  .from("department_members")
                  .update({ status: "active", updated_at: new Date().toISOString() })
                  .eq("id", request.entity_id);
              }
              break;

            case "formation_access":
              if (request.entity_id) {
                await supabase
                  .from("formation_access_requests")
                  .update({ status: "approved", updated_at: new Date().toISOString() })
                  .eq("id", request.entity_id);
              }
              break;

            default:
              console.log("Type de validation non géré:", request.request_type);
          }
        } catch (actionError) {
          console.error("Erreur exécution action validation:", actionError);
          // On ne fait pas échouer la validation même si l'action échoue
        }
      }

      // Logger l'activité
      await adminService.logActivity(
        approved ? "validation_approved" : "validation_rejected",
        "validation_request",
        requestId,
        `${request.request_type || "Demande"} ${approved ? "approuvée" : "rejetée"}${notes ? ": " + notes : ""}`
      );

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Récupérer les logs d'activité récents
   */
  async getRecentActivity(limit: number = 20): Promise<{ data: ActivityLog[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          user:profiles!user_id(id, first_name, last_name, photo_url)
        `)
        .eq("church_id", DEFAULT_CHURCH_ID)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: data as ActivityLog[], error: null };
    } catch (error) {
      return { data: [], error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Logger une activité
   */
  async logActivity(
    action: string,
    entityType?: string,
    entityId?: string,
    description?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from("activity_logs").insert({
        church_id: DEFAULT_CHURCH_ID,
        user_id: user?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        description,
      });
    } catch {
      // Silencieux - ne pas bloquer l'action principale
    }
  },

  /**
   * Récupérer les paramètres de l'église
   */
  async getChurchSettings(): Promise<{ data: ChurchSettings | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from("church_settings")
        .select("*")
        .eq("church_id", DEFAULT_CHURCH_ID)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data as ChurchSettings, error: null };
    } catch (error) {
      return { data: null, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Mettre à jour les paramètres de l'église
   */
  async updateChurchSettings(
    settings: Partial<ChurchSettings>
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from("church_settings")
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq("church_id", DEFAULT_CHURCH_ID);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Une erreur inattendue s'est produite" };
    }
  },

  /**
   * Formater un nombre
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  },

  /**
   * Formater un montant
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  },
};