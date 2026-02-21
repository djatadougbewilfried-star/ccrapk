/**
 * Écran Calendrier Spirituel - Centre Chrétien de Réveil
 * Visualisation du calendrier de prière et jeûne
 */

import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { usePrayer } from "../../../hooks/usePrayer";
import { formatDuration } from "../../../services/prayer.service";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";

// Noms des mois en français
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

// Noms des jours en français
const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export default function CalendrierScreen() {
  const {
    prayerLogs,
    fastingLogs,
    spiritualEvents,
    prayerStats,
    isLoading,
    refresh,
  } = usePrayer();

  const [refreshing, setRefreshing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Rafraîchir
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Obtenir le mois et l'année actuels
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Naviguer entre les mois
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Générer les jours du calendrier
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{
      date: string | null;
      day: number | null;
      isToday: boolean;
      hasPrayer: boolean;
      hasFasting: boolean;
      hasEvent: boolean;
      prayerMinutes: number;
    }> = [];

    // Jours vides au début
    for (let i = 0; i < startingDay; i++) {
      days.push({
        date: null,
        day: null,
        isToday: false,
        hasPrayer: false,
        hasFasting: false,
        hasEvent: false,
        prayerMinutes: 0,
      });
    }

    // Jours du mois
    const today = new Date().toISOString().split("T")[0];

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      
      // Vérifier si on a prié ce jour
      const prayerLog = prayerLogs.find((log) => log.date === dateStr);
      
      // Vérifier si on a jeûné ce jour
      const hasFasting = fastingLogs.some((log) => {
        return dateStr >= log.start_date && dateStr <= log.end_date;
      });

      // Vérifier s'il y a un événement ce jour
      const hasEvent = spiritualEvents.some((event) => {
        return dateStr >= event.start_date && dateStr <= event.end_date;
      });

      days.push({
        date: dateStr,
        day,
        isToday: dateStr === today,
        hasPrayer: !!prayerLog,
        hasFasting,
        hasEvent,
        prayerMinutes: prayerLog?.duration_minutes || 0,
      });
    }

    return days;
  }, [currentYear, currentMonth, prayerLogs, fastingLogs, spiritualEvents]);

  // Détails du jour sélectionné
  const selectedDayDetails = useMemo(() => {
    if (!selectedDate) return null;

    const prayerLog = prayerLogs.find((log) => log.date === selectedDate);
    const fastingLog = fastingLogs.find(
      (log) => selectedDate >= log.start_date && selectedDate <= log.end_date
    );
    const events = spiritualEvents.filter(
      (event) => selectedDate >= event.start_date && selectedDate <= event.end_date
    );

    return {
      date: selectedDate,
      prayerLog,
      fastingLog,
      events,
    };
  }, [selectedDate, prayerLogs, fastingLogs, spiritualEvents]);

  // Statistiques du mois
  const monthStats = useMemo(() => {
    const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-31`;

    const monthPrayerLogs = prayerLogs.filter(
      (log) => log.date >= monthStart && log.date <= monthEnd
    );

    const totalMinutes = monthPrayerLogs.reduce(
      (sum, log) => sum + (log.duration_minutes || 0),
      0
    );

    const totalDays = monthPrayerLogs.length;

    return {
      totalMinutes,
      totalDays,
      averageMinutes: totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0,
    };
  }, [currentYear, currentMonth, prayerLogs]);

  // Formater la date sélectionnée
  const formatSelectedDate = (dateStr: string) => {
    const date = new Date(dateStr + "T12:00:00");
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.neutral.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mon calendrier</Text>
          <Text style={styles.headerSubtitle}>
            Suivi de ma vie spirituelle
          </Text>
        </View>
        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayButtonText}>Aujourd'hui</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22C55E"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22C55E" />
          </View>
        ) : (
          <>
            {/* Navigation mois */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={goToPreviousMonth}
              >
                <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <TouchableOpacity
                style={styles.navButton}
                onPress={goToNextMonth}
              >
                <Ionicons name="chevron-forward" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Stats du mois */}
            <View style={styles.monthStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{monthStats.totalDays}</Text>
                <Text style={styles.statLabel}>jours</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatDuration(monthStats.totalMinutes)}
                </Text>
                <Text style={styles.statLabel}>total</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {monthStats.averageMinutes} min
                </Text>
                <Text style={styles.statLabel}>moyenne</Text>
              </View>
            </View>

            {/* Légende */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />
                <Text style={styles.legendText}>Prière</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#F59E0B" }]} />
                <Text style={styles.legendText}>Jeûne</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#8B5CF6" }]} />
                <Text style={styles.legendText}>Événement</Text>
              </View>
            </View>

            {/* Calendrier */}
            <ThemedCard variant="default" style={styles.calendarCard}>
              {/* En-têtes des jours */}
              <View style={styles.daysHeader}>
                {DAYS.map((day) => (
                  <View key={day} style={styles.dayHeaderCell}>
                    <Text style={styles.dayHeaderText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Grille des jours */}
              <View style={styles.daysGrid}>
                {calendarDays.map((dayData, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      dayData.isToday && styles.dayCellToday,
                      selectedDate === dayData.date && styles.dayCellSelected,
                    ]}
                    onPress={() => dayData.date && setSelectedDate(dayData.date)}
                    disabled={!dayData.date}
                  >
                    {dayData.day && (
                      <>
                        <Text
                          style={[
                            styles.dayNumber,
                            dayData.isToday && styles.dayNumberToday,
                            selectedDate === dayData.date && styles.dayNumberSelected,
                          ]}
                        >
                          {dayData.day}
                        </Text>
                        
                        {/* Indicateurs */}
                        <View style={styles.indicators}>
                          {dayData.hasPrayer && (
                            <View style={[styles.indicator, { backgroundColor: "#22C55E" }]} />
                          )}
                          {dayData.hasFasting && (
                            <View style={[styles.indicator, { backgroundColor: "#F59E0B" }]} />
                          )}
                          {dayData.hasEvent && (
                            <View style={[styles.indicator, { backgroundColor: "#8B5CF6" }]} />
                          )}
                        </View>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            {/* Détails du jour sélectionné */}
            {selectedDayDetails && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>
                  {formatSelectedDate(selectedDayDetails.date)}
                </Text>

                {/* Prière du jour */}
                {selectedDayDetails.prayerLog ? (
                  <ThemedCard variant="default" style={styles.detailCard}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="hand-left" size={20} color="#22C55E" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Prière</Text>
                      <Text style={styles.detailValue}>
                        {formatDuration(selectedDayDetails.prayerLog.duration_minutes)}
                      </Text>
                      {selectedDayDetails.prayerLog.type && (
                        <Text style={styles.detailMeta}>
                          {selectedDayDetails.prayerLog.type}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  </ThemedCard>
                ) : (
                  <ThemedCard variant="default" style={styles.detailCardEmpty}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="hand-left-outline" size={20} color={COLORS.text.tertiary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabelEmpty}>Pas de prière enregistrée</Text>
                    </View>
                  </ThemedCard>
                )}

                {/* Jeûne du jour */}
                {selectedDayDetails.fastingLog && (
                  <ThemedCard variant="default" style={styles.detailCard}>
                    <View style={[styles.detailIcon, { backgroundColor: "#FEF3C7" }]}>
                      <Ionicons name="restaurant" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Jeûne</Text>
                      <Text style={styles.detailValue}>
                        {selectedDayDetails.fastingLog.title || selectedDayDetails.fastingLog.type}
                      </Text>
                      {selectedDayDetails.fastingLog.intention && (
                        <Text style={styles.detailMeta} numberOfLines={1}>
                          {selectedDayDetails.fastingLog.intention}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
                  </ThemedCard>
                )}

                {/* Événements du jour */}
                {selectedDayDetails.events.map((event) => (
                  <ThemedCard key={event.id} variant="default" style={styles.detailCard}>
                    <View style={[styles.detailIcon, { backgroundColor: "#EDE9FE" }]}>
                      <Ionicons name="calendar" size={20} color="#8B5CF6" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>{event.type}</Text>
                      <Text style={styles.detailValue}>{event.title}</Text>
                      <Text style={styles.detailMeta}>
                        {new Date(event.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} - {new Date(event.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </Text>
                    </View>
                  </ThemedCard>
                ))}

                {/* Aucune activité */}
                {!selectedDayDetails.prayerLog &&
                  !selectedDayDetails.fastingLog &&
                  selectedDayDetails.events.length === 0 && (
                    <View style={styles.noActivity}>
                      <Ionicons name="leaf-outline" size={32} color={COLORS.neutral.border} />
                      <Text style={styles.noActivityText}>
                        Aucune activité ce jour
                      </Text>
                    </View>
                  )}
              </View>
            )}

            {/* Événements à venir */}
            {spiritualEvents.length > 0 && (
              <View style={styles.eventsSection}>
                <Text style={styles.sectionTitle}>Événements spirituels</Text>
                {spiritualEvents.map((event) => (
                  <ThemedCard key={event.id} variant="default" style={styles.eventCard}>
                    <View
                      style={[
                        styles.eventIcon,
                        {
                          backgroundColor:
                            event.type === "Jeûne" ? "#FEF3C7" : "#EDE9FE",
                        },
                      ]}
                    >
                      <Ionicons
                        name={event.type === "Jeûne" ? "restaurant" : "heart"}
                        size={20}
                        color={event.type === "Jeûne" ? "#F59E0B" : "#8B5CF6"}
                      />
                    </View>
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventDate}>
                        Du {new Date(event.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au {new Date(event.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                      </Text>
                      {event.description && (
                        <Text style={styles.eventDescription} numberOfLines={2}>
                          {event.description}
                        </Text>
                      )}
                    </View>
                  </ThemedCard>
                ))}
              </View>
            )}

            <View style={{ height: 100 }} />
          </>
        )}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.8)",
  },
  todayButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  todayButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
  },
  monthTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  monthStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: "#22C55E",
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.neutral.border,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  calendarCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
  },
  daysHeader: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  dayHeaderText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.tertiary,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  dayCellToday: {
    backgroundColor: "#22C55E20",
    borderRadius: BORDER_RADIUS.lg,
  },
  dayCellSelected: {
    backgroundColor: "#22C55E",
    borderRadius: BORDER_RADIUS.lg,
  },
  dayNumber: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  dayNumberToday: {
    color: "#22C55E",
    fontWeight: FONT_WEIGHT.bold,
  },
  dayNumberSelected: {
    color: COLORS.neutral.white,
  },
  indicators: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  detailsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  detailsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textTransform: "capitalize",
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  detailCardEmpty: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    opacity: 0.6,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  detailLabelEmpty: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  detailValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  detailMeta: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  noActivity: {
    alignItems: "center",
    paddingVertical: SPACING.xl,
  },
  noActivityText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.sm,
  },
  eventsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  eventCard: {
    flexDirection: "row",
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  eventDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  eventDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
});