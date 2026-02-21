/**
 * Jest setup file - CCR App Tests
 * Mocks all external dependencies for unit testing
 */

// Mock React Native core
jest.mock("react-native", () => ({
  Platform: { OS: "android", select: jest.fn((obj: any) => obj.android) },
  Alert: { alert: jest.fn() },
  Dimensions: { get: jest.fn(() => ({ width: 375, height: 812 })) },
  StyleSheet: { create: (styles: any) => styles },
  AppState: { currentState: "active", addEventListener: jest.fn() },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

// Mock Supabase
jest.mock("../lib/supabase", () => {
  const mockChain = () => {
    const chain: any = {};
    const methods = [
      "select", "insert", "update", "delete", "upsert",
      "eq", "neq", "or", "and", "not",
      "order", "limit", "range", "single", "maybeSingle",
      "gte", "lte", "gt", "lt",
      "is", "in", "ilike", "like",
      "match", "filter", "contains", "containedBy",
      "textSearch",
    ];
    methods.forEach((m) => {
      chain[m] = jest.fn(() => chain);
    });
    // Terminal - resolve to empty
    chain.then = jest.fn((resolve: any) => resolve({ data: null, error: null, count: 0 }));
    return chain;
  };

  return {
    supabase: {
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
        getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
        resetPasswordForEmail: jest.fn(),
      },
      from: jest.fn(() => mockChain()),
      rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
      channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn(),
      })),
      removeChannel: jest.fn(),
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(),
          download: jest.fn(),
          getPublicUrl: jest.fn(() => ({ data: { publicUrl: "https://test.com/image.png" } })),
        })),
      },
    },
  };
});

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
  useRootNavigationState: jest.fn(() => ({ key: "test" })),
  Stack: { Screen: "Screen" },
  Tabs: { Screen: "Screen" },
  Link: "Link",
  Redirect: "Redirect",
}));

// Mock expo modules
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
  FontAwesome: "FontAwesome",
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: {} },
    manifest: { extra: {} },
  },
}));

jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
}));

jest.mock("expo-device", () => ({
  isDevice: true,
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock zustand persist middleware for stores
jest.mock("zustand/middleware", () => ({
  persist: (config: any) => config,
  createJSONStorage: () => ({}),
}));

// Silence console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;
console.warn = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("deprecated")) return;
  originalWarn(...args);
};
console.error = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("Warning:")) return;
  originalError(...args);
};
