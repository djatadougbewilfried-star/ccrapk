/**
 * Tests for prayer.service.ts - Centre Chretien de Reveil
 */

import { supabase } from "../lib/supabase";
import {
  // Goals
  getPrayerGoal,
  upsertPrayerGoal,
  // Prayer logs
  getPrayerLogs,
  getTodayPrayerLog,
  upsertPrayerLog,
  // Fasting
  getFastingLogs,
  createFastingLog,
  updateFastingLog,
  // Stats
  getPrayerStats,
  getFastingStats,
  // Spiritual events
  getSpiritualEvents,
  // Prayer requests
  getPublicPrayerRequests,
  getMyPrayerRequests,
  createPrayerRequest,
  markRequestAsAnswered,
  prayForRequest,
  // Badges
  getAllBadges,
  getUserBadges,
  // Helpers
  formatDuration,
  getMonthDates,
} from "../services/prayer.service";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

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

// =============================================
// EXPORTS CHECK
// =============================================

describe("prayer.service - exports", () => {
  it("should export getPrayerGoal as a function", () => {
    expect(typeof getPrayerGoal).toBe("function");
  });

  it("should export upsertPrayerGoal as a function", () => {
    expect(typeof upsertPrayerGoal).toBe("function");
  });

  it("should export getPrayerLogs as a function", () => {
    expect(typeof getPrayerLogs).toBe("function");
  });

  it("should export getTodayPrayerLog as a function", () => {
    expect(typeof getTodayPrayerLog).toBe("function");
  });

  it("should export upsertPrayerLog as a function", () => {
    expect(typeof upsertPrayerLog).toBe("function");
  });

  it("should export getFastingLogs as a function", () => {
    expect(typeof getFastingLogs).toBe("function");
  });

  it("should export createFastingLog as a function", () => {
    expect(typeof createFastingLog).toBe("function");
  });

  it("should export updateFastingLog as a function", () => {
    expect(typeof updateFastingLog).toBe("function");
  });

  it("should export getPrayerStats as a function", () => {
    expect(typeof getPrayerStats).toBe("function");
  });

  it("should export getFastingStats as a function", () => {
    expect(typeof getFastingStats).toBe("function");
  });

  it("should export getSpiritualEvents as a function", () => {
    expect(typeof getSpiritualEvents).toBe("function");
  });

  it("should export getPublicPrayerRequests as a function", () => {
    expect(typeof getPublicPrayerRequests).toBe("function");
  });

  it("should export getMyPrayerRequests as a function", () => {
    expect(typeof getMyPrayerRequests).toBe("function");
  });

  it("should export createPrayerRequest as a function", () => {
    expect(typeof createPrayerRequest).toBe("function");
  });

  it("should export markRequestAsAnswered as a function", () => {
    expect(typeof markRequestAsAnswered).toBe("function");
  });

  it("should export prayForRequest as a function", () => {
    expect(typeof prayForRequest).toBe("function");
  });

  it("should export getAllBadges as a function", () => {
    expect(typeof getAllBadges).toBe("function");
  });

  it("should export getUserBadges as a function", () => {
    expect(typeof getUserBadges).toBe("function");
  });

  it("should export formatDuration as a function", () => {
    expect(typeof formatDuration).toBe("function");
  });

  it("should export getMonthDates as a function", () => {
    expect(typeof getMonthDates).toBe("function");
  });
});

// =============================================
// HELPER / UTILITY FUNCTIONS
// =============================================

