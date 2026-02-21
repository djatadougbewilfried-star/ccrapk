/**
 * Thème et constantes de design CCR
 * Centre Chrétien de Réveil
 */

export const COLORS = {
  // Couleurs principales (basées sur le logo)
  primary: {
    gold: "#D4A84B",
    goldLight: "#E8C878",
    goldDark: "#B8923F",
    goldSoft: "#F5E6C8",
    goldGradientStart: "#D4A84B",
    goldGradientEnd: "#F5E6C8",
  },

  // Couleurs secondaires
  secondary: {
    blue: "#1E3A5F",
    blueDark: "#152A45",
    blueLight: "#2E5A8F",
  },

  // Neutres
  neutral: {
    white: "#FFFFFF",
    background: "#F8FAFC",
    backgroundAlt: "#F1F5F9",
    border: "#E2E8F0",
    borderLight: "#F1F5F9",
  },

  // Textes
  text: {
    primary: "#1E293B",
    secondary: "#64748B",
    tertiary: "#94A3B8",
    inverse: "#FFFFFF",
    gold: "#D4A84B",
  },

  // États
  status: {
    success: "#22C55E",
    successLight: "#DCFCE7",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    info: "#3B82F6",
    infoLight: "#DBEAFE",
  },

  // Overlay
  overlay: {
    dark: "rgba(30, 58, 95, 0.6)",
    light: "rgba(255, 255, 255, 0.9)",
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  huge: 36,
};

export const FONT_WEIGHT = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#1E3A5F",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#1E3A5F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#1E3A5F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: "#1E3A5F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  gold: {
    shadowColor: "#D4A84B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const CHURCH_INFO = {
  name: "Centre Chrétien de Réveil",
  shortName: "CCR",
  slogan: "Aimer Dieu de tout son cœur",
};

export default {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
  CHURCH_INFO,
};