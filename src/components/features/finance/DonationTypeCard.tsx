/**
 * Carte d'un type de don
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DonationType } from "../../../services/donations.service";

interface DonationTypeCardProps {
  type: DonationType;
  onPress?: () => void;
  isSelected?: boolean;
}

export const DonationTypeCard: React.FC<DonationTypeCardProps> = ({
  type,
  onPress,
  isSelected = false,
}) => {
  const getIconName = (): any => {
    const iconMap: Record<string, string> = {
      "trending-up": "trending-up",
      "gift": "gift",
      "heart": "heart",
      "globe": "globe",
      "business": "business",
      "people": "people",
      "cash": "cash",
    };
    return iconMap[type.icon || "cash"] || "cash";
  };

  const typeColor = type.color || "#22c55e";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isSelected && { borderColor: typeColor },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icône */}
      <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
        <Ionicons name={getIconName()} size={24} color={typeColor} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.name}>{type.name}</Text>
        {type.description && (
          <Text style={styles.description} numberOfLines={2}>
            {type.description}
          </Text>
        )}
      </View>

      {/* Indicateur sélection */}
      {isSelected ? (
        <View style={[styles.checkIcon, { backgroundColor: typeColor }]}>
          <Ionicons name="checkmark" size={16} color="#ffffff" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
      )}
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
  },
  containerSelected: {
    backgroundColor: "#f0fdf4",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 16,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DonationTypeCard;