describe("prayer.service - helper functions", () => {
  describe("formatDuration", () => {
    it("should format minutes less than 60 as 'X min'", () => {
      expect(formatDuration(15)).toBe("15 min");
      expect(formatDuration(45)).toBe("45 min");
      expect(formatDuration(1)).toBe("1 min");
    });

    it("should format exactly 60 minutes as '1h'", () => {
      expect(formatDuration(60)).toBe("1h");
    });

    it("should format hours with remainder as 'Xh Ymin'", () => {
      expect(formatDuration(90)).toBe("1h 30min");
      expect(formatDuration(150)).toBe("2h 30min");
      expect(formatDuration(75)).toBe("1h 15min");
    });

    it("should format exact multiples of 60 without remainder", () => {
      expect(formatDuration(120)).toBe("2h");
      expect(formatDuration(180)).toBe("3h");
    });

    it("should handle zero", () => {
      expect(formatDuration(0)).toBe("0 min");
    });
  });

  describe("getMonthDates", () => {
    it("should return all dates of January 2025", () => {
      const dates = getMonthDates(2025, 0); // January
      expect(dates).toHaveLength(31);
      expect(dates[0].getDate()).toBe(1);
      expect(dates[0].getMonth()).toBe(0);
      expect(dates[30].getDate()).toBe(31);
    });

    it("should return 28 dates for February 2025 (non-leap year)", () => {
      const dates = getMonthDates(2025, 1); // February
      expect(dates).toHaveLength(28);
    });

    it("should return 29 dates for February 2024 (leap year)", () => {
      const dates = getMonthDates(2024, 1); // February 2024 is a leap year
      expect(dates).toHaveLength(29);
    });

    it("should return 30 dates for April", () => {
      const dates = getMonthDates(2025, 3); // April
      expect(dates).toHaveLength(30);
    });

    it("should return Date objects with correct year and month", () => {
      const dates = getMonthDates(2025, 5); // June 2025
      dates.forEach((d) => {
        expect(d.getFullYear()).toBe(2025);
        expect(d.getMonth()).toBe(5);
      });
    });
  });
});

// =============================================
// SUPABASE INTERACTION TESTS
// =============================================

