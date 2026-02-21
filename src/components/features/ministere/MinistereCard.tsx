/**
 * Carte d'un ministère
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Ministere } from "../../../types/database";
import { ministereService } from "../../../services/ministere.service";

interface MinistereCardProps {
  ministere: Ministere;
  onPress?: () => void;
  isActive?: boolean;
}

export const MinistereCard: React.FC<MinistereCardProps> = ({
  ministere,
  onPress,
  isActive = false,
}) => {
  const iconName = ministereService.getIconName(ministere.icon);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isActive && styles.containerActive,
        isActive && { borderColor: ministere.color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icône */}
      <View style={[styles.iconContainer, { backgroundColor: `${ministere.color}15` }]}>
        <Ionicons name={iconName as any} size={28} color={ministere.color} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.name}>{ministere.name}</Text>
        {ministere.description && (
          <Text style={styles.description} numberOfLines={2}>
            {ministere.description}
          </Text>
        )}
      </View>

      {/* Flèche */}
      <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  containerActive: {
    backgroundColor: "#f0fdf4",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
});

export default MinistereCard;