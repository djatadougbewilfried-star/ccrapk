/**
 * Carte d'une tribu - Affichage compact
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tribu } from "../../../types/database";
import { getTribuIcon, getTribuConstantData } from "../../../services/tribu.service";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

interface TribuCardProps {
  tribu: Tribu;
  onPress?: () => void;
  isSelected?: boolean;
  showMembers?: boolean;
  memberCount?: number;
}

export const TribuCard: React.FC<TribuCardProps> = ({
  tribu,
  onPress,
  isSelected = false,
  showMembers = false,
  memberCount = 0,
}) => {
  // Enrichir avec les constantes pour l'icône et la description de secours
  const tribuConstant = getTribuConstantData(tribu.name);
  const iconName = getTribuIcon(tribu.icon || tribuConstant?.icon || null) as IoniconsName;
  const description = tribu.description || tribuConstant?.description;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: tribu.color },
        isSelected && styles.selected,
        isSelected && { backgroundColor: `${tribu.color}15` },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icône de la tribu */}
      <View style={[styles.iconContainer, { backgroundColor: tribu.color }]}>
        <Ionicons name={iconName} size={24} color="#ffffff" />
      </View>

      {/* Informations */}
      <View style={styles.content}>
        <Text style={styles.name}>{tribu.display_name}</Text>
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        {showMembers && (
          <View style={styles.membersRow}>
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text style={styles.membersText}>{memberCount} membres</Text>
          </View>
        )}
      </View>

      {/* Indicateur de sélection */}
      {isSelected && (
        <View style={[styles.checkIcon, { backgroundColor: tribu.color }]}>
          <Ionicons name="checkmark" size={16} color="#ffffff" />
        </View>
      )}

      {/* Flèche */}
      {onPress && !isSelected && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  selected: {
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  membersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  membersText: {
    fontSize: 12,
    color: "#6b7280",
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TribuCard;