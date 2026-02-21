/**
 * Écran Détail Formation - Centre Chrétien de Réveil
 * Affiche les détails d'une formation et permet l'inscription
 */

import React, { useState } from "react";
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
import { useFormations, useFormationDetail } from "../../../hooks/useFormations";
import { formatMonth, FormationSession } from "../../../services/formations.service";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";

export default function FormationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getFormationStatus, checkCanEnroll, enroll, requestAccess, refresh } = useFormations();
  const { formation, sessions, modules, upcomingSessions, isLoading } = useFormationDetail(id || "");

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<FormationSession | null>(null);
  const [motivation, setMotivation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statut actuel
  const status = id ? getFormationStatus(id) : "none";

  // Obtenir l'icône
  const getIcon = (icon: string | null): string => {
    const icons: Record<string, string> = {
      school: "school",
      water: "water",
      people: "people",
      globe: "globe",
    };
    return icons[icon || ""] || "book";
  };

  // Ouvrir le modal d'inscription
  const handleEnrollPress = async (session: FormationSession) => {
    if (!formation) return;

    // Vérifier si peut s'inscrire
    const canEnrollResult = await checkCanEnroll(formation);
    
    if (!canEnrollResult.canEnroll) {
      // Si c'est l'École de Mission, proposer de faire une demande
      if (formation.requires_pastor_approval && status !== "access_pending") {
        Alert.alert(
          "Recommandation requise",
          "Cette formation nécessite une recommandation du pasteur. Voulez-vous envoyer une demande ?",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Faire une demande", onPress: () => setShowAccessModal(true) },
          ]
        );
      } else {
        Alert.alert("Inscription impossible", canEnrollResult.reason || "Vous ne pouvez pas vous inscrire");
      }
      return;
    }

    setSelectedSession(session);
    setShowEnrollModal(true);
  };

  // Soumettre l'inscription
  const handleEnrollSubmit = async () => {
    if (!selectedSession || motivation.trim().length < 20) return;

    setIsSubmitting(true);

    const result = await enroll({
      session_id: selectedSession.id,
      motivation: motivation.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowEnrollModal(false);
      setMotivation("");
      Alert.alert(
        "Inscription envoyée ! 📚",
        "Votre demande d'inscription a été transmise au responsable de la formation. Vous serez notifié de sa décision.",
        [{ text: "OK" }]
      );
      await refresh();
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }
  };

  // Soumettre la demande d'accès (École de Mission)
  const handleAccessSubmit = async () => {
    if (!formation || motivation.trim().length < 50) return;

    setIsSubmitting(true);

    const result = await requestAccess({
      formation_id: formation.id,
      motivation: motivation.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowAccessModal(false);
      setMotivation("");
      Alert.alert(
        "Demande envoyée ! 🙏",
        "Votre demande de recommandation a été transmise au pasteur. Vous serez notifié de sa décision.",
        [{ text: "OK" }]
      );
      await refresh();
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }
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

  if (!formation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={COLORS.status.error} />
          <Text style={styles.errorText}>Formation non trouvée</Text>
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
          colors={[formation.color || COLORS.primary.gold, (formation.color || COLORS.primary.gold) + "CC"]}
          style={styles.header}
        >
          {/* Bouton retour */}
          <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.neutral.white} />
          </TouchableOpacity>

          {/* Icône */}
          <View style={styles.headerIcon}>
            <Ionicons
              name={getIcon(formation.icon) as any}
              size={48}
              color={COLORS.neutral.white}
            />
          </View>

          <Text style={styles.headerTitle}>{formation.name}</Text>
          <Text style={styles.headerType}>{formation.type}</Text>

          {/* Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Ionicons name="time" size={14} color={COLORS.neutral.white} />
              <Text style={styles.badgeText}>{formation.duration_months} mois</Text>
            </View>
            {formation.is_mandatory && (
              <View style={[styles.badge, styles.mandatoryBadge]}>
                <Ionicons name="star" size={14} color={COLORS.neutral.white} />
                <Text style={styles.badgeText}>Obligatoire</Text>
              </View>
            )}
            {formation.requires_pastor_approval && (
              <View style={[styles.badge, styles.approvalBadge]}>
                <Ionicons name="key" size={14} color={COLORS.neutral.white} />
                <Text style={styles.badgeText}>Sur recommandation</Text>
              </View>
            )}
          </View>

          {/* Statut utilisateur */}
          {status !== "none" && (
            <View style={styles.statusContainer}>
              {status === "completed" && (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.status.success} />
                  <Text style={[styles.statusText, { color: COLORS.status.success }]}>Formation terminée</Text>
                </View>
              )}
              {status === "in_progress" && (
                <View style={styles.statusBadge}>
                  <Ionicons name="play-circle" size={16} color={COLORS.secondary.blue} />
                  <Text style={[styles.statusText, { color: COLORS.secondary.blue }]}>En cours</Text>
                </View>
              )}
              {(status === "pending" || status === "approved") && (
                <View style={styles.statusBadge}>
                  <Ionicons name="time" size={16} color={COLORS.status.warning} />
                  <Text style={[styles.statusText, { color: COLORS.status.warning }]}>Inscription en attente</Text>
                </View>
              )}
              {status === "access_pending" && (
                <View style={styles.statusBadge}>
                  <Ionicons name="hourglass" size={16} color={COLORS.status.warning} />
                  <Text style={[styles.statusText, { color: COLORS.status.warning }]}>Demande d'accès en attente</Text>
                </View>
              )}
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Description */}
          <ThemedCard variant="default" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>À propos</Text>
            <Text style={styles.descriptionText}>{formation.description}</Text>
          </ThemedCard>

          {/* Pré-requis */}
          {formation.requires_academie && (
            <ThemedCard variant="default" style={styles.sectionCard}>
              <View style={styles.prerequisiteRow}>
                <Ionicons name="information-circle" size={20} color={COLORS.status.warning} />
                <View style={styles.prerequisiteInfo}>
                  <Text style={styles.prerequisiteTitle}>Pré-requis</Text>
                  <Text style={styles.prerequisiteText}>
                    Vous devez être inscrit ou avoir complété l'Académie de Réveil pour accéder à cette formation.
                  </Text>
                </View>
              </View>
            </ThemedCard>
          )}

          {/* Modules */}
          <ThemedCard variant="default" style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Programme ({modules.length} modules)</Text>
            {modules.map((module, index) => (
              <View key={module.id} style={styles.moduleRow}>
                <View style={styles.moduleNumber}>
                  <Text style={styles.moduleNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleName}>{module.name}</Text>
                  {module.description && (
                    <Text style={styles.moduleDescription} numberOfLines={2}>
                      {module.description}
                    </Text>
                  )}
                  <View style={styles.moduleMeta}>
                    {module.duration_weeks && (
                      <Text style={styles.moduleMetaText}>
                        {module.duration_weeks} semaine{module.duration_weeks > 1 ? "s" : ""}
                      </Text>
                    )}
                    {module.estimated_hours && (
                      <Text style={styles.moduleMetaText}>
                        ~{module.estimated_hours}h
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ThemedCard>

          {/* Sessions disponibles */}
          {status === "none" && upcomingSessions.length > 0 && (
            <ThemedCard variant="default" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Sessions disponibles</Text>
              {upcomingSessions.map((session) => (
                <View key={session.id} style={styles.sessionRow}>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionName}>{session.name}</Text>
                    <Text style={styles.sessionDate}>
                      Début : {session.month ? formatMonth(session.month) : ""} {session.year}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.enrollButton}
                    onPress={() => handleEnrollPress(session)}
                  >
                    <Text style={styles.enrollButtonText}>S'inscrire</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ThemedCard>
          )}

          {/* Message si pas de sessions */}
          {status === "none" && upcomingSessions.length === 0 && (
            <ThemedCard variant="default" style={styles.noSessionCard}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.neutral.border} />
              <Text style={styles.noSessionText}>
                Aucune session n'est ouverte pour le moment.
              </Text>
              <Text style={styles.noSessionSubtext}>
                Revenez plus tard ou contactez le responsable des formations.
              </Text>
            </ThemedCard>
          )}

          {/* Demande d'accès pour École de Mission */}
          {formation.requires_pastor_approval && status === "none" && (
            <TouchableOpacity
              style={styles.accessButton}
              onPress={() => setShowAccessModal(true)}
            >
              <LinearGradient
                colors={[COLORS.primary.gold, COLORS.primary.goldDark]}
                style={styles.accessButtonGradient}
              >
                <Ionicons name="key" size={20} color={COLORS.neutral.white} />
                <Text style={styles.accessButtonText}>Demander l'accès au pasteur</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal d'inscription */}
      <Modal
        visible={showEnrollModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEnrollModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Inscription</Text>
              <TouchableOpacity onPress={() => setShowEnrollModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Session sélectionnée */}
              <View style={styles.selectedSession}>
                <Ionicons name="calendar" size={20} color={COLORS.primary.gold} />
                <Text style={styles.selectedSessionText}>
                  {selectedSession?.name}
                </Text>
              </View>

              {/* Motivation */}
              <Text style={styles.fieldLabel}>Pourquoi souhaitez-vous suivre cette formation ? *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Expliquez votre motivation (min. 20 caractères)"
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                numberOfLines={4}
                value={motivation}
                onChangeText={setMotivation}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{motivation.length}/20 min.</Text>

              {/* Bouton */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  motivation.trim().length < 20 && styles.submitButtonDisabled,
                ]}
                onPress={handleEnrollSubmit}
                disabled={motivation.trim().length < 20 || isSubmitting}
              >
                <LinearGradient
                  colors={
                    motivation.trim().length < 20
                      ? [COLORS.neutral.border, COLORS.neutral.border]
                      : [COLORS.primary.gold, COLORS.primary.goldDark]
                  }
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.neutral.white} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neutral.white} />
                      <Text style={styles.submitButtonText}>Confirmer l'inscription</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal demande d'accès (École de Mission) */}
      <Modal
        visible={showAccessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccessModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Demande de recommandation</Text>
              <TouchableOpacity onPress={() => setShowAccessModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.accessInfo}>
                <Ionicons name="information-circle" size={24} color={COLORS.secondary.blue} />
                <Text style={styles.accessInfoText}>
                  L'École de Mission est accessible sur recommandation pastorale. 
                  Votre demande sera examinée par le pasteur qui validera votre appel missionnaire.
                </Text>
              </View>

              {/* Motivation */}
              <Text style={styles.fieldLabel}>Décrivez votre appel et votre motivation *</Text>
              <TextInput
                style={[styles.textArea, { minHeight: 150 }]}
                placeholder="Parlez de votre appel missionnaire, votre parcours spirituel, et pourquoi vous souhaitez suivre cette formation (min. 50 caractères)"
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                numberOfLines={6}
                value={motivation}
                onChangeText={setMotivation}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{motivation.length}/50 min.</Text>

              {/* Bouton */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  motivation.trim().length < 50 && styles.submitButtonDisabled,
                ]}
                onPress={handleAccessSubmit}
                disabled={motivation.trim().length < 50 || isSubmitting}
              >
                <LinearGradient
                  colors={
                    motivation.trim().length < 50
                      ? [COLORS.neutral.border, COLORS.neutral.border]
                      : [COLORS.primary.gold, COLORS.primary.goldDark]
                  }
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.neutral.white} />
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color={COLORS.neutral.white} />
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
  headerType: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.xs,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  mandatoryBadge: {
    backgroundColor: "rgba(239,68,68,0.3)",
  },
  approvalBadge: {
    backgroundColor: "rgba(245,158,11,0.3)",
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHT.medium,
  },
  statusContainer: {
    marginTop: SPACING.md,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  statusText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
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
  prerequisiteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
  },
  prerequisiteInfo: {
    flex: 1,
  },
  prerequisiteTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.status.warning,
  },
  prerequisiteText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 4,
    lineHeight: 20,
  },
  moduleRow: {
    flexDirection: "row",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  moduleNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary.gold + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  moduleNumberText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  moduleDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  moduleMeta: {
    flexDirection: "row",
    marginTop: SPACING.xs,
    gap: SPACING.md,
  },
  moduleMetaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  sessionDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  enrollButton: {
    backgroundColor: COLORS.primary.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  enrollButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
  noSessionCard: {
    alignItems: "center",
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  noSessionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    textAlign: "center",
  },
  noSessionSubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
    textAlign: "center",
  },
  accessButton: {
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  accessButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  accessButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
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
    maxHeight: "80%",
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
  selectedSession: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary.gold + "10",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  selectedSessionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  accessInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.secondary.blue + "10",
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  accessInfoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
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