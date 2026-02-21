/**
 * Écran Prière - Centre Chrétien de Réveil
 * Dashboard de prière et jeûne avec calendrier
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
  Modal,
  TextInput,
  Alert,
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

// Types de prière disponibles
const PRAYER_TYPES = [
  { value: "Louange", label: "Louange", icon: "musical-notes" },
  { value: "Intercession", label: "Intercession", icon: "people" },
  { value: "Supplication", label: "Supplication", icon: "hand-left" },
  { value: "Méditation", label: "Méditation", icon: "leaf" },
  { value: "Action de grâce", label: "Action de grâce", icon: "heart" },
  { value: "Autre", label: "Autre", icon: "ellipsis-horizontal" },
];

// Durées prédéfinies
const DURATION_PRESETS = [5, 10, 15, 20, 30, 45, 60, 90];

export default function PriereScreen() {
  const {
    prayerStats,
    fastingStats,
    todayProgress,
    todayMinutes,
    dailyGoalMinutes,
    activeEvents,
    userBadges,
    getNextPrayerStreakBadge,
    daysToNextBadge,
    logPrayer,
    isLoading,
    refresh,
  } = usePrayer();

  const [refreshing, setRefreshing] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  
  // Form states
  const [selectedDuration, setSelectedDuration] = useState(15);
  const [customDuration, setCustomDuration] = useState("");
  const [selectedType, setSelectedType] = useState("Louange");
  const [prayerNotes, setPrayerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rafraîchir
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Soumettre la prière
  const handleSubmitPrayer = async () => {
    const duration = customDuration ? parseInt(customDuration) : selectedDuration;
    
    if (!duration || duration <= 0) {
      Alert.alert("Erreur", "Veuillez sélectionner une durée");
      return;
    }

    setIsSubmitting(true);

    const result = await logPrayer({
      date: new Date().toISOString().split("T")[0],
      duration_minutes: duration,
      type: selectedType,
      notes: prayerNotes || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowPrayerModal(false);
      setCustomDuration("");
      setPrayerNotes("");
      Alert.alert("🙏 Amen !", "Votre temps de prière a été enregistré.");
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }
  };

  // Prochain badge
  const nextBadge = getNextPrayerStreakBadge();
  const daysLeft = daysToNextBadge();

  // Calculer la circonférence du cercle de progression
  const circleSize = 140;
  const strokeWidth = 12;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.gold}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={["#8B5CF6", "#6D28D9"]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Ma Vie Spirituelle</Text>
          <Text style={styles.headerSubtitle}>Prière & Jeûne</Text>

          {/* Cercle de progression */}
          <View style={styles.progressContainer}>
            <View style={styles.circleContainer}>
              <View style={styles.svgContainer}>
                {/* Cercle de fond */}
                <View
                  style={[
                    styles.circleBackground,
                    {
                      width: circleSize,
                      height: circleSize,
                      borderRadius: circleSize / 2,
                      borderWidth: strokeWidth,
                    },
                  ]}
                />
                {/* Cercle de progression (simulé) */}
                <View
                  style={[
                    styles.circleProgress,
                    {
                      width: circleSize,
                      height: circleSize,
                      borderRadius: circleSize / 2,
                      borderWidth: strokeWidth,
                      borderColor: COLORS.primary.gold,
                      borderTopColor: todayProgress >= 25 ? COLORS.primary.gold : "transparent",
                      borderRightColor: todayProgress >= 50 ? COLORS.primary.gold : "transparent",
                      borderBottomColor: todayProgress >= 75 ? COLORS.primary.gold : "transparent",
                      borderLeftColor: todayProgress >= 100 ? COLORS.primary.gold : "transparent",
                      transform: [{ rotate: "-45deg" }],
                    },
                  ]}
                />
              </View>
              <View style={styles.circleContent}>
                <Text style={styles.progressPercent}>{todayProgress}%</Text>
                <Text style={styles.progressLabel}>Objectif</Text>
              </View>
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressMinutes}>
                {formatDuration(todayMinutes)} / {formatDuration(dailyGoalMinutes)}
              </Text>
              <TouchableOpacity
                style={styles.prayButton}
                onPress={() => setShowPrayerModal(true)}
              >
                <Ionicons name="add" size={20} color={COLORS.neutral.white} />
                <Text style={styles.prayButtonText}>J'ai prié</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* État de chargement */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary.gold} />
            </View>
          )}

          {/* Streak actuel */}
          {!isLoading && (
            <ThemedCard variant="default" style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <View style={styles.streakIcon}>
                  <Ionicons name="flame" size={24} color="#F59E0B" />
                </View>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakValue}>
                    {prayerStats?.currentStreak || 0} jours
                  </Text>
                  <Text style={styles.streakLabel}>Série actuelle</Text>
                </View>
                <View style={styles.streakBest}>
                  <Text style={styles.streakBestValue}>
                    🏆 {prayerStats?.longestStreak || 0}
                  </Text>
                  <Text style={styles.streakBestLabel}>Record</Text>
                </View>
              </View>

              {/* Prochain badge */}
              {nextBadge && (
                <View style={styles.nextBadgeContainer}>
                  <View style={styles.nextBadgeProgress}>
                    <View
                      style={[
                        styles.nextBadgeProgressFill,
                        {
                          width: `${Math.min(
                            100,
                            ((prayerStats?.currentStreak || 0) / nextBadge.requirement_value) * 100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.nextBadgeText}>
                    🎯 Encore {daysLeft} jours pour "{nextBadge.name}"
                  </Text>
                </View>
              )}
            </ThemedCard>
          )}

          {/* Statistiques */}
          {!isLoading && (
            <View style={styles.statsGrid}>
              <ThemedCard variant="default" style={styles.statCard}>
                <Ionicons name="time" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>
                  {formatDuration(prayerStats?.totalMinutesThisMonth || 0)}
                </Text>
                <Text style={styles.statLabel}>Ce mois</Text>
              </ThemedCard>

              <ThemedCard variant="default" style={styles.statCard}>
                <Ionicons name="calendar" size={24} color="#22C55E" />
                <Text style={styles.statValue}>
                  {prayerStats?.totalDaysThisMonth || 0}
                </Text>
                <Text style={styles.statLabel}>Jours ce mois</Text>
              </ThemedCard>

              <ThemedCard variant="default" style={styles.statCard}>
                <Ionicons name="restaurant" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>
                  {fastingStats?.totalDaysThisMonth || 0}
                </Text>
                <Text style={styles.statLabel}>Jours de jeûne</Text>
              </ThemedCard>

              <ThemedCard variant="default" style={styles.statCard}>
                <Ionicons name="ribbon" size={24} color="#EC4899" />
                <Text style={styles.statValue}>{userBadges.length}</Text>
                <Text style={styles.statLabel}>Badges</Text>
              </ThemedCard>
            </View>
          )}

          {/* Événements en cours */}
          {!isLoading && activeEvents.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 En ce moment</Text>
              {activeEvents.map((event) => (
                <ThemedCard key={event.id} variant="default" style={styles.eventCard}>
                  <View style={styles.eventIcon}>
                    <Ionicons
                      name={event.type === "Jeûne" ? "restaurant" : "heart"}
                      size={20}
                      color={COLORS.neutral.white}
                    />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>
                      Jusqu'au {new Date(event.end_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.joinEventButton}
                    onPress={() => router.push("/(app)/priere/jeune")}
                  >
                    <Text style={styles.joinEventText}>Participer</Text>
                  </TouchableOpacity>
                </ThemedCard>
              ))}
            </View>
          )}

          {/* Actions rapides */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => setShowPrayerModal(true)}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="hand-left" size={28} color={COLORS.neutral.white} />
                  <Text style={styles.actionText}>Enregistrer{"\n"}une prière</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/(app)/priere/jeune")}
              >
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="restaurant" size={28} color={COLORS.neutral.white} />
                  <Text style={styles.actionText}>Commencer{"\n"}un jeûne</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/(app)/priere/demandes")}
              >
                <LinearGradient
                  colors={["#EC4899", "#DB2777"]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="heart" size={28} color={COLORS.neutral.white} />
                  <Text style={styles.actionText}>Demandes{"\n"}de prière</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/(app)/priere/calendrier")}
              >
                <LinearGradient
                  colors={["#22C55E", "#16A34A"]}
                  style={styles.actionGradient}
                >
                  <Ionicons name="calendar" size={28} color={COLORS.neutral.white} />
                  <Text style={styles.actionText}>Mon{"\n"}calendrier</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Badges obtenus */}
          {!isLoading && userBadges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mes badges</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesScroll}
              >
                {userBadges.map((ub) => (
                  <View key={ub.id} style={styles.badgeItem}>
                    <View
                      style={[
                        styles.badgeIcon,
                        { backgroundColor: ub.badge?.color || COLORS.primary.gold },
                      ]}
                    >
                      <Ionicons
                        name={(ub.badge?.icon as any) || "ribbon"}
                        size={24}
                        color={COLORS.neutral.white}
                      />
                    </View>
                    <Text style={styles.badgeName} numberOfLines={2}>
                      {ub.badge?.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Modal Enregistrer Prière */}
      <Modal
        visible={showPrayerModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrayerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🙏 Enregistrer ma prière</Text>
              <TouchableOpacity onPress={() => setShowPrayerModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Durée */}
              <Text style={styles.fieldLabel}>Durée</Text>
              <View style={styles.durationGrid}>
                {DURATION_PRESETS.map((duration) => (
                  <TouchableOpacity
                    key={duration}
                    style={[
                      styles.durationChip,
                      selectedDuration === duration && !customDuration && styles.durationChipSelected,
                    ]}
                    onPress={() => {
                      setSelectedDuration(duration);
                      setCustomDuration("");
                    }}
                  >
                    <Text
                      style={[
                        styles.durationChipText,
                        selectedDuration === duration && !customDuration && styles.durationChipTextSelected,
                      ]}
                    >
                      {duration} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Durée personnalisée */}
              <View style={styles.customDurationRow}>
                <Text style={styles.customDurationLabel}>ou personnalisé :</Text>
                <TextInput
                  style={styles.customDurationInput}
                  placeholder="Ex: 25"
                  placeholderTextColor={COLORS.text.tertiary}
                  keyboardType="numeric"
                  value={customDuration}
                  onChangeText={(text) => {
                    setCustomDuration(text.replace(/[^0-9]/g, ""));
                  }}
                />
                <Text style={styles.customDurationUnit}>min</Text>
              </View>

              {/* Type de prière */}
              <Text style={styles.fieldLabel}>Type de prière (optionnel)</Text>
              <View style={styles.typeGrid}>
                {PRAYER_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeChip,
                      selectedType === type.value && styles.typeChipSelected,
                    ]}
                    onPress={() => setSelectedType(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={16}
                      color={
                        selectedType === type.value
                          ? COLORS.neutral.white
                          : COLORS.text.secondary
                      }
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        selectedType === type.value && styles.typeChipTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes */}
              <Text style={styles.fieldLabel}>Notes (optionnel)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Ce que Dieu vous a dit, sujets de prière..."
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                numberOfLines={3}
                value={prayerNotes}
                onChangeText={setPrayerNotes}
                textAlignVertical="top"
              />

              {/* Bouton */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitPrayer}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#6D28D9"]}
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.neutral.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neutral.white} />
                      <Text style={styles.submitButtonText}>Enregistrer</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: SPACING.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.xs,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  circleContainer: {
    position: "relative",
    width: 140,
    height: 140,
  },
  svgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  circleBackground: {
    position: "absolute",
    borderColor: "rgba(255,255,255,0.2)",
  },
  circleProgress: {
    position: "absolute",
  },
  circleContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  progressPercent: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  progressLabel: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.8)",
  },
  progressInfo: {
    flex: 1,
    marginLeft: SPACING.xl,
  },
  progressMinutes: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.md,
  },
  prayButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: "flex-start",
    gap: SPACING.xs,
  },
  prayButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  streakCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  streakLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  streakBest: {
    alignItems: "flex-end",
  },
  streakBestValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  streakBestLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  nextBadgeContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.borderLight,
  },
  nextBadgeProgress: {
    height: 6,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  nextBadgeProgressFill: {
    height: "100%",
    backgroundColor: COLORS.primary.gold,
    borderRadius: 3,
  },
  nextBadgeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    width: "48%",
    padding: SPACING.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.sm,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  eventDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  joinEventButton: {
    backgroundColor: COLORS.primary.gold + "20",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  joinEventText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary.gold,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  actionCard: {
    width: "48%",
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  actionGradient: {
    padding: SPACING.lg,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
  },
  actionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
  badgesScroll: {
    paddingRight: SPACING.xl,
  },
  badgeItem: {
    alignItems: "center",
    marginRight: SPACING.lg,
    width: 70,
  },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  badgeName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.secondary,
    textAlign: "center",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.neutral.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.xl,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  durationChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral.background,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  durationChipSelected: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  durationChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  durationChipTextSelected: {
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  customDurationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  customDurationLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  customDurationInput: {
    width: 60,
    height: 40,
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    textAlign: "center",
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  customDurationUnit: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral.background,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    gap: SPACING.xs,
  },
  typeChipSelected: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  typeChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  typeChipTextSelected: {
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  notesInput: {
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  submitButton: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
});