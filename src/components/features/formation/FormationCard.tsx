/**
 * Carte d'une formation
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Formation } from "../../../types/database";

interface FormationCardProps {
  formation: Formation;
  onPress?: () => void;
  isEnrolled?: boolean;
  progress?: number;
}

export const FormationCard: React.FC<FormationCardProps> = ({
  formation,
  onPress,
  isEnrolled = false,
  progress = 0,
}) => {
  const getIconName = (): any => {
    switch (formation.icon) {
      case "school": return "school";
      case "water": return "water";
      case "people": return "people";
      case "globe": return "globe";
      default: return "book";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icône */}
      <View style={[styles.iconContainer, { backgroundColor: formation.color }]}>
        <Ionicons name={getIconName()} size={28} color="#ffffff" />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{formation.name}</Text>
          {formation.is_mandatory && (
            <View style={styles.mandatoryBadge}>
              <Text style={styles.mandatoryText}>Obligatoire</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {formation.description}
        </Text>

        {/* Durée */}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.metaText}>
            {formation.duration_months 
              ? `${formation.duration_months} mois` 
              : `${formation.duration_weeks} semaines`}
          </Text>
        </View>

        {/* Progression si inscrit */}
        {isEnrolled && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%`, backgroundColor: formation.color }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: formation.color }]}>
              {progress}%
            </Text>
          </View>
        )}
      </View>

      {/* Flèche */}
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
  },
  mandatoryBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mandatoryText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#d97706",
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default FormationCard;