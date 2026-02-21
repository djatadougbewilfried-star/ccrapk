/**
 * Tests for src/constants/tribus.ts
 * Validates the 12 tribes of Israel constants and helper functions.
 */

import {
  TRIBUS,
  TribuConstant,
  getTribuConstantById,
  getTribuConstantByOrder,
  getTribuConstantByName,
  getTribuConstantsSorted,
} from "../constants/tribus";

describe("TRIBUS constant array", () => {
  it("should have exactly 12 tribes", () => {
    expect(TRIBUS).toHaveLength(12);
  });

  it("should have all orders from 1 to 12", () => {
    const orders = TRIBUS.map((t) => t.order).sort((a, b) => a - b);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("should have unique tribe IDs", () => {
    const ids = TRIBUS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("each tribe should have all required fields", () => {
    for (const tribu of TRIBUS) {
      expect(tribu.id).toBeTruthy();
      expect(typeof tribu.id).toBe("string");

      expect(tribu.name).toBeTruthy();
      expect(typeof tribu.name).toBe("string");

      expect(tribu.displayName).toBeTruthy();
      expect(typeof tribu.displayName).toBe("string");

      expect(tribu.description).toBeTruthy();
      expect(typeof tribu.description).toBe("string");

      expect(tribu.icon).toBeTruthy();
      expect(typeof tribu.icon).toBe("string");

      expect(tribu.color).toBeTruthy();
      expect(typeof tribu.color).toBe("string");

      expect(typeof tribu.order).toBe("number");
      expect(tribu.order).toBeGreaterThanOrEqual(1);
      expect(tribu.order).toBeLessThanOrEqual(12);
    }
  });

  it("should contain all expected tribe IDs", () => {
    const expectedIds = [
      "ruben", "simeon", "levi", "juda", "dan", "nephtali",
      "gad", "aser", "issacar", "zabulon", "joseph", "benjamin",
    ];
    const actualIds = TRIBUS.map((t) => t.id);
    for (const id of expectedIds) {
      expect(actualIds).toContain(id);
    }
  });
});

describe("getTribuConstantById", () => {
  it("should return the correct tribe for each valid ID", () => {
    for (const tribu of TRIBUS) {
      const found = getTribuConstantById(tribu.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(tribu.id);
      expect(found!.name).toBe(tribu.name);
    }
  });

  it("should return undefined for an invalid ID", () => {
    expect(getTribuConstantById("nonexistent")).toBeUndefined();
  });

  it("should return undefined for an empty string", () => {
    expect(getTribuConstantById("")).toBeUndefined();
  });

  it("should return Juda with correct properties", () => {
    const juda = getTribuConstantById("juda");
    expect(juda).toBeDefined();
    expect(juda!.name).toBe("Juda");
    expect(juda!.displayName).toBe("Tribu de Juda");
    expect(juda!.order).toBe(4);
  });
});

describe("getTribuConstantByOrder", () => {
  it("should return the correct tribe for each valid order", () => {
    for (let order = 1; order <= 12; order++) {
      const found = getTribuConstantByOrder(order);
      expect(found).toBeDefined();
      expect(found!.order).toBe(order);
    }
  });

  it("should return undefined for order 0", () => {
    expect(getTribuConstantByOrder(0)).toBeUndefined();
  });

  it("should return undefined for order 13", () => {
    expect(getTribuConstantByOrder(13)).toBeUndefined();
  });

  it("should return Ruben for order 1", () => {
    const first = getTribuConstantByOrder(1);
    expect(first).toBeDefined();
    expect(first!.id).toBe("ruben");
    expect(first!.name).toBe("Ruben");
  });

  it("should return Benjamin for order 12", () => {
    const last = getTribuConstantByOrder(12);
    expect(last).toBeDefined();
    expect(last!.id).toBe("benjamin");
    expect(last!.name).toBe("Benjamin");
  });
});

describe("getTribuConstantByName", () => {
  it("should match exact name", () => {
    const result = getTribuConstantByName("Juda");
    expect(result).toBeDefined();
    expect(result!.id).toBe("juda");
  });

  it("should match accent-insensitive (Simeon matches Simeon)", () => {
    const result = getTribuConstantByName("Simeon");
    expect(result).toBeDefined();
    expect(result!.id).toBe("simeon");
    expect(result!.name).toBe("Sim\u00e9on");
  });

  it("should match accent-insensitive (Levi matches Levi)", () => {
    const result = getTribuConstantByName("Levi");
    expect(result).toBeDefined();
    expect(result!.id).toBe("levi");
    expect(result!.name).toBe("L\u00e9vi");
  });

  it("should be case-insensitive", () => {
    const result = getTribuConstantByName("JUDA");
    expect(result).toBeDefined();
    expect(result!.id).toBe("juda");
  });

  it("should handle leading/trailing spaces", () => {
    const result = getTribuConstantByName("  Benjamin  ");
    expect(result).toBeDefined();
    expect(result!.id).toBe("benjamin");
  });

  it("should return undefined for a non-existent name", () => {
    expect(getTribuConstantByName("Moab")).toBeUndefined();
  });

  it("should return undefined for an empty string", () => {
    expect(getTribuConstantByName("")).toBeUndefined();
  });

  it("should find all tribes by their names", () => {
    for (const tribu of TRIBUS) {
      const found = getTribuConstantByName(tribu.name);
      expect(found).toBeDefined();
      expect(found!.id).toBe(tribu.id);
    }
  });
});

describe("getTribuConstantsSorted", () => {
  it("should return tribes sorted by order ascending", () => {
    const sorted = getTribuConstantsSorted();
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].order).toBeGreaterThan(sorted[i - 1].order);
    }
  });

  it("should return the same number of tribes as TRIBUS", () => {
    const sorted = getTribuConstantsSorted();
    expect(sorted).toHaveLength(TRIBUS.length);
  });

  it("should not mutate the original TRIBUS array", () => {
    const originalOrder = TRIBUS.map((t) => t.id);
    getTribuConstantsSorted();
    const currentOrder = TRIBUS.map((t) => t.id);
    expect(currentOrder).toEqual(originalOrder);
  });

  it("should have Ruben first (order 1)", () => {
    const sorted = getTribuConstantsSorted();
    expect(sorted[0].id).toBe("ruben");
    expect(sorted[0].order).toBe(1);
  });

  it("should have Benjamin last (order 12)", () => {
    const sorted = getTribuConstantsSorted();
    expect(sorted[sorted.length - 1].id).toBe("benjamin");
    expect(sorted[sorted.length - 1].order).toBe(12);
  });
});
