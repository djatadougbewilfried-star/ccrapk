/**
 * Carte d'une demande de prière
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PrayerRequest } from "../../../types/database";

interface PrayerRequestCardProps {
  request: PrayerRequest;
  onPray?: () => void;
  hasPrayed?: boolean;
}

export const PrayerRequestCard: React.FC<PrayerRequestCardProps> = ({
  request,
  onPray,
  hasPrayed = false,
}) => {
  const getUrgencyColor = () => {
    switch (request.urgency) {
      case "critical": return "#dc2626";
      case "urgent": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  const getUrgencyLabel = () => {
    switch (request.urgency) {
      case "critical": return "Critique";
      case "urgent": return "Urgent";
      default: return "Normal";
    }
  };

  const userName = request.is_anonymous 
    ? "Anonyme" 
    : `${request.user?.first_name || ""} ${request.user?.last_name || ""}`.trim() || "Membre";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Ionicons 
              name={request.is_anonymous ? "person" : "person"} 
              size={16} 
              color="#ffffff" 
            />
          </View>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        {request.urgency !== "normal" && (
          <View style={[styles.urgencyBadge, { backgroundColor: `${getUrgencyColor()}20` }]}>
            <Ionicons name="alert-circle" size={12} color={getUrgencyColor()} />
            <Text style={[styles.urgencyText, { color: getUrgencyColor() }]}>
              {getUrgencyLabel()}
            </Text>
          </View>
        )}
      </View>

      {/* Sujet */}
      <Text style={styles.subject}>{request.subject}</Text>

      {/* Description */}
      {request.description && (
        <Text style={styles.description} numberOfLines={3}>
          {request.description}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.prayerCount}>
          <Ionicons name="heart" size={16} color="#ec4899" />
          <Text style={styles.prayerCountText}>
            {request.prayer_count} {request.prayer_count === 1 ? "prière" : "prières"}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.prayButton,
            hasPrayed && styles.prayButtonPrayed,
          ]}
          onPress={onPray}
          disabled={hasPrayed}
        >
          <Ionicons 
            name={hasPrayed ? "checkmark" : "heart-outline"} 
            size={16} 
            color={hasPrayed ? "#22c55e" : "#2563eb"} 
          />
          <Text style={[
            styles.prayButtonText,
            hasPrayed && styles.prayButtonTextPrayed,
          ]}>
            {hasPrayed ? "Prié" : "J'ai prié"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  subject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  prayerCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  prayerCountText: {
    fontSize: 13,
    color: "#6b7280",
  },
  prayButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
  },
  prayButtonPrayed: {
    backgroundColor: "#f0fdf4",
  },
  prayButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
  },
  prayButtonTextPrayed: {
    color: "#22c55e",
  },
});

export default PrayerRequestCard;