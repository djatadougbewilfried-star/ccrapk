/**
 * Carte d'un événement
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "../../../types/database";
import { eventService } from "../../../services/events.service";

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  isRegistered?: boolean;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  isRegistered = false,
  compact = false,
}) => {
  const typeColor = eventService.getEventTypeColor(event.type);
  const typeLabel = eventService.getEventTypeLabel(event.type);

  const formatDate = (dateString: string): { day: string; month: string; time: string } => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase(),
      time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const dateInfo = formatDate(event.start_datetime);

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.compactDateBox, { backgroundColor: `${typeColor}15` }]}>
          <Text style={[styles.compactDay, { color: typeColor }]}>{dateInfo.day}</Text>
          <Text style={[styles.compactMonth, { color: typeColor }]}>{dateInfo.month}</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
          <View style={styles.compactMeta}>
            <Ionicons name="time-outline" size={12} color="#6b7280" />
            <Text style={styles.compactTime}>{dateInfo.time}</Text>
            {event.location_name && (
              <>
                <View style={styles.compactDot} />
                <Ionicons name="location-outline" size={12} color="#6b7280" />
                <Text style={styles.compactLocation} numberOfLines={1}>
                  {event.location_name}
                </Text>
              </>
            )}
          </View>
        </View>
        {isRegistered && (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Badge type */}
      <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
        <Text style={[styles.typeText, { color: typeColor }]}>{typeLabel}</Text>
      </View>

      {/* Contenu principal */}
      <View style={styles.mainContent}>
        {/* Date */}
        <View style={[styles.dateBox, { backgroundColor: typeColor }]}>
          <Text style={styles.dateDay}>{dateInfo.day}</Text>
          <Text style={styles.dateMonth}>{dateInfo.month}</Text>
        </View>

        {/* Infos */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
          
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#6b7280" />
            <Text style={styles.metaText}>{dateInfo.time}</Text>
          </View>

          {event.location_name && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text style={styles.metaText} numberOfLines={1}>
                {event.location_name}
              </Text>
            </View>
          )}

          {event.is_online && (
            <View style={styles.metaRow}>
              <Ionicons name="videocam-outline" size={14} color="#2563eb" />
              <Text style={[styles.metaText, { color: "#2563eb" }]}>En ligne</Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {event.registration_required && (
          <View style={styles.registrationInfo}>
            <Ionicons name="people-outline" size={14} color="#6b7280" />
            <Text style={styles.participantsText}>
              {event.current_participants}
              {event.max_participants && ` / ${event.max_participants}`} inscrits
            </Text>
          </View>
        )}

        {isRegistered ? (
          <View style={styles.registeredTag}>
            <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
            <Text style={styles.registeredText}>Inscrit</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        )}
      </View>

      {/* Badge en vedette */}
      {event.is_featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#f59e0b" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  mainContent: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dateBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6b7280",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  registrationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  participantsText: {
    fontSize: 12,
    color: "#6b7280",
  },
  registeredTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  registeredText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  // Styles compact
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactDateBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  compactDay: {
    fontSize: 16,
    fontWeight: "800",
  },
  compactMonth: {
    fontSize: 9,
    fontWeight: "600",
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  compactMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  compactTime: {
    fontSize: 12,
    color: "#6b7280",
  },
  compactDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#d1d5db",
    marginHorizontal: 4,
  },
  compactLocation: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
  },
  registeredBadge: {
    marginLeft: 8,
  },
});

export default EventCard;