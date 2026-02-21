/**
 * Carte d'un département
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Department } from "../../../types/database";
import { ministereService } from "../../../services/ministere.service";

interface DepartmentCardProps {
  department: Department;
  onPress?: () => void;
  isMember?: boolean;
  membersCount?: number;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onPress,
  isMember = false,
  membersCount,
}) => {
  const iconName = ministereService.getIconName(department.icon);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isMember && styles.containerMember,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icône */}
      <View style={[styles.iconContainer, { backgroundColor: `${department.color}15` }]}>
        <Ionicons name={iconName as any} size={22} color={department.color} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{department.name}</Text>
          {isMember && (
            <View style={styles.memberBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
              <Text style={styles.memberBadgeText}>Membre</Text>
            </View>
          )}
        </View>
        {department.description && (
          <Text style={styles.description} numberOfLines={1}>
            {department.description}
          </Text>
        )}
        <View style={styles.meta}>
          {department.requires_academie && (
            <View style={styles.metaItem}>
              <Ionicons name="school-outline" size={12} color="#f59e0b" />
              <Text style={styles.metaText}>Académie requise</Text>
            </View>
          )}
          {membersCount !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={12} color="#6b7280" />
              <Text style={styles.metaText}>{membersCount} serviteurs</Text>
            </View>
          )}
        </View>
      </View>

      {/* Flèche */}
      <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  containerMember: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#16a34a",
  },
  description: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#9ca3af",
  },
});

export default DepartmentCard;