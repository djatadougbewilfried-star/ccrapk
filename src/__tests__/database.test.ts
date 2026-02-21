/**
 * Tests for src/types/database.ts
 * Specifically tests the calculateProfileCompletion function.
 */

import { calculateProfileCompletion, Profile } from "../types/database";

/**
 * Helper to create a minimal Profile object with all fields set to null/defaults.
 * This represents an "empty" profile with no optional data filled in.
 */
const createEmptyProfile = (overrides?: Partial<Profile>): Profile => ({
  id: "profile-123",
  church_id: null,
  tribu_id: null,
  first_name: null,
  last_name: null,
  gender: null,
  date_of_birth: null,
  photo_url: null,
  email: null,
  phone: null,
  whatsapp: null,
  address: null,
  city: null,
  neighborhood: null,
  marital_status: null,
  profession: null,
  employer: null,
  date_joined: null,
  is_baptized: false,
  baptism_date: null,
  baptism_certificate_url: null,
  role: "Fid\u00e8le",
  status: "Pending",
  profile_completion: 0,
  last_login: null,
  consent_data_processing: false,
  consent_communications: false,
  consent_date: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

/**
 * Helper to create a fully-filled profile (all fields used in the calculation are populated).
 */
const createFullProfile = (): Profile =>
  createEmptyProfile({
    first_name: "Jean",
    last_name: "Dupont",
    gender: "Homme",
    phone: "+2250701020304",
    email: "jean@example.com",
    date_of_birth: "1990-01-15",
    city: "Abidjan",
    neighborhood: "Cocody",
    marital_status: "C\u00e9libataire",
    profession: "Ing\u00e9nieur",
    photo_url: "https://example.com/photo.jpg",
    address: "123 Rue Example",
  });

describe("calculateProfileCompletion", () => {
  it("should return 0 for an empty profile (all null fields)", () => {
    const profile = createEmptyProfile();
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBe(0);
  });

  it("should return 100 for a fully-filled profile", () => {
    const profile = createFullProfile();
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBe(100);
  });

  it("should return an intermediate value for a partially-filled profile", () => {
    const profile = createEmptyProfile({
      first_name: "Jean",
      last_name: "Dupont",
      gender: "Homme",
      phone: "+2250701020304",
    });
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBeGreaterThan(0);
    expect(completion).toBeLessThan(100);
  });

  it("should give more weight to required fields than optional fields", () => {
    // Profile with one weight-1 field filled (e.g., first_name)
    const profileWithRequired = createEmptyProfile({
      first_name: "Jean",
    });
    const requiredCompletion = calculateProfileCompletion(profileWithRequired);

    // Profile with one weight-0.5 field filled (e.g., neighborhood)
    const profileWithOptional = createEmptyProfile({
      neighborhood: "Cocody",
    });
    const optionalCompletion = calculateProfileCompletion(profileWithOptional);

    // A weight-1 field contributes more than a weight-0.5 field
    expect(requiredCompletion).toBeGreaterThan(optionalCompletion);
  });

  it("should return a number between 0 and 100", () => {
    const profile = createEmptyProfile({ first_name: "Test" });
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBeGreaterThanOrEqual(0);
    expect(completion).toBeLessThanOrEqual(100);
  });

  it("should return a rounded integer", () => {
    const profile = createEmptyProfile({
      first_name: "Jean",
      last_name: "Dupont",
    });
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBe(Math.round(completion));
  });

  it("should not count empty strings as filled", () => {
    const profile = createEmptyProfile({
      first_name: "",
      last_name: "",
    });
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBe(0);
  });

  it("should calculate correctly for a profile with all weight-1 fields filled", () => {
    // The weight-1 fields are: first_name, last_name, gender, phone, email, date_of_birth, city, marital_status
    // Their total weight: 8 * 1 = 8
    // The weight-0.5 fields are: neighborhood, profession, photo_url, address
    // Their total weight: 4 * 0.5 = 2
    // Total weight: 10
    // Filling only weight-1 fields: 8/10 = 80%
    const profile = createEmptyProfile({
      first_name: "Jean",
      last_name: "Dupont",
      gender: "Homme",
      phone: "+2250701020304",
      email: "jean@example.com",
      date_of_birth: "1990-01-15",
      city: "Abidjan",
      marital_status: "C\u00e9libataire",
    });
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBe(80);
  });

  it("should calculate correctly for a profile with only weight-0.5 fields filled", () => {
    // Filling only weight-0.5 fields: 2/10 = 20%
    const profile = createEmptyProfile({
      neighborhood: "Cocody",
      profession: "Ing\u00e9nieur",
      photo_url: "https://example.com/photo.jpg",
      address: "123 Rue Example",
    });
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBe(20);
  });

  it("should handle undefined values as not filled", () => {
    const profile = createEmptyProfile();
    // Explicitly set some fields to undefined
    (profile as any).first_name = undefined;
    (profile as any).last_name = undefined;
    const completion = calculateProfileCompletion(profile);
    expect(completion).toBe(0);
  });
});
