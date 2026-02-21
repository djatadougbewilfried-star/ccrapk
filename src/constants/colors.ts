/**
 * Palette de couleurs CCR
 * Inspirée des couleurs spirituelles et africaines
 */

export const Colors = {
  // Couleur principale - Bleu royal (confiance, spiritualité)
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
    950: "#172554",
  },

  // Couleur secondaire - Or (gloire, excellence)
  secondary: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
    950: "#451a03",
  },

  // Succès - Vert
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },

  // Erreur - Rouge
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  // Warning - Orange
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  // Gris neutres
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },

  // Couleurs de base
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",

  // Couleurs des Tribus (12 tribus d'Israël)
  tribus: {
    ruben: "#ef4444",      // Rouge
    simeon: "#f97316",     // Orange
    levi: "#eab308",       // Jaune
    juda: "#22c55e",       // Vert
    dan: "#14b8a6",        // Teal
    nephtali: "#06b6d4",   // Cyan
    gad: "#3b82f6",        // Bleu
    aser: "#6366f1",       // Indigo
    issacar: "#8b5cf6",    // Violet
    zabulon: "#a855f7",    // Purple
    joseph: "#ec4899",     // Pink
    benjamin: "#f43f5e",   // Rose
  },
} as const;

// Type pour les couleurs
export type ColorName = keyof typeof Colors;
export type TribuColor = keyof typeof Colors.tribus;