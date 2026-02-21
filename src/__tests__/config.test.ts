/**
 * Tests for src/constants/config.ts
 * Validates the application configuration structure and default values.
 */

import { Config, getChurchId, isProduction, isDevelopment } from "../constants/config";

describe("Config object structure", () => {
  it("should have an 'app' section", () => {
    expect(Config.app).toBeDefined();
    expect(typeof Config.app).toBe("object");
  });

  it("should have a 'church' section", () => {
    expect(Config.church).toBeDefined();
    expect(typeof Config.church).toBe("object");
  });

  it("should have an 'auth' section", () => {
    expect(Config.auth).toBeDefined();
    expect(typeof Config.auth).toBe("object");
  });

  it("should have a 'payments' section", () => {
    expect(Config.payments).toBeDefined();
    expect(typeof Config.payments).toBe("object");
  });

  it("should have an 'api' section", () => {
    expect(Config.api).toBeDefined();
    expect(typeof Config.api).toBe("object");
  });

  it("should have a 'cache' section", () => {
    expect(Config.cache).toBeDefined();
    expect(typeof Config.cache).toBe("object");
  });

  it("should have a 'locale' section", () => {
    expect(Config.locale).toBeDefined();
    expect(typeof Config.locale).toBe("object");
  });

  it("should have a 'links' section", () => {
    expect(Config.links).toBeDefined();
    expect(typeof Config.links).toBe("object");
  });

  it("should have a 'formations' section", () => {
    expect(Config.formations).toBeDefined();
    expect(typeof Config.formations).toBe("object");
  });

  it("should have a 'prayer' section", () => {
    expect(Config.prayer).toBeDefined();
    expect(typeof Config.prayer).toBe("object");
  });

  it("should have a 'tribu' section", () => {
    expect(Config.tribu).toBeDefined();
    expect(typeof Config.tribu).toBe("object");
  });

  it("should have a 'features' section", () => {
    expect(Config.features).toBeDefined();
    expect(typeof Config.features).toBe("object");
  });

  it("should have a 'storage' section", () => {
    expect(Config.storage).toBeDefined();
    expect(typeof Config.storage).toBe("object");
  });
});

describe("Config.app defaults", () => {
  it("should have app name as CCR", () => {
    expect(Config.app.name).toBe("CCR");
  });

  it("should have the full name set", () => {
    expect(Config.app.fullName).toBe("Centre Chr\u00e9tien de R\u00e9veil");
  });

  it("should default version to 1.0.0", () => {
    expect(Config.app.version).toBe("1.0.0");
  });

  it("should have buildNumber as 1", () => {
    expect(Config.app.buildNumber).toBe(1);
  });

  it("should default env to development", () => {
    expect(Config.app.env).toBe("development");
  });
});

describe("Config.church", () => {
  it("should have a defaultId with valid UUID format", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(Config.church.defaultId).toMatch(uuidRegex);
  });

  it("should have a church name", () => {
    expect(Config.church.name).toBe("Centre Chr\u00e9tien de R\u00e9veil");
  });

  it("should have a slogan", () => {
    expect(Config.church.slogan).toBeTruthy();
  });
});

describe("Config.auth", () => {
  it("should have OTP expiry of 10 minutes", () => {
    expect(Config.auth.otpExpiryMinutes).toBe(10);
  });

  it("should have max login attempts of 5", () => {
    expect(Config.auth.maxLoginAttempts).toBe(5);
  });

  it("should have lockout duration of 15 minutes", () => {
    expect(Config.auth.lockoutDurationMinutes).toBe(15);
  });

  it("should have minimum password length of 8", () => {
    expect(Config.auth.minPasswordLength).toBe(8);
  });
});

describe("Config.payments", () => {
  it("should use XOF currency", () => {
    expect(Config.payments.currency).toBe("XOF");
  });

  it("should use FCFA currency symbol", () => {
    expect(Config.payments.currencySymbol).toBe("FCFA");
  });

  it("should have minimum amounts defined", () => {
    expect(Config.payments.minimumAmounts.dime).toBe(100);
    expect(Config.payments.minimumAmounts.offering).toBe(100);
    expect(Config.payments.minimumAmounts.special).toBe(500);
  });

  it("should include expected payment methods", () => {
    expect(Config.payments.methods).toContain("mtn_momo");
    expect(Config.payments.methods).toContain("orange_money");
    expect(Config.payments.methods).toContain("wave");
    expect(Config.payments.methods).toContain("cash");
    expect(Config.payments.methods).toContain("bank");
  });
});

describe("Config.api", () => {
  it("should have a default timeout of 30000ms", () => {
    expect(Config.api.timeout).toBe(30000);
  });

  it("should have 3 retry attempts by default", () => {
    expect(Config.api.retryAttempts).toBe(3);
  });

  it("should have a retry delay of 1000ms", () => {
    expect(Config.api.retryDelay).toBe(1000);
  });
});

describe("Config.cache", () => {
  it("should have defaultTTL of 5 minutes", () => {
    expect(Config.cache.defaultTTL).toBe(5 * 60 * 1000);
  });

  it("should have staticTTL of 24 hours", () => {
    expect(Config.cache.staticTTL).toBe(24 * 60 * 60 * 1000);
  });

  it("should have userTTL of 10 minutes", () => {
    expect(Config.cache.userTTL).toBe(10 * 60 * 1000);
  });
});

describe("Config.locale", () => {
  it("should default to fr-CI locale", () => {
    expect(Config.locale.default).toBe("fr-CI");
  });

  it("should use Africa/Abidjan timezone", () => {
    expect(Config.locale.timezone).toBe("Africa/Abidjan");
  });

  it("should have phone prefix +225", () => {
    expect(Config.locale.phonePrefix).toBe("+225");
  });

  it("should have country code CI", () => {
    expect(Config.locale.countryCode).toBe("CI");
  });
});

describe("Config.storage", () => {
  it("should have storage keys defined", () => {
    expect(Config.storage.keys.authToken).toBe("ccr_auth_token");
    expect(Config.storage.keys.userProfile).toBe("ccr_user_profile");
    expect(Config.storage.keys.settings).toBe("ccr_settings");
    expect(Config.storage.keys.offlineData).toBe("ccr_offline_data");
    expect(Config.storage.keys.lastSync).toBe("ccr_last_sync");
  });

  it("should have storage buckets defined", () => {
    expect(Config.storage.buckets.profiles).toBe("profiles");
    expect(Config.storage.buckets.documents).toBe("documents");
    expect(Config.storage.buckets.events).toBe("events");
  });
});

describe("Config.features", () => {
  it("should have push notifications enabled by default", () => {
    expect(Config.features.enablePushNotifications).toBe(true);
  });

  it("should have biometric auth disabled by default", () => {
    expect(Config.features.enableBiometricAuth).toBe(false);
  });
});

describe("Config helper functions", () => {
  it("getChurchId should return the default church ID", () => {
    expect(getChurchId()).toBe(Config.church.defaultId);
  });

  it("isDevelopment should return true in default env", () => {
    expect(isDevelopment()).toBe(true);
  });

  it("isProduction should return false in default env", () => {
    expect(isProduction()).toBe(false);
  });
});
