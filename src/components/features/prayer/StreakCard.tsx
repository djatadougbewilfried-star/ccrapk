/**
 * Carte affichant le streak de prière
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PrayerStreak } from "../../../types/database";

interface StreakCardProps {
  streak: PrayerStreak | null;
  hasPrayedToday: boolean;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streak,
  hasPrayedToday,
}) => {
  const currentStreak = streak?.current_streak || 0;

  return (
    <View style={styles.container}>
      {/* Flamme principale */}
      <View style={styles.flameContainer}>
        <Ionicons 
          name="flame" 
          size={48} 
          color={hasPrayedToday ? "#f59e0b" : "#d1d5db"} 
        />
        <Text style={[
          styles.streakNumber,
          !hasPrayedToday && styles.streakNumberInactive
        ]}>
          {currentStreak}
        </Text>
      </View>

      {/* Label */}
      <Text style={styles.label}>
        {currentStreak === 0 
          ? "Commencez votre série !" 
          : currentStreak === 1 
            ? "jour consécutif" 
            : "jours consécutifs"}
      </Text>

      {/* Statistiques */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streak?.longest_streak || 0}</Text>
          <Text style={styles.statLabel}>Record</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streak?.total_prayer_days || 0}</Text>
          <Text style={styles.statLabel}>Total jours</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {Math.round((streak?.total_prayer_minutes || 0) / 60)}h
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Message d'encouragement */}
      {!hasPrayedToday && (
        <View style={styles.reminderContainer}>
          <Ionicons name="notifications-outline" size={16} color="#f59e0b" />
          <Text style={styles.reminderText}>
            N'oubliez pas de prier aujourd'hui !
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  flameContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f59e0b",
    marginTop: -8,
  },
  streakNumberInactive: {
    color: "#9ca3af",
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#e5e7eb",
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
    gap: 6,
  },
  reminderText: {
    fontSize: 12,
    color: "#b45309",
    fontWeight: "500",
  },
});

export default StreakCard;