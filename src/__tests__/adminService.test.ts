/**
 * Tests for src/services/admin.service.ts
 * Unit tests for the formatNumber and formatAmount utility methods.
 * Supabase is mocked via the setup file.
 */

import { adminService } from "../services/admin.service";

describe("adminService.formatNumber", () => {
  it('should format 1000 as "1.0K"', () => {
    expect(adminService.formatNumber(1000)).toBe("1.0K");
  });

  it('should format 1000000 as "1.0M"', () => {
    expect(adminService.formatNumber(1000000)).toBe("1.0M");
  });

  it('should return "500" for 500', () => {
    expect(adminService.formatNumber(500)).toBe("500");
  });

  it('should return "0" for 0', () => {
    expect(adminService.formatNumber(0)).toBe("0");
  });

  it('should format 1500 as "1.5K"', () => {
    expect(adminService.formatNumber(1500)).toBe("1.5K");
  });

  it('should format 2500000 as "2.5M"', () => {
    expect(adminService.formatNumber(2500000)).toBe("2.5M");
  });

  it('should return "999" for 999', () => {
    expect(adminService.formatNumber(999)).toBe("999");
  });

  it("should handle exact boundary at 1000", () => {
    expect(adminService.formatNumber(1000)).toBe("1.0K");
  });

  it("should handle exact boundary at 1000000", () => {
    expect(adminService.formatNumber(1000000)).toBe("1.0M");
  });

  it('should format 10000 as "10.0K"', () => {
    expect(adminService.formatNumber(10000)).toBe("10.0K");
  });

  it('should return "1" for 1', () => {
    expect(adminService.formatNumber(1)).toBe("1");
  });
});

describe("adminService.formatAmount", () => {
  it("should format with FCFA suffix", () => {
    const result = adminService.formatAmount(1000);
    expect(result).toContain("FCFA");
  });

  it("should use French locale number formatting (space as thousands separator)", () => {
    const result = adminService.formatAmount(1000);
    // Intl.NumberFormat("fr-FR") uses narrow no-break space (U+202F) or non-breaking space (U+00A0) as group separator
    // We check the result contains "1" followed by some separator and "000"
    expect(result).toMatch(/1[\s\u00a0\u202f]000 FCFA/);
  });

  it("should format 0 correctly", () => {
    const result = adminService.formatAmount(0);
    expect(result).toBe("0 FCFA");
  });

  it("should format large amounts correctly", () => {
    const result = adminService.formatAmount(1500000);
    expect(result).toContain("FCFA");
    expect(result).toMatch(/1[\s\u00a0\u202f]500[\s\u00a0\u202f]000 FCFA/);
  });

  it("should format small amounts without separators", () => {
    const result = adminService.formatAmount(500);
    expect(result).toBe("500 FCFA");
  });

  it("should handle decimal amounts", () => {
    const result = adminService.formatAmount(1234.56);
    expect(result).toContain("FCFA");
  });
});
