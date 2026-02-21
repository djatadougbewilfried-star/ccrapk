/**
 * Statistiques d'une tribu
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TribuStatsProps {
  memberCount: number;
  activeCount: number;
  newThisMonth: number;
  color: string;
}

export const TribuStats: React.FC<TribuStatsProps> = ({
  memberCount,
  activeCount,
  newThisMonth,
  color,
}) => {
  const stats = [
    {
      icon: "people",
      value: memberCount,
      label: "Total membres",
    },
    {
      icon: "checkmark-circle",
      value: activeCount,
      label: "Actifs",
    },
    {
      icon: "person-add",
      value: newThisMonth,
      label: "Ce mois",
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Ionicons name={stat.icon as any} size={20} color={color} />
          </View>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
});

export default TribuStats;