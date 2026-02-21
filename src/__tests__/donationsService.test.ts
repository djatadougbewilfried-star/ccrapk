/**
 * Tests for donations.service.ts - Centre Chretien de Reveil
 */

import { supabase } from "../lib/supabase";
import {
  formatAmount,
  getPaymentMethodLabel,
  getStatusLabel,
  getStatusColor,
  processPayment,
  createDonation,
  getUserDonations,
  getDonationTypes,
  updateDonationStatus,
  getUserDonationStats,
  getDonationById,
} from "../services/donations.service";

// Re-type the mock for convenience
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Helper to build a chainable mock that resolves with the given value
function mockChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain: Record<string, jest.Mock> = {};
  const self = () => chain;
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
  // Make the chain itself thenable (awaitable) so that `await supabase.from(...).select(...)...` works
  (chain as any).then = jest.fn((resolve: any) => resolve(resolvedValue));
  return chain;
}

// Mock the Logger so it does not interfere
jest.mock("../lib/logger", () => ({
  Logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Config used by createDonation
jest.mock("../constants/config", () => ({
  Config: {
    church: { defaultId: "church-uuid-001" },
    payments: { currency: "XOF" },
    app: { env: "development" },
  },
}));

// =============================================
// PURE UTILITY FUNCTION TESTS
// =============================================

describe("donations.service - utility functions", () => {
  describe("formatAmount", () => {
    it("should format a simple integer amount with FCFA suffix", () => {
      // French locale uses non-breaking space as thousands separator
      const result = formatAmount(1000);
      // Accept either regular space or non-breaking space
      expect(result.replace(/\s/g, " ")).toBe("1 000 FCFA");
    });

    it("should format zero", () => {
      expect(formatAmount(0)).toBe("0 FCFA");
    });

    it("should format large amounts", () => {
      const result = formatAmount(1500000);
      expect(result.replace(/\s/g, " ")).toBe("1 500 000 FCFA");
    });

    it("should truncate decimals", () => {
      const result = formatAmount(999.99);
      expect(result.replace(/\s/g, " ")).toBe("1 000 FCFA");
    });
  });

  describe("getPaymentMethodLabel", () => {
    it("returns MTN Mobile Money for mtn_momo", () => {
      expect(getPaymentMethodLabel("mtn_momo")).toBe("MTN Mobile Money");
    });

    it("returns Orange Money for orange_money", () => {
      expect(getPaymentMethodLabel("orange_money")).toBe("Orange Money");
    });

    it("returns Wave for wave", () => {
      expect(getPaymentMethodLabel("wave")).toBe("Wave");
    });

    it("returns Especes for cash", () => {
      expect(getPaymentMethodLabel("cash")).toBe("Espèces");
    });

    it("returns Virement bancaire for bank", () => {
      expect(getPaymentMethodLabel("bank")).toBe("Virement bancaire");
    });

    it("returns the raw key for unknown methods", () => {
      expect(getPaymentMethodLabel("bitcoin")).toBe("bitcoin");
    });
  });

  describe("getStatusLabel", () => {
    it("returns En attente for pending", () => {
      expect(getStatusLabel("pending")).toBe("En attente");
    });

    it("returns En cours for processing", () => {
      expect(getStatusLabel("processing")).toBe("En cours");
    });

    it("returns Complete for completed", () => {
      expect(getStatusLabel("completed")).toBe("Complété");
    });

    it("returns Echoue for failed", () => {
      expect(getStatusLabel("failed")).toBe("Échoué");
    });

    it("returns Rembourse for refunded", () => {
      expect(getStatusLabel("refunded")).toBe("Remboursé");
    });

    it("returns Annule for cancelled", () => {
      expect(getStatusLabel("cancelled")).toBe("Annulé");
    });

    it("returns raw value for unknown status", () => {
      expect(getStatusLabel("unknown_status")).toBe("unknown_status");
    });
  });

  describe("getStatusColor", () => {
    it("returns amber for pending", () => {
      expect(getStatusColor("pending")).toBe("#f59e0b");
    });

    it("returns blue for processing", () => {
      expect(getStatusColor("processing")).toBe("#3b82f6");
    });

    it("returns green for completed", () => {
      expect(getStatusColor("completed")).toBe("#22c55e");
    });

    it("returns red for failed", () => {
      expect(getStatusColor("failed")).toBe("#ef4444");
    });

    it("returns purple for refunded", () => {
      expect(getStatusColor("refunded")).toBe("#8b5cf6");
    });

    it("returns gray for cancelled", () => {
      expect(getStatusColor("cancelled")).toBe("#6b7280");
    });

    it("returns default gray for unknown status", () => {
      expect(getStatusColor("xyz")).toBe("#6b7280");
    });
  });
});

// =============================================
// SERVICE FUNCTIONS THAT HIT SUPABASE (MOCKED)
// =============================================

describe("donations.service - Supabase interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("processPayment", () => {
    it("should be a function", () => {
      expect(typeof processPayment).toBe("function");
    });

    it("should return an object with success and error keys", async () => {
      // Mock Math.random to guarantee success branch (> 0.1)
      const origRandom = Math.random;
      Math.random = () => 0.99;

      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await processPayment("don-123", "mtn_momo", "+2250700000000");

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("error");
      expect(typeof result.success).toBe("boolean");

      Math.random = origRandom;
    }, 10000);

    it("should update donation to completed on success path", async () => {
      const origRandom = Math.random;
      Math.random = () => 0.99;

      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await processPayment("don-456", "orange_money", "+2250700000001");

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();

      Math.random = origRandom;
    }, 10000);

    it("should update donation to failed on failure path", async () => {
      const origRandom = Math.random;
      Math.random = () => 0.05; // < 0.1 triggers failure

      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await processPayment("don-789", "wave", "+2250700000002");

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();

      Math.random = origRandom;
    }, 10000);
  });

  describe("createDonation", () => {
    it("should return success with donation data on happy path", async () => {
      const fakeDonation = {
        id: "donation-001",
        church_id: "church-uuid-001",
        user_id: "user-001",
        type_id: "type-001",
        amount: 5000,
        currency: "XOF",
        payment_method: "mtn_momo",
        payment_reference: "DON-123",
        payment_status: "pending",
        is_anonymous: false,
        notes: null,
        donated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const chain = mockChain({ data: fakeDonation, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await createDonation("user-001", {
        type_id: "type-001",
        amount: 5000,
        payment_method: "mtn_momo",
      });

      expect(result.success).toBe(true);
      expect(result.donation).toBeDefined();
    });

    it("should return error on supabase failure", async () => {
      const chain = mockChain({
        data: null,
        error: { message: "Insert failed" },
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await createDonation("user-001", {
        type_id: "type-001",
        amount: 1000,
        payment_method: "cash",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should NOT include user_id when donation is anonymous", async () => {
      const chain = mockChain({
        data: { id: "donation-002", is_anonymous: true },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await createDonation("user-001", {
        type_id: "type-001",
        amount: 2000,
        payment_method: "mtn_momo",
        is_anonymous: true,
        phone_number: "+2250700000000",
      });

      // Verify that supabase.from was called with "donations"
      expect(mockSupabase.from).toHaveBeenCalledWith("donations");

      // The insert call should have been made - verify via chain
      expect(chain.insert).toHaveBeenCalled();

      // Check the inserted data does not contain user_id
      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(insertedData.user_id).toBeUndefined();
    });

    it("should NOT include phone number in notes for anonymous donations", async () => {
      const chain = mockChain({
        data: { id: "donation-003", is_anonymous: true },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await createDonation("user-001", {
        type_id: "type-001",
        amount: 3000,
        payment_method: "orange_money",
        is_anonymous: true,
        phone_number: "+2250700000000",
      });

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      // Notes should not contain the phone number
      if (insertedData.notes) {
        expect(String(insertedData.notes)).not.toContain("+2250700000000");
      }
    });

    it("should include phone number in notes for non-anonymous donations", async () => {
      const chain = mockChain({
        data: { id: "donation-004", is_anonymous: false },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await createDonation("user-001", {
        type_id: "type-001",
        amount: 4000,
        payment_method: "mtn_momo",
        is_anonymous: false,
        phone_number: "+2250712345678",
      });

      const insertedData = chain.insert.mock.calls[0][0] as Record<string, unknown>;
      expect(String(insertedData.notes)).toContain("+2250712345678");
    });
  });

  describe("getUserDonations", () => {
    it("should pass pagination parameters to supabase range()", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getUserDonations("user-001", 20, 40);

      expect(mockSupabase.from).toHaveBeenCalledWith("donations");
      expect(chain.range).toHaveBeenCalledWith(40, 59); // offset=40, offset+limit-1=59
    });

    it("should use default limit=50 offset=0 when not specified", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getUserDonations("user-001");

      expect(chain.range).toHaveBeenCalledWith(0, 49);
    });

    it("should return empty array on error", async () => {
      const chain = mockChain({ data: null, error: { message: "Network error" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getUserDonations("user-001");
      expect(result).toEqual([]);
    });

    it("should return transformed donation objects", async () => {
      const rawData = [
        {
          id: "d1",
          church_id: "c1",
          user_id: "u1",
          type_id: "t1",
          amount: 5000,
          currency: "XOF",
          payment_method: "mtn_momo",
          payment_reference: "REF-1",
          payment_status: "completed",
          is_anonymous: false,
          notes: null,
          donated_at: "2025-01-15T10:00:00Z",
          created_at: "2025-01-15T10:00:00Z",
          donation_types: { id: "t1", name: "Dime", slug: "dime", icon: null, color: null },
        },
      ];
      const chain = mockChain({ data: rawData, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getUserDonations("u1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("d1");
      expect(result[0].donation_types).toBeDefined();
      expect(result[0].donation_types!.name).toBe("Dime");
    });
  });

  describe("getDonationTypes", () => {
    it("should query donation_types table with is_active=true", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      await getDonationTypes();

      expect(mockSupabase.from).toHaveBeenCalledWith("donation_types");
      expect(chain.eq).toHaveBeenCalledWith("is_active", true);
    });

    it("should return empty array on error", async () => {
      const chain = mockChain({ data: null, error: { message: "fail" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDonationTypes();
      expect(result).toEqual([]);
    });
  });

  describe("updateDonationStatus", () => {
    it("should update the payment_status field", async () => {
      const chain = mockChain({ data: null, error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await updateDonationStatus("don-1", "completed");

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("donations");
      expect(chain.update).toHaveBeenCalledWith({ payment_status: "completed" });
    });

    it("should return error when update fails", async () => {
      const chain = mockChain({ data: null, error: { message: "update error" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await updateDonationStatus("don-1", "failed");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getUserDonationStats", () => {
    it("should return zeroes when no donations exist", async () => {
      const chain = mockChain({ data: [], error: null });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const stats = await getUserDonationStats("user-001");
      expect(stats.totalAmount).toBe(0);
      expect(stats.donationCount).toBe(0);
      expect(stats.thisMonthAmount).toBe(0);
      expect(stats.thisYearAmount).toBe(0);
    });

    it("should return zeroes on error", async () => {
      const chain = mockChain({ data: null, error: { message: "err" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const stats = await getUserDonationStats("user-001");
      expect(stats.totalAmount).toBe(0);
      expect(stats.donationCount).toBe(0);
    });
  });

  describe("getDonationById", () => {
    it("should query by donation id", async () => {
      const chain = mockChain({
        data: { id: "don-1", amount: 1000 },
        error: null,
      });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDonationById("don-1");
      expect(result).toBeDefined();
      expect(mockSupabase.from).toHaveBeenCalledWith("donations");
      expect(chain.eq).toHaveBeenCalledWith("id", "don-1");
    });

    it("should return null on error", async () => {
      const chain = mockChain({ data: null, error: { message: "not found" } });
      (mockSupabase.from as jest.Mock).mockReturnValue(chain);

      const result = await getDonationById("non-existent");
      expect(result).toBeNull();
    });
  });
});
