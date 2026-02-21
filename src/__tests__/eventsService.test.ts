/**
 * Tests for events.service.ts - Centre Chretien de Reveil
 */

import { supabase } from "../lib/supabase";
import {
  getEvents,
  getUpcomingEvents,
  getEventById,
  isUserRegistered,
  registerToEvent,
  unregisterFromEvent,
  getUserRegistrations,
  getUserEvents,
  getEventTypeColor,
  getEventTypeLabel,
  eventService,
} from "../services/events.service";

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

/**
 * Build a chainable mock where the terminal await resolves to `resolvedValue`.
 * Calling specific chain methods can be overridden afterwards.
 */
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
  ];
  methods.forEach((m) => {
    chain[m] = jest.fn().mockReturnValue(chain);
  });
  (chain as any).then = jest.fn((resolve: any) => resolve(resolvedValue));
  return chain;
}

// =============================================
// PURE UTILITY FUNCTIONS
// =============================================

describe("events.service - utility functions", () => {
  describe("getEventTypeColor", () => {
    it("returns the correct color for culte", () => {
      expect(getEventTypeColor("culte")).toBe("#3B82F6");
    });

    it("returns the correct color for croisade", () => {
      expect(getEventTypeColor("croisade")).toBe("#8B5CF6");
    });

    it("returns the correct color for formation", () => {
      expect(getEventTypeColor("formation")).toBe("#10B981");
    });

    it("returns the correct color for mariage", () => {
      expect(getEventTypeColor("mariage")).toBe("#EC4899");
    });

    it("returns the correct color for concert", () => {
      expect(getEventTypeColor("concert")).toBe("#F59E0B");
    });

    it("returns default gray for unknown type", () => {
      expect(getEventTypeColor("unknown_type")).toBe("#6B7280");
    });
  });

  describe("getEventTypeLabel", () => {
    it("returns Culte for culte", () => {
      expect(getEventTypeLabel("culte")).toBe("Culte");
    });

    it("returns Croisade for croisade", () => {
      expect(getEventTypeLabel("croisade")).toBe("Croisade");
    });

    it("returns Formation for formation", () => {
      expect(getEventTypeLabel("formation")).toBe("Formation");
    });

    it("returns Priere for priere", () => {
      expect(getEventTypeLabel("priere")).toBe("Prière");
    });

    it("returns Jeune for jeune", () => {
      expect(getEventTypeLabel("jeune")).toBe("Jeûne");
    });

    it("returns Autre for unknown types", () => {
      expect(getEventTypeLabel("xyz")).toBe("Autre");
    });
  });

  describe("eventService default export", () => {
    it("should expose all service functions", () => {
      expect(eventService.getEvents).toBe(getEvents);
      expect(eventService.getUpcomingEvents).toBe(getUpcomingEvents);
      expect(eventService.getEventById).toBe(getEventById);
      expect(eventService.registerToEvent).toBe(registerToEvent);
      expect(eventService.unregisterFromEvent).toBe(unregisterFromEvent);
      expect(eventService.getEventTypeColor).toBe(getEventTypeColor);
      expect(eventService.getEventTypeLabel).toBe(getEventTypeLabel);
    });
  });
});

// =============================================
// SUPABASE INTERACTION TESTS
// =============================================

