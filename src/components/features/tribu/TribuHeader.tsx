/**
 * En-tête détaillé d'une tribu
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tribu } from "../../../types/database";
import { getTribuIcon, getTribuConstantData } from "../../../services/tribu.service";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface TribuHeaderProps {
  tribu: Tribu;
  memberCount?: number;
}

export const TribuHeader: React.FC<TribuHeaderProps> = ({
  tribu,
  memberCount = 0,
}) => {
  // Enrichir avec les constantes pour l'icône et la description
  const tribuConstant = getTribuConstantData(tribu.name);
  const iconName = getTribuIcon(tribu.icon || tribuConstant?.icon || null) as IoniconsName;
  const description = tribu.description || tribuConstant?.description;

  return (
    <View style={[styles.container, { backgroundColor: `${tribu.color}20` }]}>
      {/* Grande icône */}
      <View style={[styles.iconContainer, { backgroundColor: tribu.color }]}>
        <Ionicons name={iconName} size={40} color="#ffffff" />
      </View>

      {/* Nom et description */}
      <Text style={[styles.name, { color: tribu.color }]}>
        {tribu.display_name}
      </Text>

      {description && (
        <Text style={styles.description}>{description}</Text>
      )}

      {/* Statistiques */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={20} color={tribu.color} />
          <Text style={styles.statValue}>{memberCount}</Text>
          <Text style={styles.statLabel}>Membres</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={20} color={tribu.color} />
          <Text style={styles.statValue}>{tribu.order_index}</Text>
          <Text style={styles.statLabel}>Ordre</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#d1d5db",
  },
});

export default TribuHeader;