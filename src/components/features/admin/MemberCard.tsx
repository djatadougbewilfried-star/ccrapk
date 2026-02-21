/**
 * Carte d'un membre (pour l'admin)
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MemberListItem } from "../../../types/database";

interface MemberCardProps {
  member: MemberListItem;
  onPress?: () => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#22c55e";
      case "Pending":
        return "#f59e0b";
      case "Suspended":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Active":
        return "Actif";
      case "Pending":
        return "En attente";
      case "Suspended":
        return "Suspendu";
      default:
        return status;
    }
  };

  const statusColor = getStatusColor(member.status);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      {member.photo_url ? (
        <Image source={{ uri: member.photo_url }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {member.first_name?.charAt(0)}
            {member.last_name?.charAt(0)}
          </Text>
        </View>
      )}

      {/* Infos */}
      <View style={styles.content}>
        <Text style={styles.name}>
          {member.first_name} {member.last_name}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.role}>{member.role || "Fidèle"}</Text>
          {member.tribu_name && (
            <>
              <View style={styles.dot} />
              <Text style={styles.tribu}>{member.tribu_name}</Text>
            </>
          )}
        </View>
        <Text style={styles.phone}>{member.phone}</Text>
      </View>

      {/* Statut */}
      <View style={styles.rightSection}>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(member.status)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
      </View>
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
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6b7280",
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  role: {
    fontSize: 12,
    color: "#6b7280",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#d1d5db",
    marginHorizontal: 6,
  },
  tribu: {
    fontSize: 12,
    color: "#2563eb",
  },
  phone: {
    fontSize: 11,
    color: "#9ca3af",
  },
  rightSection: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

export default MemberCard;