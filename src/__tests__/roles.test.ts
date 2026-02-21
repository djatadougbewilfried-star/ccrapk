/**
 * Tests for src/constants/roles.ts
 * Validates the role hierarchy, helpers, and permissions system for the CCR church app.
 */

import {
  ROLES,
  Role,
  getRoleById,
  getApprovableRoles,
  hasPermission,
  getRolesSorted,
} from "../constants/roles";

describe("ROLES constant array", () => {
  it("should have exactly 13 roles", () => {
    expect(ROLES).toHaveLength(13);
  });

  it("should have levels ranging from 1 to 11", () => {
    const levels = ROLES.map((r) => r.level);
    expect(Math.min(...levels)).toBe(1);
    expect(Math.max(...levels)).toBe(11);
  });

  it("should have unique role IDs", () => {
    const ids = ROLES.map((r) => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have unique role names", () => {
    const names = ROLES.map((r) => r.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it("should have Pasteur Principal at level 1", () => {
    const pp = ROLES.find((r) => r.id === "pasteur_principal");
    expect(pp).toBeDefined();
    expect(pp!.level).toBe(1);
  });

  it("should have Fidele at level 11", () => {
    const fidele = ROLES.find((r) => r.id === "fidele");
    expect(fidele).toBeDefined();
    expect(fidele!.level).toBe(11);
  });

  it("should contain all expected role IDs", () => {
    const expectedIds = [
      "pasteur_principal",
      "pasteur_consacre",
      "pasteur_residant",
      "pasteur_assistant",
      "assistant_pasteur",
      "patriarche",
      "matriarche",
      "responsable_departement",
      "chef_zone",
      "chef_famille",
      "mobilisateur",
      "serviteur",
      "fidele",
    ];
    const actualIds = ROLES.map((r) => r.id);
    for (const id of expectedIds) {
      expect(actualIds).toContain(id);
    }
  });

  it("every role should have required fields", () => {
    for (const role of ROLES) {
      expect(role.id).toBeTruthy();
      expect(role.name).toBeTruthy();
      expect(role.displayName).toBeTruthy();
      expect(typeof role.level).toBe("number");
      expect(role.description).toBeTruthy();
      expect(Array.isArray(role.permissions)).toBe(true);
      expect(Array.isArray(role.canApprove)).toBe(true);
    }
  });
});

describe("getRoleById", () => {
  it("should return the correct role for each valid ID", () => {
    for (const role of ROLES) {
      const found = getRoleById(role.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(role.id);
      expect(found!.name).toBe(role.name);
      expect(found!.level).toBe(role.level);
    }
  });

  it("should return undefined for an invalid ID", () => {
    expect(getRoleById("nonexistent_role")).toBeUndefined();
  });

  it("should return undefined for an empty string", () => {
    expect(getRoleById("")).toBeUndefined();
  });

  it("should return Pasteur Principal when queried by its ID", () => {
    const role = getRoleById("pasteur_principal");
    expect(role).toBeDefined();
    expect(role!.displayName).toBe("Pasteur Principal");
    expect(role!.level).toBe(1);
  });
});

describe("getApprovableRoles", () => {
  it("should return pasteur_consacre, pasteur_residant, pasteur_assistant for pasteur_principal", () => {
    const approvable = getApprovableRoles("pasteur_principal");
    const approvableIds = approvable.map((r) => r.id);
    expect(approvableIds).toContain("pasteur_consacre");
    expect(approvableIds).toContain("pasteur_residant");
    expect(approvableIds).toContain("pasteur_assistant");
    expect(approvable).toHaveLength(3);
  });

  it("should return an empty array for fidele", () => {
    const approvable = getApprovableRoles("fidele");
    expect(approvable).toEqual([]);
  });

  it("should return an empty array for an invalid role ID", () => {
    const approvable = getApprovableRoles("invalid_role");
    expect(approvable).toEqual([]);
  });

  it("should return roles that pasteur_consacre can approve", () => {
    const approvable = getApprovableRoles("pasteur_consacre");
    const approvableIds = approvable.map((r) => r.id);
    expect(approvableIds).toContain("pasteur_residant");
    expect(approvableIds).toContain("pasteur_assistant");
    expect(approvableIds).toContain("assistant_pasteur");
    expect(approvable).toHaveLength(3);
  });

  it("should return empty array for roles with no approval permissions", () => {
    const rolesWithNoApproval = ["assistant_pasteur", "chef_famille", "mobilisateur", "serviteur", "fidele"];
    for (const roleId of rolesWithNoApproval) {
      const approvable = getApprovableRoles(roleId);
      expect(approvable).toEqual([]);
    }
  });
});

describe("hasPermission", () => {
  it("should return true for pasteur_principal with any permission (wildcard)", () => {
    expect(hasPermission("pasteur_principal", "manage:members")).toBe(true);
    expect(hasPermission("pasteur_principal", "manage:finances")).toBe(true);
    expect(hasPermission("pasteur_principal", "some:random:permission")).toBe(true);
    expect(hasPermission("pasteur_principal", "view:anything")).toBe(true);
  });

  it("should return true for a specific role with a valid permission", () => {
    expect(hasPermission("pasteur_consacre", "view:own_church")).toBe(true);
    expect(hasPermission("pasteur_consacre", "manage:members")).toBe(true);
    expect(hasPermission("pasteur_consacre", "manage:finances")).toBe(true);
  });

  it("should return false for a specific role with an invalid permission", () => {
    expect(hasPermission("fidele", "manage:members")).toBe(false);
    expect(hasPermission("fidele", "manage:finances")).toBe(false);
    expect(hasPermission("serviteur", "manage:members")).toBe(false);
  });

  it("should return false for an invalid role ID", () => {
    expect(hasPermission("nonexistent", "view:own_church")).toBe(false);
  });

  it("should return true for fidele with its own permissions", () => {
    expect(hasPermission("fidele", "view:own_profile")).toBe(true);
    expect(hasPermission("fidele", "view:events")).toBe(true);
    expect(hasPermission("fidele", "view:formations")).toBe(true);
  });

  it("should return true for patriarche with manage:tribu", () => {
    expect(hasPermission("patriarche", "manage:tribu")).toBe(true);
  });

  it("should return true for matriarche with manage:tribu", () => {
    expect(hasPermission("matriarche", "manage:tribu")).toBe(true);
  });
});

describe("getRolesSorted", () => {
  it("should return roles sorted by level in ascending order", () => {
    const sorted = getRolesSorted();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].level).toBeGreaterThanOrEqual(sorted[i - 1].level);
    }
  });

  it("should return the same number of roles as ROLES", () => {
    const sorted = getRolesSorted();
    expect(sorted).toHaveLength(ROLES.length);
  });

  it("should not mutate the original ROLES array", () => {
    const originalOrder = ROLES.map((r) => r.id);
    getRolesSorted();
    const currentOrder = ROLES.map((r) => r.id);
    expect(currentOrder).toEqual(originalOrder);
  });

  it("should have Pasteur Principal first", () => {
    const sorted = getRolesSorted();
    expect(sorted[0].id).toBe("pasteur_principal");
  });

  it("should have Fidele last", () => {
    const sorted = getRolesSorted();
    expect(sorted[sorted.length - 1].id).toBe("fidele");
  });
});
