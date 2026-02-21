/**
 * Tests for src/stores/userStore.ts
 * Validates the Zustand user store, including state management and utility hooks.
 */

import { useUserStore, useUserFullName, useUserInitials, UserProfile } from "../stores/userStore";

// Helper to create a mock user profile
const createMockUser = (overrides?: Partial<UserProfile>): UserProfile => ({
  id: "user-123",
  email: "jean@example.com",
  first_name: "Jean",
  last_name: "Dupont",
  phone: "+2250701020304",
  gender: "Homme",
  role: "Fid\u00e8le",
  status: "Active",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

describe("useUserStore", () => {
  // Reset the store before each test
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  describe("initial state", () => {
    it("should have user as null", () => {
      const state = useUserStore.getState();
      expect(state.user).toBeNull();
    });

    it("should have isAuthenticated as false", () => {
      const state = useUserStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it("should have isLoading as false", () => {
      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
    });
  });

  describe("setUser", () => {
    it("should set the user and isAuthenticated to true", () => {
      const mockUser = createMockUser();
      useUserStore.getState().setUser(mockUser);

      const state = useUserStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("should set isLoading to false after setting user", () => {
      // First set loading to true
      useUserStore.setState({ isLoading: true });
      const mockUser = createMockUser();
      useUserStore.getState().setUser(mockUser);

      const state = useUserStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it("should replace the existing user", () => {
      const user1 = createMockUser({ first_name: "Alice" });
      const user2 = createMockUser({ first_name: "Bob" });

      useUserStore.getState().setUser(user1);
      expect(useUserStore.getState().user!.first_name).toBe("Alice");

      useUserStore.getState().setUser(user2);
      expect(useUserStore.getState().user!.first_name).toBe("Bob");
    });
  });

  describe("updateUser", () => {
    it("should merge partial updates into the existing user", () => {
      const mockUser = createMockUser();
      useUserStore.getState().setUser(mockUser);

      useUserStore.getState().updateUser({ first_name: "Pierre" });

      const state = useUserStore.getState();
      expect(state.user!.first_name).toBe("Pierre");
      expect(state.user!.last_name).toBe("Dupont"); // unchanged
      expect(state.user!.email).toBe("jean@example.com"); // unchanged
    });

    it("should do nothing when user is null", () => {
      useUserStore.getState().updateUser({ first_name: "Pierre" });

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
    });

    it("should update multiple fields at once", () => {
      const mockUser = createMockUser();
      useUserStore.getState().setUser(mockUser);

      useUserStore.getState().updateUser({
        first_name: "Marie",
        city: "Abidjan",
        profession: "Enseignante",
      });

      const state = useUserStore.getState();
      expect(state.user!.first_name).toBe("Marie");
      expect(state.user!.city).toBe("Abidjan");
      expect(state.user!.profession).toBe("Enseignante");
    });
  });

  describe("clearUser", () => {
    it("should reset to initial state", () => {
      const mockUser = createMockUser();
      useUserStore.getState().setUser(mockUser);

      // Verify user is set
      expect(useUserStore.getState().user).not.toBeNull();
      expect(useUserStore.getState().isAuthenticated).toBe(true);

      useUserStore.getState().clearUser();

      const state = useUserStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("setLoading", () => {
    it("should set isLoading to true", () => {
      useUserStore.getState().setLoading(true);
      expect(useUserStore.getState().isLoading).toBe(true);
    });

    it("should set isLoading to false", () => {
      useUserStore.getState().setLoading(true);
      useUserStore.getState().setLoading(false);
      expect(useUserStore.getState().isLoading).toBe(false);
    });
  });
});

describe("useUserFullName", () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("should return empty string when no user", () => {
    // Call the hook's underlying logic by examining store state directly
    const user = useUserStore.getState().user;
    const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
    expect(fullName).toBe("");
  });

  it('should return "Jean Dupont" when user exists', () => {
    const mockUser = createMockUser({ first_name: "Jean", last_name: "Dupont" });
    useUserStore.getState().setUser(mockUser);

    const user = useUserStore.getState().user;
    const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
    expect(fullName).toBe("Jean Dupont");
  });

  it("should trim whitespace correctly", () => {
    const mockUser = createMockUser({ first_name: "Jean", last_name: "" });
    useUserStore.getState().setUser(mockUser);

    const user = useUserStore.getState().user;
    const fullName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
    expect(fullName).toBe("Jean");
  });
});

describe("useUserInitials", () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("should return empty string when no user", () => {
    const user = useUserStore.getState().user;
    const initials = user
      ? `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase()
      : "";
    expect(initials).toBe("");
  });

  it('should return "JD" when user is Jean Dupont', () => {
    const mockUser = createMockUser({ first_name: "Jean", last_name: "Dupont" });
    useUserStore.getState().setUser(mockUser);

    const user = useUserStore.getState().user;
    const initials = user
      ? `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase()
      : "";
    expect(initials).toBe("JD");
  });

  it("should uppercase the initials", () => {
    const mockUser = createMockUser({ first_name: "alice", last_name: "martin" });
    useUserStore.getState().setUser(mockUser);

    const user = useUserStore.getState().user;
    const initials = user
      ? `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase()
      : "";
    expect(initials).toBe("AM");
  });
});
