/**
 * Carte d'un membre de tribu
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
import { Profile } from "../../../types/database";

interface MemberCardProps {
  member: Profile;
  onPress?: () => void;
  showRole?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  onPress,
  showRole = true,
}) => {
  const initials = `${(member.first_name?.[0] || "?").toUpperCase()}${(member.last_name?.[0] || "").toUpperCase()}`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Avatar */}
      <View style={styles.avatar}>
        {member.photo_url ? (
          <Image
            source={{ uri: member.photo_url }}
            style={styles.avatarImage}
            defaultSource={undefined}
          />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
      </View>

      {/* Informations */}
      <View style={styles.content}>
        <Text style={styles.name}>
          {member.first_name || "Prénom"} {member.last_name || "Nom"}
        </Text>
        {showRole && (
          <View style={styles.roleContainer}>
            <Ionicons name="ribbon-outline" size={12} color="#6b7280" />
            <Text style={styles.role}>{member.role || "Fidèle"}</Text>
          </View>
        )}
        {member.city && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={12} color="#9ca3af" />
            <Text style={styles.location}>{member.city}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {onPress && (
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
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
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
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  role: {
    fontSize: 12,
    color: "#6b7280",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

export default MemberCard;