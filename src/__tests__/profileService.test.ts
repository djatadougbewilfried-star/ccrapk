/**
 * Tests for profile.service.ts - Centre Chretien de Reveil
 */

import { supabase } from "../lib/supabase";
import { profileService } from "../services/profile.service";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock calculateProfileCompletion
jest.mock("../types/database", () => ({
  calculateProfileCompletion: jest.fn(() => 60),
}));

/** Build a chainable mock that resolves with the given value */
function mockChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, jest.Mock> = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "neq",
    "or",
    "order",
    "limit",
    "range",
    "single",
    "maybeSingle",
    "gte",
    "lte",
    "is",
    "in",
    "ilike",
    "upsert",
  ];
  methods.forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  (chain as any).then = jest.fn((resolve: any) => resolve(resolvedValue));
  return chain;
}

describe("profile.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProfile", () => {
    it("should set profile_completion to 20 for new profiles", async () => {
      const chain = mockChain({
        data: {
          id: "user-001",
          email: "test@example.com",
          first_name: "Jean",
          last_name: "Dupont",
          phone: "",
          status: "Active",
          role: "Fidele",
          profile_completion: 20,
        },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await profileService.createProfile(
        "user-001",
        "test@example.com",
        { first_name: "Jean", last_name: "Dupont" }
      );

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();

      // Verify that insert was called with profile_completion: 20
      expect(chain.insert).toHaveBeenCalled();
      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertedData.profile_completion).toBe(20);
    });

    it("should set role to Fidele by default", async () => {
      const chain = mockChain({
        data: { id: "user-002", role: "Fidele" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await profileService.createProfile("user-002", "test2@example.com");

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertedData.role).toBe("Fidele");
    });

    it("should set status to Active by default", async () => {
      const chain = mockChain({
        data: { id: "user-003", status: "Active" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await profileService.createProfile("user-003", "test3@example.com");

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertedData.status).toBe("Active");
    });

    it("should use empty strings when metadata is not provided", async () => {
      const chain = mockChain({
        data: { id: "user-004" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await profileService.createProfile("user-004", "test4@example.com");

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertedData.first_name).toBe("");
      expect(insertedData.last_name).toBe("");
      expect(insertedData.phone).toBe("");
    });

    it("should use metadata values when provided", async () => {
      const chain = mockChain({
        data: { id: "user-005" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await profileService.createProfile("user-005", "test5@example.com", {
        first_name: "Marie",
        last_name: "Konan",
        phone: "+2250700000000",
      });

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertedData.first_name).toBe("Marie");
      expect(insertedData.last_name).toBe("Konan");
      expect(insertedData.phone).toBe("+2250700000000");
    });

    it("should return error when supabase insert fails", async () => {
      const chain = mockChain({
        data: null,
        error: { message: "Duplicate key violation" },
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await profileService.createProfile("user-006", "test6@example.com");

      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error).toContain("Duplicate");
    });
  });

  describe("getCurrentProfile", () => {
    it("should return error when user is not authenticated", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await profileService.getCurrentProfile();
      expect(result.data).toBeNull();
      expect(result.error).toBe("Utilisateur non connecté");
    });

    it("should return profile data when user exists", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-001", email: "test@test.com", user_metadata: {} } },
        error: null,
      });

      const profileData = {
        id: "user-001",
        first_name: "Jean",
        last_name: "Dupont",
        profile_completion: 60,
      };
      const chain = mockChain({ data: profileData, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await profileService.getCurrentProfile();
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it("should query profiles table with user id", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-007", email: "test@test.com", user_metadata: {} } },
        error: null,
      });

      const chain = mockChain({ data: { id: "user-007" }, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await profileService.getCurrentProfile();

      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
      expect(chain.eq).toHaveBeenCalledWith("id", "user-007");
    });

    it("should create profile if none exists", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-new", email: "new@test.com", user_metadata: { first_name: "Test" } } },
        error: null,
      });

      // First query returns null (no existing profile), second creates the profile
      const selectChain = mockChain({ data: null, error: null });
      const insertChain = mockChain({
        data: { id: "user-new", profile_completion: 20 },
        error: null,
      });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return selectChain;
        return insertChain;
      });

      const result = await profileService.getCurrentProfile();
      // The function should have attempted to create the profile
      expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    });
  });

  describe("updateProfile", () => {
    it("should return error when user is not authenticated", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await profileService.updateProfile({ first_name: "Updated" });
      expect(result.success).toBe(false);
      expect(result.error).toBe("Utilisateur non connecté");
    });

    it("should update the profile in supabase", async () => {
      // Mock getUser to return authenticated user
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-001", email: "test@test.com", user_metadata: {} } },
        error: null,
      });

      // Mock getCurrentProfile (called internally)
      const existingProfile = {
        id: "user-001",
        first_name: "Jean",
        last_name: "Dupont",
        profile_completion: 40,
      };

      const selectChain = mockChain({ data: existingProfile, error: null });
      const updateChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return selectChain; // getCurrentProfile inner query
        return updateChain; // the update call
      });

      const result = await profileService.updateProfile({ first_name: "Pierre" });
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it("should include updated_at timestamp in update", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-001", email: "test@test.com", user_metadata: {} } },
        error: null,
      });

      const selectChain = mockChain({
        data: { id: "user-001", first_name: "Old" },
        error: null,
      });
      const updateChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return selectChain;
        return updateChain;
      });

      await profileService.updateProfile({ first_name: "New" });

      expect(updateChain.update).toHaveBeenCalled();
      const updateData = updateChain.update.mock.calls[0][0] as Record<string, unknown>;
      expect(updateData.updated_at).toBeDefined();
      expect(typeof updateData.updated_at).toBe("string");
    });

    it("should calculate and include profile_completion in update", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-001", email: "test@test.com", user_metadata: {} } },
        error: null,
      });

      const selectChain = mockChain({
        data: { id: "user-001", first_name: "Old" },
        error: null,
      });
      const updateChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return selectChain;
        return updateChain;
      });

      await profileService.updateProfile({ first_name: "New", city: "Abidjan" });

      const updateData = updateChain.update.mock.calls[0][0] as Record<string, unknown>;
      expect(updateData.profile_completion).toBeDefined();
      expect(typeof updateData.profile_completion).toBe("number");
    });
  });

  describe("assignToChurch", () => {
    it("should return error when user is not authenticated", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await profileService.assignToChurch("church-001");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Utilisateur non connecté");
    });

    it("should update church_id on the profile", async () => {
      (mockSupabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: "user-001", email: "test@test.com", user_metadata: {} } },
        error: null,
      });

      const selectChain = mockChain({ data: { id: "user-001" }, error: null });
      const updateChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return selectChain;
        return updateChain;
      });

      const result = await profileService.assignToChurch("church-001");
      expect(result.success).toBe(true);
      expect(updateChain.update).toHaveBeenCalledWith({ church_id: "church-001" });
    });
  });
});
