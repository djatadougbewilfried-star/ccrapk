/**
 * Les 12 Tribus d'Israël - Système d'intégration CCR
 * Chaque nouveau membre est affecté à une Tribu
 *
 * Ces constantes fournissent les données statiques (descriptions bibliques,
 * icônes, couleurs par défaut) pour enrichir les données dynamiques Supabase.
 */

import { Colors } from "./colors";

export interface TribuConstant {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: string;
  patriarch?: string; // Nom du patriarche/matriarche
  order: number; // Ordre pour les passages
}

export const TRIBUS: TribuConstant[] = [
  {
    id: "ruben",
    name: "Ruben",
    displayName: "Tribu de Ruben",
    description: "Premier-né de Jacob. Symbole de force et d'excellence.",
    color: Colors.tribus.ruben,
    icon: "water",
    order: 1,
  },
  {
    id: "simeon",
    name: "Siméon",
    displayName: "Tribu de Siméon",
    description: "Celui qui écoute. Symbole d'obéissance et d'écoute.",
    color: Colors.tribus.simeon,
    icon: "ear",
    order: 2,
  },
  {
    id: "levi",
    name: "Lévi",
    displayName: "Tribu de Lévi",
    description: "Tribu sacerdotale. Symbole de service et de consécration.",
    color: Colors.tribus.levi,
    icon: "heart",
    order: 3,
  },
  {
    id: "juda",
    name: "Juda",
    displayName: "Tribu de Juda",
    description: "Louange. Tribu royale dont est issu le Christ.",
    color: Colors.tribus.juda,
    icon: "crown",
    order: 4,
  },
  {
    id: "dan",
    name: "Dan",
    displayName: "Tribu de Dan",
    description: "Celui qui juge. Symbole de justice et de discernement.",
    color: Colors.tribus.dan,
    icon: "scale",
    order: 5,
  },
  {
    id: "nephtali",
    name: "Nephtali",
    displayName: "Tribu de Nephtali",
    description: "Ma lutte. Symbole de persévérance et de victoire.",
    color: Colors.tribus.nephtali,
    icon: "trophy",
    order: 6,
  },
  {
    id: "gad",
    name: "Gad",
    displayName: "Tribu de Gad",
    description: "Bonheur. Symbole de joie et de bénédiction.",
    color: Colors.tribus.gad,
    icon: "smile",
    order: 7,
  },
  {
    id: "aser",
    name: "Aser",
    displayName: "Tribu d'Aser",
    description: "Heureux. Symbole de prospérité et d'abondance.",
    color: Colors.tribus.aser,
    icon: "star",
    order: 8,
  },
  {
    id: "issacar",
    name: "Issacar",
    displayName: "Tribu d'Issacar",
    description: "Récompense. Symbole de travail et de récompense divine.",
    color: Colors.tribus.issacar,
    icon: "gift",
    order: 9,
  },
  {
    id: "zabulon",
    name: "Zabulon",
    displayName: "Tribu de Zabulon",
    description: "Habitation. Symbole d'accueil et d'hospitalité.",
    color: Colors.tribus.zabulon,
    icon: "home",
    order: 10,
  },
  {
    id: "joseph",
    name: "Joseph",
    displayName: "Tribu de Joseph",
    description: "Que Dieu ajoute. Symbole de multiplication et de grâce.",
    color: Colors.tribus.joseph,
    icon: "plus-circle",
    order: 11,
  },
  {
    id: "benjamin",
    name: "Benjamin",
    displayName: "Tribu de Benjamin",
    description: "Fils de la main droite. Symbole de faveur et de protection.",
    color: Colors.tribus.benjamin,
    icon: "shield",
    order: 12,
  },
];

// Helper pour obtenir une Tribu par son ID
export const getTribuConstantById = (id: string): TribuConstant | undefined => {
  return TRIBUS.find((tribu) => tribu.id === id);
};

// Helper pour obtenir une Tribu par son ordre
export const getTribuConstantByOrder = (order: number): TribuConstant | undefined => {
  return TRIBUS.find((tribu) => tribu.order === order);
};

// Obtenir toutes les Tribus triées par ordre
export const getTribuConstantsSorted = (): TribuConstant[] => {
  return [...TRIBUS].sort((a, b) => a.order - b.order);
};

/**
 * Trouver la constante d'une Tribu à partir de son nom Supabase.
 * Utilise une correspondance normalisée (sans accents, minuscules).
 */
export const getTribuConstantByName = (name: string): TribuConstant | undefined => {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  const normalized = normalize(name);
  return TRIBUS.find((tribu) => normalize(tribu.name) === normalized);
};