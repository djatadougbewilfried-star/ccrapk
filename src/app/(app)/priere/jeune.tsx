/**
 * Écran Jeûne - Centre Chrétien de Réveil
 * Enregistrement et suivi des jeûnes
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
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";

// Types de jeûne
const FASTING_TYPES = [
  { value: "Total", label: "Total", description: "Ni nourriture ni eau", icon: "water" },
  { value: "Partiel", label: "Partiel", description: "Eau seulement", icon: "water-outline" },
  { value: "Daniel", label: "Daniel", description: "Légumes et eau", icon: "leaf" },
  { value: "Intermittent", label: "Intermittent", description: "Heures spécifiques", icon: "time" },
];

// Durées prédéfinies
const DURATION_PRESETS = [
  { days: 1, label: "1 jour" },
  { days: 3, label: "3 jours" },
  { days: 7, label: "7 jours" },
  { days: 14, label: "14 jours" },
  { days: 21, label: "21 jours" },
  { days: 40, label: "40 jours" },
];

export default function JeuneScreen() {
  const {
    fastingLogs,
    fastingStats,
    activeEvents,
    logFasting,
    isLoading,
    refresh,
  } = usePrayer();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState("Partiel");
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [intention, setIntention] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rafraîchir
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Soumettre un jeûne
  const handleSubmitFasting = async () => {
    if (!intention.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre intention de jeûne");
      return;
    }

    setIsSubmitting(true);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedDuration - 1);

    const result = await logFasting({
      title: title.trim() || `Jeûne de ${selectedDuration} jour${selectedDuration > 1 ? "s" : ""}`,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      type: selectedType,
      intention: intention.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowCreateModal(false);
      resetForm();
      Alert.alert(
        "🙏 Que Dieu vous fortifie !",
        `Votre jeûne de ${selectedDuration} jour${selectedDuration > 1 ? "s" : ""} a été enregistré.`
      );
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setTitle("");
    setSelectedType("Partiel");
    setSelectedDuration(1);
    setIntention("");
  };

  // Formater la date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  // Calculer la progression d'un jeûne
  const calculateProgress = (startDate: string, endDate: string, completedDays: number | null) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const completed = completedDays || 0;
    return Math.min(100, Math.round((completed / totalDays) * 100));
  };

  // Jeûnes actifs (en cours)
  const activeFasts = fastingLogs.filter((log) => {
    const today = new Date().toISOString().split("T")[0];
    return log.start_date <= today && log.end_date >= today && log.status !== "completed";
  });

  // Jeûnes terminés
  const completedFasts = fastingLogs.filter(
    (log) => log.status === "completed" || log.end_date < new Date().toISOString().split("T")[0]
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#F59E0B", "#D97706"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.neutral.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mes jeûnes</Text>
          <Text style={styles.headerSubtitle}>
            Discipline spirituelle
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.neutral.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#F59E0B"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>
        ) : (
          <View style={styles.content}>
            {/* Statistiques */}
            <View style={styles.statsRow}>
              <ThemedCard variant="default" style={styles.statCard}>
                <Ionicons name="flame" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>{fastingStats?.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>Jours consécutifs</Text>
              </ThemedCard>

              <ThemedCard variant="default" style={styles.statCard}>
                <Ionicons name="calendar" size={24} color="#22C55E" />
                <Text style={styles.statValue}>{fastingStats?.totalDaysThisMonth || 0}</Text>
                <Text style={styles.statLabel}>Ce mois</Text>
              </ThemedCard>

              <ThemedCard variant="default" style={styles.statCard}>
                <Ionicons name="trophy" size={24} color="#8B5CF6" />
                <Text style={styles.statValue}>{fastingStats?.totalDaysAllTime || 0}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </ThemedCard>
            </View>

            {/* Événements collectifs */}
            {activeEvents.filter((e) => e.type === "Jeûne").length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔥 Jeûnes collectifs en cours</Text>
                {activeEvents
                  .filter((e) => e.type === "Jeûne")
                  .map((event) => (
                    <ThemedCard key={event.id} variant="default" style={styles.eventCard}>
                      <View style={styles.eventHeader}>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <View style={styles.eventBadge}>
                          <Text style={styles.eventBadgeText}>Collectif</Text>
                        </View>
                      </View>
                      <Text style={styles.eventDate}>
                        Du {formatDate(event.start_date)} au {formatDate(event.end_date)}
                      </Text>
                      {event.description && (
                        <Text style={styles.eventDescription}>{event.description}</Text>
                      )}
                      <TouchableOpacity
                        style={styles.joinButton}
                        onPress={() => {
                          setIntention(event.title);
                          setShowCreateModal(true);
                        }}
                      >
                        <Ionicons name="hand-left" size={16} color="#F59E0B" />
                        <Text style={styles.joinButtonText}>Participer</Text>
                      </TouchableOpacity>
                    </ThemedCard>
                  ))}
              </View>
            )}

            {/* Jeûnes en cours */}
            {activeFasts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⏳ En cours</Text>
                {activeFasts.map((fast) => {
                  const progress = calculateProgress(
                    fast.start_date,
                    fast.end_date,
                    fast.completed_days
                  );
                  return (
                    <ThemedCard key={fast.id} variant="default" style={styles.fastCard}>
                      <View style={styles.fastHeader}>
                        <View style={styles.fastTypeIcon}>
                          <Ionicons name="restaurant" size={20} color="#F59E0B" />
                        </View>
                        <View style={styles.fastInfo}>
                          <Text style={styles.fastTitle}>
                            {fast.title || `Jeûne ${fast.type}`}
                          </Text>
                          <Text style={styles.fastDates}>
                            {formatDate(fast.start_date)} - {formatDate(fast.end_date)}
                          </Text>
                        </View>
                        <View style={styles.fastProgress}>
                          <Text style={styles.fastProgressText}>{progress}%</Text>
                        </View>
                      </View>

                      <View style={styles.progressBar}>
                        <View
                          style={[styles.progressFill, { width: `${progress}%` }]}
                        />
                      </View>

                      {fast.intention && (
                        <Text style={styles.fastIntention} numberOfLines={2}>
                          💭 {fast.intention}
                        </Text>
                      )}
                    </ThemedCard>
                  );
                })}
              </View>
            )}

            {/* Bouton créer */}
            {activeFasts.length === 0 && (
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => setShowCreateModal(true)}
              >
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  style={styles.startButtonGradient}
                >
                  <Ionicons name="add-circle" size={24} color={COLORS.neutral.white} />
                  <Text style={styles.startButtonText}>Commencer un jeûne</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Historique */}
            {completedFasts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📜 Historique</Text>
                {completedFasts.slice(0, 5).map((fast) => (
                  <ThemedCard key={fast.id} variant="default" style={styles.historyCard}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                    </View>
                    <View style={styles.historyInfo}>
                      <Text style={styles.historyTitle}>
                        {fast.title || `Jeûne ${fast.type}`}
                      </Text>
                      <Text style={styles.historyDates}>
                        {formatDate(fast.start_date)} - {formatDate(fast.end_date)}
                      </Text>
                    </View>
                    <Text style={styles.historyDays}>
                      {fast.completed_days || 0} j
                    </Text>
                  </ThemedCard>
                ))}
              </View>
            )}

            {/* Vide */}
            {fastingLogs.length === 0 && activeEvents.filter((e) => e.type === "Jeûne").length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons name="restaurant-outline" size={64} color={COLORS.neutral.border} />
                <Text style={styles.emptyText}>Aucun jeûne enregistré</Text>
                <Text style={styles.emptySubtext}>
                  Commencez votre premier jeûne pour suivre votre progression
                </Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>

      {/* Modal Créer un jeûne */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🍽️ Nouveau jeûne</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Titre (optionnel) */}
              <Text style={styles.fieldLabel}>Titre (optionnel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Jeûne de début d'année"
                placeholderTextColor={COLORS.text.tertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              {/* Type de jeûne */}
              <Text style={styles.fieldLabel}>Type de jeûne</Text>
              <View style={styles.typeGrid}>
                {FASTING_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      selectedType === type.value && styles.typeOptionSelected,
                    ]}
                    onPress={() => setSelectedType(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={24}
                      color={
                        selectedType === type.value ? "#F59E0B" : COLORS.text.tertiary
                      }
                    />
                    <Text
                      style={[
                        styles.typeLabel,
                        selectedType === type.value && styles.typeLabelSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                    <Text style={styles.typeDescription}>{type.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Durée */}
              <Text style={styles.fieldLabel}>Durée</Text>
              <View style={styles.durationGrid}>
                {DURATION_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.days}
                    style={[
                      styles.durationChip,
                      selectedDuration === preset.days && styles.durationChipSelected,
                    ]}
                    onPress={() => setSelectedDuration(preset.days)}
                  >
                    <Text
                      style={[
                        styles.durationChipText,
                        selectedDuration === preset.days && styles.durationChipTextSelected,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Intention */}
              <Text style={styles.fieldLabel}>Intention de jeûne *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Pourquoi jeûnez-vous ? (guérison, percée, direction...)"
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                numberOfLines={3}
                value={intention}
                onChangeText={setIntention}
                textAlignVertical="top"
                maxLength={300}
              />

              {/* Récapitulatif */}
              <View style={styles.summary}>
                <Text style={styles.summaryTitle}>Récapitulatif</Text>
                <Text style={styles.summaryText}>
                  Jeûne {selectedType.toLowerCase()} de {selectedDuration} jour
                  {selectedDuration > 1 ? "s" : ""} à partir d'aujourd'hui
                </Text>
              </View>

              {/* Bouton */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitFasting}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={["#F59E0B", "#D97706"]}
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.neutral.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color={COLORS.neutral.white} />
                      <Text style={styles.submitButtonText}>Commencer</Text>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  content: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
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
    textAlign: "center",
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
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  eventTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    flex: 1,
  },
  eventBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  eventBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: "#F59E0B",
  },
  eventDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  eventDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  joinButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: "#F59E0B",
  },
  fastCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  fastHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  fastTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  fastInfo: {
    flex: 1,
  },
  fastTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  fastDates: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  fastProgress: {
    alignItems: "flex-end",
  },
  fastProgressText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: "#F59E0B",
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 3,
  },
  fastIntention: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    fontStyle: "italic",
  },
  startButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    marginVertical: SPACING.lg,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  startButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyIcon: {
    marginRight: SPACING.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  historyDates: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  historyDays: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: "#22C55E",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    textAlign: "center",
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },

  // Modal
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
    maxHeight: "90%",
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
  input: {
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  typeOption: {
    width: "48%",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral.background,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    alignItems: "center",
  },
  typeOptionSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  typeLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING.xs,
  },
  typeLabelSelected: {
    color: "#F59E0B",
  },
  typeDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    textAlign: "center",
    marginTop: 2,
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
    backgroundColor: "#F59E0B",
    borderColor: "#F59E0B",
  },
  durationChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  durationChipTextSelected: {
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHT.semibold,
  },
  summary: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: "#FEF3C7",
    borderRadius: BORDER_RADIUS.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: "#F59E0B",
    marginBottom: SPACING.xs,
  },
  summaryText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
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