describe("events.service - Supabase interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUpcomingEvents", () => {
    it("should query events with is_active=true and ascending order", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getUpcomingEvents();

      expect(mockSupabase.from).toHaveBeenCalledWith("events");
      expect(chain.eq).toHaveBeenCalledWith("is_active", true);
      expect(chain.order).toHaveBeenCalledWith("start_datetime", { ascending: true });
      expect(result).toEqual([]);
    });

    it("should filter events using gte on start_datetime", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getUpcomingEvents();

      // gte should have been called with start_datetime and some ISO date string
      expect(chain.gte).toHaveBeenCalled();
      const gteCall = chain.gte.mock.calls[0];
      expect(gteCall[0]).toBe("start_datetime");
      // The second arg should be an ISO date string
      expect(typeof gteCall[1]).toBe("string");
    });

    it("should throw on supabase error", async () => {
      const chain = mockChain({ data: null, error: { message: "DB error" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await expect(getUpcomingEvents()).rejects.toBeDefined();
    });

    it("should return events sorted by start_datetime ascending", async () => {
      const events = [
        { id: "e1", title: "Event 1", start_datetime: "2025-06-01T10:00:00Z" },
        { id: "e2", title: "Event 2", start_datetime: "2025-07-01T10:00:00Z" },
      ];
      const chain = mockChain({ data: events, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getUpcomingEvents();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("e1");
      expect(result[1].id).toBe("e2");
    });
  });

  describe("registerToEvent - capacity checks", () => {
    it("should reject registration when event is at max capacity", async () => {
      // First call: isUserRegistered check -> not registered
      const registrationChain = mockChain({ data: null, error: null });
      // Second call: event capacity check
      const capacityChain = mockChain({
        data: { max_participants: 50, current_participants: 50 },
        error: null,
      });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        if (table === "event_registrations" && callCount === 1) {
          return registrationChain;
        }
        if (table === "events") {
          return capacityChain;
        }
        return registrationChain;
      });

      const result = await registerToEvent("event-1", "user-1");

      expect(result.success).toBe(false);
      expect(result.error).toContain("complet");
    });

    it("should allow registration when capacity is not reached", async () => {
      // isUserRegistered -> not registered
      const registrationCheckChain = mockChain({ data: null, error: null });
      // event capacity check -> has room
      const capacityChain = mockChain({
        data: { max_participants: 100, current_participants: 50 },
        error: null,
      });
      // insert registration -> success
      const insertChain = mockChain({ data: null, error: null });
      // update participant count
      const updateChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        if (table === "event_registrations" && callCount <= 1) {
          return registrationCheckChain;
        }
        if (table === "events" && callCount === 2) {
          return capacityChain;
        }
        if (table === "event_registrations") {
          return insertChain;
        }
        if (table === "events") {
          return updateChain;
        }
        return insertChain;
      });

      const result = await registerToEvent("event-2", "user-2");

      expect(result.success).toBe(true);
    });

    it("should reject registration if user is already registered", async () => {
      const registrationChain = mockChain({
        data: { id: "reg-1", status: "registered" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(registrationChain);

      const result = await registerToEvent("event-3", "user-3");
      expect(result.success).toBe(false);
      expect(result.error).toContain("déjà inscrit");
    });

    it("should allow registration when max_participants is null (unlimited)", async () => {
      // isUserRegistered -> not registered
      const notRegisteredChain = mockChain({ data: null, error: null });
      // capacity check -> no limit
      const capacityChain = mockChain({
        data: { max_participants: null, current_participants: 0 },
        error: null,
      });
      // insert
      const insertChain = mockChain({ data: null, error: null });
      // update count
      const updateChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
        callCount++;
        if (callCount === 1) return notRegisteredChain;
        if (callCount === 2) return capacityChain;
        if (callCount === 3) return insertChain;
        return updateChain;
      });

      const result = await registerToEvent("event-4", "user-4");
      expect(result.success).toBe(true);
    });
  });

  describe("unregisterFromEvent", () => {
    it("should update registration status to cancelled", async () => {
      const updateChain = mockChain({ data: null, error: null });
      const selectChain = mockChain({
        data: { current_participants: 10 },
        error: null,
      });
      const decrementChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return updateChain;
        if (callCount === 2) return selectChain;
        return decrementChain;
      });

      const result = await unregisterFromEvent("event-5", "user-5");
      expect(result.success).toBe(true);
    });

    it("should decrement participant count after unregistration", async () => {
      const updateChain = mockChain({ data: null, error: null });
      const selectChain = mockChain({
        data: { current_participants: 5 },
        error: null,
      });
      const decrementChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return updateChain;
        if (callCount === 2) return selectChain;
        return decrementChain;
      });

      await unregisterFromEvent("event-6", "user-6");

      // The third call should update events with decremented count
      expect(decrementChain.update).toHaveBeenCalledWith({ current_participants: 4 });
    });

    it("should not set participant count below zero", async () => {
      const updateChain = mockChain({ data: null, error: null });
      const selectChain = mockChain({
        data: { current_participants: 0 },
        error: null,
      });
      const decrementChain = mockChain({ data: null, error: null });

      let callCount = 0;
      (mockSupabase.from as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return updateChain;
        if (callCount === 2) return selectChain;
        return decrementChain;
      });

      await unregisterFromEvent("event-7", "user-7");

      // Math.max(0, 0-1) = 0
      expect(decrementChain.update).toHaveBeenCalledWith({ current_participants: 0 });
    });
  });

  describe("getEventById", () => {
    it("should query by event id using single()", async () => {
      const chain = mockChain({ data: { id: "ev-1", title: "Test" }, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getEventById("ev-1");

      expect(mockSupabase.from).toHaveBeenCalledWith("events");
      expect(chain.eq).toHaveBeenCalledWith("id", "ev-1");
      expect(chain.single).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result!.title).toBe("Test");
    });

    it("should return null on error", async () => {
      const chain = mockChain({ data: null, error: { message: "not found" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getEventById("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("isUserRegistered", () => {
    it("should return true when user has active registration", async () => {
      const chain = mockChain({
        data: { id: "reg-1", status: "registered" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await isUserRegistered("event-1", "user-1");
      expect(result).toBe(true);
    });

    it("should return false when registration is cancelled", async () => {
      const chain = mockChain({
        data: { id: "reg-1", status: "cancelled" },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await isUserRegistered("event-1", "user-1");
      expect(result).toBe(false);
    });

    it("should return false when no registration exists", async () => {
      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await isUserRegistered("event-1", "user-1");
      expect(result).toBe(false);
    });
  });

  describe("getUserRegistrations", () => {
    it("should filter out cancelled registrations", async () => {
      const chain = mockChain({
        data: [
          { id: "r1", status: "registered" },
          { id: "r2", status: "registered" },
        ],
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getUserRegistrations("user-1");
      expect(chain.neq).toHaveBeenCalledWith("status", "cancelled");
      expect(result).toHaveLength(2);
    });
  });

  describe("getEvents", () => {
    it("should query active events ordered by start_datetime", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getEvents();

      expect(mockSupabase.from).toHaveBeenCalledWith("events");
      expect(chain.eq).toHaveBeenCalledWith("is_active", true);
      expect(chain.order).toHaveBeenCalledWith("start_datetime", { ascending: true });
    });
  });
});
