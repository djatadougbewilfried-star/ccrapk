/**
 * Écran Détail Département - Centre Chrétien de Réveil
 * Affiche les détails d'un département et permet de rejoindre
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useDepartments } from "../../../hooks/useDepartments";
import {
  getDepartmentById,
  getDepartmentMembers,
  getDepartmentMemberCount,
  Department,
  DepartmentMember,
} from "../../../services/departments.service";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";

// Jours disponibles
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const SLOTS = ["Matin", "Après-midi", "Soir"];

export default function DepartementDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    getDepartmentStatus,
    isMember,
    requestToJoin,
    cancelRequest,
    userRequests,
    remainingSlots,
    refresh,
  } = useDepartments();

  const [department, setDepartment] = useState<Department | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulaire de demande
  const [motivation, setMotivation] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const [deptData, count] = await Promise.all([
          getDepartmentById(id),
          getDepartmentMemberCount(id),
        ]);

        setDepartment(deptData);
        setMemberCount(count);

        // Charger les membres si l'utilisateur est membre
        if (deptData) {
          const status = getDepartmentStatus(id);
          if (status === "member") {
            const membersData = await getDepartmentMembers(id);
            setMembers(membersData);
          }
        }
      } catch (err) {
        console.error("Erreur chargement département:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Obtenir l'icône
  const getIcon = (icon: string | null): string => {
    const icons: Record<string, string> = {
      door: "enter", shield: "shield", "hand-right": "hand-right",
      people: "people", clipboard: "clipboard", call: "call",
      happy: "happy", home: "home", megaphone: "megaphone",
      heart: "heart", sparkles: "sparkles", wine: "wine",
      "color-palette": "color-palette", body: "body", storefront: "storefront",
      business: "business", calculator: "calculator", "stats-chart": "stats-chart",
      brush: "brush", settings: "settings", "musical-notes": "musical-notes",
      "musical-note": "musical-note",
    };
    return icons[icon || ""] || "briefcase";
  };

  // Statut actuel
  const status = id ? getDepartmentStatus(id) : "none";
  const currentRequest = userRequests.find((r) => r.department_id === id);

  // Toggle jour
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Toggle créneau
  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Valider le formulaire
  const isFormValid = () => {
    return (
      motivation.trim().length >= 20 &&
      selectedDays.length > 0 &&
      selectedSlots.length > 0 &&
      acceptedRules &&
      acceptedData
    );
  };

  // Soumettre la demande
  const handleSubmit = async () => {
    if (!isFormValid() || !id) return;

    setIsSubmitting(true);

    const result = await requestToJoin({
      department_id: id,
      motivation: motivation.trim(),
      availability: {
        days: selectedDays,
        slots: selectedSlots,
      },
      accepted_rules: acceptedRules,
      accepted_data_processing: acceptedData,
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowJoinModal(false);
      Alert.alert(
        "Demande envoyée ! 🙏",
        "Votre demande a été transmise au responsable du département. Vous serez notifié de sa décision.",
        [{ text: "OK" }]
      );
      // Reset form
      setMotivation("");
      setSelectedDays([]);
      setSelectedSlots([]);
      setAcceptedRules(false);
      setAcceptedData(false);
      await refresh();
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }
  };

  // Annuler la demande
  const handleCancelRequest = () => {
    if (!currentRequest) return;

    Alert.alert(
      "Annuler la demande",
      "Voulez-vous vraiment annuler votre demande d'adhésion ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            const result = await cancelRequest(currentRequest.id);
            if (result.success) {
              Alert.alert("Demande annulée", "Votre demande a été annulée.");
              await refresh();
            } else {
              Alert.alert("Erreur", result.error || "Une erreur est survenue");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (!department) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.status.error} />
          <Text style={styles.errorText}>Département non trouvé</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[department.color || COLORS.primary.gold, (department.color || COLORS.primary.gold) + "CC"]}
          style={styles.header}
        >
          {/* Bouton retour */}
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.neutral.white} />
          </TouchableOpacity>

          {/* Icône département */}
          <View style={styles.headerIcon}>
            <Ionicons
              name={getIcon(department.icon) as any}
              size={48}
              color={COLORS.neutral.white}
            />
          </View>

          <Text style={styles.headerTitle}>{department.name}</Text>
          <Text style={styles.headerMinistere}>
            Ministère {department.ministere_name === "Direction des Cultes" ? "de la " : "de la "}
            {department.ministere_name}
          </Text>

          {/* Badge statut */}
          {status === "member" && (
            <View style={styles.headerBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.neutral.white} />
              <Text style={styles.headerBadgeText}>Vous êtes membre</Text>
            </View>
          )}
          {status === "pending" && (
            <View style={[styles.headerBadge, styles.pendingHeaderBadge]}>
              <Ionicons name="time" size={16} color={COLORS.neutral.white} />
              <Text style={styles.headerBadgeText}>Demande en attente</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Statistiques */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{memberCount}</Text>
              <Text style={styles.statLabel}>Serviteurs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {department.requires_academie ? "Oui" : "Non"}
              </Text>
              <Text style={styles.statLabel}>Académie requise</Text>
            </View>
          </View>

          {/* Description */}
          <ThemedCard variant="default" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Mission</Text>
            <Text style={styles.descriptionText}>
              {department.description || "Description non disponible"}
            </Text>
          </ThemedCard>

          {/* Pré-requis */}
          {department.requirements && (
            <ThemedCard variant="default" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Pré-requis</Text>
              <Text style={styles.requirementsText}>{department.requirements}</Text>
            </ThemedCard>
          )}

          {/* Liste des membres (si membre) */}
          {status === "member" && members.length > 0 && (
            <ThemedCard variant="default" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Membres ({members.length})</Text>
              {members.slice(0, 5).map((member) => (
                <View key={member.id} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Ionicons name="person" size={20} color={COLORS.text.tertiary} />
                  </View>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>
                      {member.profile?.first_name} {member.profile?.last_name}
                    </Text>
                    <Text style={styles.memberRole}>{member.role}</Text>
                  </View>
                </View>
              ))}
              {members.length > 5 && (
                <Text style={styles.moreMembers}>
                  +{members.length - 5} autres membres
                </Text>
              )}
            </ThemedCard>
          )}

          {/* Bouton d'action */}
          {status === "none" && (
            <TouchableOpacity
              style={[
                styles.joinButton,
                remainingSlots <= 0 && styles.joinButtonDisabled,
              ]}
              onPress={() => setShowJoinModal(true)}
              disabled={remainingSlots <= 0}
            >
              <LinearGradient
                colors={
                  remainingSlots <= 0
                    ? [COLORS.neutral.border, COLORS.neutral.border]
                    : [COLORS.primary.gold, COLORS.primary.goldDark]
                }
                style={styles.joinButtonGradient}
              >
                <Ionicons name="add-circle" size={20} color={COLORS.neutral.white} />
                <Text style={styles.joinButtonText}>
                  {remainingSlots <= 0
                    ? "Limite de 5 départements atteinte"
                    : "Demander à rejoindre"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {status === "pending" && (
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRequest}>
              <Ionicons name="close-circle" size={20} color={COLORS.status.error} />
              <Text style={styles.cancelButtonText}>Annuler ma demande</Text>
            </TouchableOpacity>
          )}

          {status === "rejected" && (
            <ThemedCard variant="default" style={styles.rejectedCard}>
              <Ionicons name="close-circle" size={24} color={COLORS.status.error} />
              <Text style={styles.rejectedTitle}>Demande refusée</Text>
              {currentRequest?.rejection_reason && (
                <Text style={styles.rejectedReason}>
                  Motif : {currentRequest.rejection_reason}
                </Text>
              )}
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setShowJoinModal(true)}
              >
                <Text style={styles.retryButtonText}>Faire une nouvelle demande</Text>
              </TouchableOpacity>
            </ThemedCard>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de demande d'adhésion */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rejoindre {department.name}</Text>
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Motivation */}
              <Text style={styles.fieldLabel}>Motivation *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Pourquoi souhaitez-vous rejoindre ce département ? (min. 20 caractères)"
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                numberOfLines={4}
                value={motivation}
                onChangeText={setMotivation}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{motivation.length}/20 min.</Text>

              {/* Disponibilités - Jours */}
              <Text style={styles.fieldLabel}>Disponibilités - Jours *</Text>
              <View style={styles.chipsContainer}>
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.chip,
                      selectedDays.includes(day) && styles.chipSelected,
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedDays.includes(day) && styles.chipTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Disponibilités - Créneaux */}
              <Text style={styles.fieldLabel}>Disponibilités - Créneaux *</Text>
              <View style={styles.chipsContainer}>
                {SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.chip,
                      selectedSlots.includes(slot) && styles.chipSelected,
                    ]}
                    onPress={() => toggleSlot(slot)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedSlots.includes(slot) && styles.chipTextSelected,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Acceptation des règles */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAcceptedRules(!acceptedRules)}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedRules && styles.checkboxChecked,
                  ]}
                >
                  {acceptedRules && (
                    <Ionicons name="checkmark" size={14} color={COLORS.neutral.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  J'accepte les règles et le protocole du département *
                </Text>
              </TouchableOpacity>

              {/* Consentement données */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAcceptedData(!acceptedData)}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedData && styles.checkboxChecked,
                  ]}
                >
                  {acceptedData && (
                    <Ionicons name="checkmark" size={14} color={COLORS.neutral.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  J'autorise le traitement de mes données pour la gestion du département *
                </Text>
              </TouchableOpacity>

              {/* Bouton soumettre */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !isFormValid() && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
              >
                <LinearGradient
                  colors={
                    !isFormValid()
                      ? [COLORS.neutral.border, COLORS.neutral.border]
                      : [COLORS.primary.gold, COLORS.primary.goldDark]
                  }
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.neutral.white} />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color={COLORS.neutral.white} />
                      <Text style={styles.submitButtonText}>Envoyer ma demande</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
  },
  backButton: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary.gold,
    borderRadius: BORDER_RADIUS.lg,
  },
  backButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "center",
  },
  backIcon: {
    position: "absolute",
    top: SPACING.xl,
    left: SPACING.xl,
    zIndex: 1,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
    marginTop: SPACING.lg,
    textAlign: "center",
  },
  headerMinistere: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.xs,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  pendingHeaderBadge: {
    backgroundColor: "rgba(255,193,7,0.3)",
  },
  headerBadgeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.neutral.white,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.neutral.border,
    marginHorizontal: SPACING.lg,
  },
  sectionCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  descriptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  requirementsText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  memberRole: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  moreMembers: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary.gold,
    textAlign: "center",
    marginTop: SPACING.md,
  },
  joinButton: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  joinButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    marginTop: SPACING.lg,
    backgroundColor: COLORS.status.error + "10",
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.status.error + "30",
    gap: SPACING.sm,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.status.error,
  },
  rejectedCard: {
    alignItems: "center",
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  rejectedTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.status.error,
    marginTop: SPACING.md,
  },
  rejectedReason: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary.gold,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
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
    flex: 1,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  textArea: {
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  charCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    textAlign: "right",
    marginTop: SPACING.xs,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.background,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primary.gold,
    borderColor: COLORS.primary.gold,
  },
  chipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  chipTextSelected: {
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHT.medium,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary.gold,
    borderColor: COLORS.primary.gold,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
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