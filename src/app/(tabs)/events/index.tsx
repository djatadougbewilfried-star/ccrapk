/**
 * Écran Événements - Centre Chrétien de Réveil
 * Affiche les événements depuis Supabase
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEvents } from "../../../hooks/useEvents";
import { Event } from "../../../services/events.service";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../constants/theme";

type FilterType = "all" | "upcoming" | "registered";

export default function EventsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const { 
    events, 
    isLoading, 
    error, 
    isRegistered, 
    register, 
    unregister,
    getFilteredEvents,
    refresh 
  } = useEvents();

  const [refreshing, setRefreshing] = useState(false);

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Gérer l'inscription/désinscription
  const handleRegistration = async (event: Event) => {
    const registered = isRegistered(event.id);
    
    if (registered) {
      Alert.alert(
        "Se désinscrire",
        `Voulez-vous vous désinscrire de "${event.title}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Se désinscrire",
            style: "destructive",
            onPress: async () => {
              const result = await unregister(event.id);
              if (result.success) {
                Alert.alert("Succès", "Vous êtes désinscrit de cet événement");
              } else {
                Alert.alert("Erreur", result.error || "Une erreur est survenue");
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "S'inscrire",
        `Voulez-vous vous inscrire à "${event.title}" ?`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "S'inscrire",
            onPress: async () => {
              const result = await register(event.id);
              if (result.success) {
                Alert.alert("Succès", "Vous êtes inscrit à cet événement !");
              } else {
                Alert.alert("Erreur", result.error || "Une erreur est survenue");
              }
            },
          },
        ]
      );
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase(),
      time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      fullDate: date.toLocaleDateString("fr-FR", { 
        weekday: "long", 
        day: "numeric", 
        month: "long" 
      }),
    };
  };

  // Obtenir la couleur selon le type
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Culte: "#D4A84B",
      Prière: "#EC4899",
      Formation: "#8B5CF6",
      Louange: "#3B82F6",
      Famille: "#22C55E",
      Jeunesse: "#F59E0B",
    };
    return colors[type] || "#6B7280";
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "upcoming", label: "À venir" },
    { key: "registered", label: "Inscrits" },
  ];

  const filteredEvents = getFilteredEvents(activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Événements</Text>
        <Text style={styles.headerSubtitle}>
          {events.length} événement{events.length > 1 ? "s" : ""} à venir
        </Text>
      </LinearGradient>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.gold}
          />
        }
      >
        {/* État de chargement */}
        {isLoading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary.gold} />
            <Text style={styles.loadingText}>Chargement des événements...</Text>
          </View>
        )}

        {/* Erreur */}
        {error && (
          <ThemedCard variant="default" style={styles.errorCard}>
            <Ionicons name="alert-circle" size={24} color={COLORS.status.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </ThemedCard>
        )}

        {/* Liste vide */}
        {!isLoading && !error && filteredEvents.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.neutral.border} />
            <Text style={styles.emptyTitle}>Aucun événement</Text>
            <Text style={styles.emptyText}>
              {activeFilter === "registered"
                ? "Vous n'êtes inscrit à aucun événement"
                : "Aucun événement prévu pour le moment"}
            </Text>
          </View>
        )}

        {/* Liste des événements */}
        {!isLoading && filteredEvents.map((event) => {
          const date = formatDate(event.start_datetime);
          const registered = isRegistered(event.id);
          const typeColor = getTypeColor(event.type);

          return (
            <ThemedCard key={event.id} variant="default" style={styles.eventCard}>
              <View style={styles.eventContent}>
                {/* Date */}
                <LinearGradient
                  colors={[typeColor, typeColor + "DD"]}
                  style={styles.dateBox}
                >
                  <Text style={styles.dateDay}>{date.day}</Text>
                  <Text style={styles.dateMonth}>{date.month}</Text>
                </LinearGradient>

                {/* Infos */}
                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <View style={[styles.typeBadge, { backgroundColor: typeColor + "20" }]}>
                      <Text style={[styles.typeText, { color: typeColor }]}>
                        {event.type}
                      </Text>
                    </View>
                    {registered && (
                      <View style={styles.registeredBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={COLORS.status.success} />
                        <Text style={styles.registeredText}>Inscrit</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>

                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={14} color={COLORS.text.tertiary} />
                      <Text style={styles.detailText}>{date.time}</Text>
                    </View>
                    {event.location_name && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={14} color={COLORS.text.tertiary} />
                        <Text style={styles.detailText} numberOfLines={1}>
                          {event.location_name}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Bouton d'inscription */}
                  <TouchableOpacity
                    style={[
                      styles.registerButton,
                      registered && styles.unregisterButton,
                    ]}
                    onPress={() => handleRegistration(event)}
                  >
                    <Ionicons
                      name={registered ? "close-circle-outline" : "add-circle-outline"}
                      size={18}
                      color={registered ? COLORS.status.error : COLORS.primary.gold}
                    />
                    <Text
                      style={[
                        styles.registerButtonText,
                        registered && styles.unregisterButtonText,
                      ]}
                    >
                      {registered ? "Se désinscrire" : "S'inscrire"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Description */}
              {event.description && (
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
              )}
            </ThemedCard>
          );
        })}

        {/* Carte proposer événement */}
        <ThemedCard variant="gold" style={styles.proposeCard}>
          <Ionicons name="add-circle" size={32} color={COLORS.primary.gold} />
          <Text style={styles.proposeTitle}>Proposer un événement</Text>
          <Text style={styles.proposeText}>
            Vous souhaitez organiser un événement pour la communauté ?
          </Text>
          <TouchableOpacity
            style={styles.proposeButton}
            onPress={() => {
              Alert.alert(
                "Proposer un événement",
                "Pour proposer un événement, veuillez contacter votre responsable de département ou votre pasteur.",
                [{ text: "Compris" }]
              );
            }}
          >
            <Text style={styles.proposeButtonText}>Faire une demande</Text>
          </TouchableOpacity>
        </ThemedCard>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary.goldLight,
    marginTop: SPACING.xs,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary.gold,
    borderColor: COLORS.primary.gold,
  },
  filterText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
  },
  filterTextActive: {
    color: COLORS.neutral.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.tertiary,
  },
  errorCard: {
    alignItems: "center",
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.status.error,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  retryText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary.gold,
    fontWeight: FONT_WEIGHT.semibold,
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.tertiary,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  eventCard: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
  },
  eventContent: {
    flexDirection: "row",
  },
  dateBox: {
    width: 56,
    height: 64,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  dateDay: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  dateMonth: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.neutral.white,
    opacity: 0.9,
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  registeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  registeredText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.status.success,
    fontWeight: FONT_WEIGHT.medium,
  },
  eventTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  eventDetails: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    flex: 1,
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary.gold + "15",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary.gold + "30",
  },
  unregisterButton: {
    backgroundColor: COLORS.status.error + "10",
    borderColor: COLORS.status.error + "30",
  },
  registerButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary.gold,
  },
  unregisterButtonText: {
    color: COLORS.status.error,
  },
  eventDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.borderLight,
  },
  proposeCard: {
    marginTop: SPACING.xl,
    alignItems: "center",
    padding: SPACING.xl,
  },
  proposeTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
  },
  proposeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  proposeButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary.gold,
    borderRadius: BORDER_RADIUS.full,
  },
  proposeButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
});