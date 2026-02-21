/**
 * Hiérarchie des rôles dans l'église CCR
 * Niveau 1 = Plus haut niveau de responsabilité
 */

export interface Role {
  id: string;
  name: string;
  displayName: string;
  level: number;
  description: string;
  permissions: string[];
  canApprove: string[]; // Rôles que ce rôle peut approuver
}

export const ROLES: Role[] = [
  {
    id: "pasteur_principal",
    name: "PasteurPrincipal",
    displayName: "Pasteur Principal",
    level: 1,
    description: "Pasteur fondateur, autorité suprême de l'église",
    permissions: ["*"], // Toutes les permissions
    canApprove: ["pasteur_consacre", "pasteur_residant", "pasteur_assistant"],
  },
  {
    id: "pasteur_consacre",
    name: "PasteurConsacre",
    displayName: "Pasteur Consacré",
    level: 2,
    description: "Chef de centre, a ouvert 3+ assemblées",
    permissions: [
      "view:own_church",
      "view:child_churches",
      "manage:members",
      "manage:finances",
      "manage:events",
      "approve:roles",
    ],
    canApprove: ["pasteur_residant", "pasteur_assistant", "assistant_pasteur"],
  },
  {
    id: "pasteur_residant",
    name: "PasteurResidant",
    displayName: "Pasteur Résidant",
    level: 3,
    description: "Pasteur établi sur une assemblée",
    permissions: [
      "view:own_church",
      "manage:members",
      "manage:finances",
      "manage:events",
      "approve:roles",
    ],
    canApprove: ["pasteur_assistant", "assistant_pasteur", "berger"],
  },
  {
    id: "pasteur_assistant",
    name: "PasteurAssistant",
    displayName: "Pasteur Assistant",
    level: 4,
    description: "Adjoint d'un Pasteur",
    permissions: [
      "view:own_church",
      "manage:members",
      "view:finances",
      "manage:events",
    ],
    canApprove: ["assistant_pasteur", "berger"],
  },
  {
    id: "assistant_pasteur",
    name: "AssistantPasteur",
    displayName: "Assistant Pasteur",
    level: 5,
    description: "Pasteur stagiaire",
    permissions: [
      "view:own_church",
      "view:members",
      "view:finances",
      "manage:events",
    ],
    canApprove: [],
  },
  {
    id: "patriarche",
    name: "Patriarche",
    displayName: "Patriarche",
    level: 6,
    description: "Chef de Tribu (homme)",
    permissions: [
      "view:own_church",
      "manage:tribu",
      "view:members",
      "manage:events",
    ],
    canApprove: ["chef_zone", "chef_famille"],
  },
  {
    id: "matriarche",
    name: "Matriarche",
    displayName: "Matriarche",
    level: 6,
    description: "Chef de Tribu (femme)",
    permissions: [
      "view:own_church",
      "manage:tribu",
      "view:members",
      "manage:events",
    ],
    canApprove: ["chef_zone", "chef_famille"],
  },
  {
    id: "responsable_departement",
    name: "ResponsableDepartement",
    displayName: "Responsable de Département",
    level: 7,
    description: "Responsable d'un département de service",
    permissions: [
      "view:own_church",
      "manage:department",
      "view:members",
    ],
    canApprove: ["serviteur"],
  },
  {
    id: "chef_zone",
    name: "ChefZone",
    displayName: "Chef de Zone",
    level: 8,
    description: "Responsable d'une zone géographique",
    permissions: [
      "view:own_church",
      "manage:zone",
      "view:members",
    ],
    canApprove: ["chef_famille", "mobilisateur"],
  },
  {
    id: "chef_famille",
    name: "ChefFamille",
    displayName: "Chef de Famille",
    level: 9,
    description: "Responsable d'une Famille de Réveil",
    permissions: [
      "view:own_church",
      "manage:famille",
      "view:members",
    ],
    canApprove: [],
  },
  {
    id: "mobilisateur",
    name: "Mobilisateur",
    displayName: "Mobilisateur",
    level: 9,
    description: "Responsable de la mobilisation dans une zone",
    permissions: [
      "view:own_church",
      "view:members",
    ],
    canApprove: [],
  },
  {
    id: "serviteur",
    name: "Serviteur",
    displayName: "Serviteur",
    level: 10,
    description: "Membre servant dans un département",
    permissions: [
      "view:own_church",
      "view:department",
    ],
    canApprove: [],
  },
  {
    id: "fidele",
    name: "Fidele",
    displayName: "Fidèle",
    level: 11,
    description: "Membre de l'église",
    permissions: [
      "view:own_profile",
      "view:events",
      "view:formations",
    ],
    canApprove: [],
  },
];

// Helper pour obtenir un rôle par son ID
export const getRoleById = (id: string): Role | undefined => {
  return ROLES.find((role) => role.id === id);
};

// Helper pour obtenir les rôles qu'un utilisateur peut approuver
export const getApprovableRoles = (roleId: string): Role[] => {
  const userRole = getRoleById(roleId);
  if (!userRole) return [];
  
  return ROLES.filter((role) => userRole.canApprove.includes(role.id));
};

// Helper pour vérifier si un rôle a une permission
export const hasPermission = (roleId: string, permission: string): boolean => {
  const role = getRoleById(roleId);
  if (!role) return false;
  
  // Super admin a toutes les permissions
  if (role.permissions.includes("*")) return true;
  
  return role.permissions.includes(permission);
};

// Obtenir tous les rôles triés par niveau
export const getRolesSorted = (): Role[] => {
  return [...ROLES].sort((a, b) => a.level - b.level);
};