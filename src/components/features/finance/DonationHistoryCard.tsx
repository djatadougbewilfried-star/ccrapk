/**
 * Carte d'historique de don
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Donation,
  formatAmount,
  getPaymentMethodLabel,
  getStatusLabel,
  getStatusColor,
} from "../../../services/donations.service";

interface DonationHistoryCardProps {
  donation: Donation;
  onPress?: () => void;
}

export const DonationHistoryCard: React.FC<DonationHistoryCardProps> = ({
  donation,
  onPress,
}) => {
  const statusColor = getStatusColor(donation.payment_status);
  const statusLabel = getStatusLabel(donation.payment_status);
  const typeName = donation.donation_types?.name || "Don";

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getIconName = (): any => {
    const icon = donation.donation_types?.icon || "cash";
    const iconMap: Record<string, string> = {
      "trending-up": "trending-up",
      "gift": "gift",
      "heart": "heart",
      "globe": "globe",
      "business": "business",
      "people": "people",
      "cash": "cash",
    };
    return iconMap[icon] || "cash";
  };

  const typeColor = donation.donation_types?.color || "#22c55e";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      {/* Icône du type */}
      <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
        <Ionicons name={getIconName()} size={20} color={typeColor} />
      </View>

      {/* Contenu */}
      <View style={styles.content}>
        <Text style={styles.typeName}>{typeName}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDate(donation.donated_at)}</Text>
          <View style={styles.dot} />
          <Text style={styles.method}>
            {getPaymentMethodLabel(donation.payment_method)}
          </Text>
        </View>
      </View>

      {/* Montant et statut */}
      <View style={styles.rightSection}>
        <Text style={styles.amount}>
          {formatAmount(donation.amount)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {statusLabel}
          </Text>
        </View>
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  typeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
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
  method: {
    fontSize: 12,
    color: "#6b7280",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
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

export default DonationHistoryCard;