describe("prayer.service - Supabase interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPrayerGoal", () => {
    it("should query prayer_goals table for the given user", async () => {
      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getPrayerGoal("user-001");

      expect(mockSupabase.from).toHaveBeenCalledWith("prayer_goals");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "user-001");
      expect(chain.maybeSingle).toHaveBeenCalled();
    });

    it("should return null when no goal exists", async () => {
      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getPrayerGoal("user-001");
      expect(result).toBeNull();
    });

    it("should return the goal when it exists", async () => {
      const goalData = {
        id: "goal-1",
        user_id: "user-001",
        daily_prayer_minutes: 30,
      };
      const chain = mockChain({ data: goalData, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getPrayerGoal("user-001");
      expect(result).toEqual(goalData);
    });
  });

  describe("upsertPrayerGoal", () => {
    it("should return success on happy path", async () => {
      const chain = mockChain({ data: null, error: null });
      // Add upsert method
      chain.upsert = jest.fn().mockReturnValue(chain);
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await upsertPrayerGoal("user-001", 45);
      expect(result.success).toBe(true);
    });

    it("should return error on failure", async () => {
      const chain = mockChain({ data: null, error: { message: "upsert failed" } });
      chain.upsert = jest.fn().mockReturnValue(chain);
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await upsertPrayerGoal("user-001", 30);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getPrayerLogs", () => {
    it("should query prayer_logs for the given user", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getPrayerLogs("user-001");

      expect(mockSupabase.from).toHaveBeenCalledWith("prayer_logs");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "user-001");
    });

    it("should apply date filters when provided", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getPrayerLogs("user-001", "2025-01-01", "2025-01-31");

      expect(chain.gte).toHaveBeenCalledWith("date", "2025-01-01");
      expect(chain.lte).toHaveBeenCalledWith("date", "2025-01-31");
    });

    it("should return empty array on error", async () => {
      const chain = mockChain({ data: null, error: { message: "err" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getPrayerLogs("user-001");
      expect(result).toEqual([]);
    });
  });

  describe("getTodayPrayerLog", () => {
    it("should query for today's date", async () => {
      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getTodayPrayerLog("user-001");

      expect(mockSupabase.from).toHaveBeenCalledWith("prayer_logs");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "user-001");
      // The second eq call should be the date
      const eqCalls = chain.eq.mock.calls;
      expect(eqCalls[1][0]).toBe("date");
      const dateArg = eqCalls[1][1] as string;
      // Should be an ISO date like "2025-01-15"
      expect(dateArg).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("createFastingLog", () => {
    it("should insert a new fasting log with default values", async () => {
      const chain = mockChain({
        data: { id: "fast-1", status: "in_progress" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await createFastingLog("user-001", {
        start_date: "2025-03-01",
        end_date: "2025-03-03",
        intention: "Prayer for healing",
      });

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("fasting_logs");

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertedData.status).toBe("in_progress");
      expect(insertedData.completed_days).toBe(0);
      expect(insertedData.type).toBe("Partiel"); // default type
    });
  });

  describe("updateFastingLog", () => {
    it("should update completed_days and status", async () => {
      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await updateFastingLog("fast-1", 3, "completed");

      expect(result.success).toBe(true);
      expect(chain.update).toHaveBeenCalled();
      const updateData = chain.update.mock.calls[0][0] as Record<string, unknown>;
      expect(updateData.completed_days).toBe(3);
      expect(updateData.status).toBe("completed");
    });
  });

  describe("getPrayerStats", () => {
    it("should return zeroes when no logs exist", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const stats = await getPrayerStats("user-001");

      expect(stats).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        totalMinutesThisMonth: 0,
        totalDaysThisMonth: 0,
        totalMinutesAllTime: 0,
      });
    });
  });

  describe("getFastingStats", () => {
    it("should return zeroes when no fasting logs exist", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const stats = await getFastingStats("user-001");

      expect(stats).toEqual({
        currentStreak: 0,
        longestStreak: 0,
        totalDaysThisMonth: 0,
        totalDaysAllTime: 0,
      });
    });
  });

  describe("createPrayerRequest", () => {
    it("should insert a prayer request with auto-validation for private requests", async () => {
      const chain = mockChain({
        data: { id: "req-1", subject: "Healing", is_public: false },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await createPrayerRequest("user-001", "church-001", {
        subject: "Healing prayer",
        is_public: false,
      });

      expect(result.success).toBe(true);
      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      // Private requests should be auto-validated
      expect(insertedData.is_validated).toBe(true);
    });

    it("should NOT auto-validate public requests", async () => {
      const chain = mockChain({
        data: { id: "req-2", subject: "Help", is_public: true },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await createPrayerRequest("user-001", "church-001", {
        subject: "Community prayer",
        is_public: true,
      });

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertedData.is_validated).toBe(false);
    });

    it("should set expires_at to approximately one month from now", async () => {
      const chain = mockChain({
        data: { id: "req-3" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const now = new Date();
      await createPrayerRequest("user-001", "church-001", {
        subject: "Test",
        is_public: false,
      });

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      const expiresAt = new Date(insertedData.expires_at as string);
      // Should be approximately 28-31 days from now
      const diffDays = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(27);
      expect(diffDays).toBeLessThan(32);
    });
  });

  describe("markRequestAsAnswered", () => {
    it("should update the request status to Answered", async () => {
      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await markRequestAsAnswered("req-1", "God is faithful");
      expect(result.success).toBe(true);

      expect(chain.update).toHaveBeenCalled();
      const updateData = chain.update.mock.calls[0][0] as Record<string, unknown>;
      expect(updateData.is_answered).toBe(true);
      expect(updateData.status).toBe("Answered");
      expect(updateData.testimony).toBe("God is faithful");
    });
  });

  describe("prayForRequest", () => {
    it("should insert a prayer support record", async () => {
      const insertChain = mockChain({ data: null, error: null });
      const rpcResult = { data: null, error: null };
      (mockSupabase.from as jest.Mock).mockReturnValue(insertChain);
      (mockSupabase.rpc as jest.Mock).mockResolvedValue(rpcResult);

      const result = await prayForRequest("req-1", "user-001");
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("prayer_supports");
    });

    it("should return error for duplicate prayers (code 23505)", async () => {
      const chain = mockChain({
        data: null,
        error: { code: "23505", message: "duplicate" },
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await prayForRequest("req-1", "user-001");
      expect(result.success).toBe(false);
      expect(result.error).toContain("déjà");
    });
  });

  describe("getSpiritualEvents", () => {
    it("should query active spiritual events ordered by start_date", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getSpiritualEvents();

      expect(mockSupabase.from).toHaveBeenCalledWith("spiritual_events");
      expect(chain.eq).toHaveBeenCalledWith("is_active", true);
      expect(chain.order).toHaveBeenCalledWith("start_date", { ascending: true });
      expect(result).toEqual([]);
    });
  });

  describe("getAllBadges", () => {
    it("should query spiritual_badges ordered by requirement_value", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getAllBadges();

      expect(mockSupabase.from).toHaveBeenCalledWith("spiritual_badges");
      expect(chain.order).toHaveBeenCalledWith("requirement_value", { ascending: true });
      expect(result).toEqual([]);
    });
  });

  describe("getUserBadges", () => {
    it("should query user_badges for the given user", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getUserBadges("user-001");

      expect(mockSupabase.from).toHaveBeenCalledWith("user_badges");
      expect(chain.eq).toHaveBeenCalledWith("user_id", "user-001");
      expect(result).toEqual([]);
    });
  });
});
