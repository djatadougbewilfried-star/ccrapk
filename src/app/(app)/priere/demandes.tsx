/**
 * Écran Demandes de Prière - Centre Chrétien de Réveil
 * Liste et création de demandes de prière
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
  Switch,
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

// Niveaux d'urgence
const URGENCY_LEVELS = [
  { value: "Normal", label: "Normal", color: "#22C55E" },
  { value: "Urgent", label: "Urgent", color: "#F59E0B" },
  { value: "Critical", label: "Critique", color: "#EF4444" },
];

export default function DemandesPriereScreen() {
  const {
    publicRequests,
    myRequests,
    submitPrayerRequest,
    prayFor,
    markAsAnswered,
    isLoading,
    refresh,
  } = usePrayer();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"community" | "mine">("community");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestimonyModal, setShowTestimonyModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Form states
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("Normal");
  const [isPublic, setIsPublic] = useState(true);
  const [testimony, setTestimony] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rafraîchir
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Soumettre une demande
  const handleSubmitRequest = async () => {
    if (!subject.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un sujet de prière");
      return;
    }

    if (subject.trim().length < 5) {
      Alert.alert("Erreur", "Le sujet doit contenir au moins 5 caractères");
      return;
    }

    setIsSubmitting(true);

    const result = await submitPrayerRequest({
      subject: subject.trim(),
      description: description.trim() || undefined,
      urgency,
      is_public: isPublic,
    });

    setIsSubmitting(false);

    if (result.success) {
      setShowCreateModal(false);
      resetForm();
      Alert.alert(
        "🙏 Demande envoyée",
        isPublic
          ? "Votre demande sera visible après validation par le responsable."
          : "Votre demande confidentielle a été enregistrée."
      );
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }
  };

  // Prier pour quelqu'un
  const handlePrayFor = async (requestId: string) => {
    const result = await prayFor(requestId);
    if (result.success) {
      Alert.alert("🙏 Amen !", "Merci de prier pour ce frère/cette sœur.");
    } else {
      Alert.alert("Info", result.error || "Vous priez déjà pour cette demande");
    }
  };

  // Marquer comme exaucée
  const handleMarkAnswered = async () => {
    if (!selectedRequestId) return;

    setIsSubmitting(true);
    const result = await markAsAnswered(selectedRequestId, testimony.trim() || undefined);
    setIsSubmitting(false);

    if (result.success) {
      setShowTestimonyModal(false);
      setSelectedRequestId(null);
      setTestimony("");
      Alert.alert("🎉 Gloire à Dieu !", "Votre témoignage a été enregistré.");
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setSubject("");
    setDescription("");
    setUrgency("Normal");
    setIsPublic(true);
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  // Obtenir la couleur d'urgence
  const getUrgencyColor = (level: string) => {
    return URGENCY_LEVELS.find((u) => u.value === level)?.color || "#22C55E";
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#EC4899", "#DB2777"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.neutral.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Demandes de prière</Text>
          <Text style={styles.headerSubtitle}>
            Prions les uns pour les autres
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={COLORS.neutral.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "community" && styles.tabActive]}
          onPress={() => setActiveTab("community")}
        >
          <Ionicons
            name="people"
            size={18}
            color={activeTab === "community" ? "#EC4899" : COLORS.text.tertiary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "community" && styles.tabTextActive,
            ]}
          >
            Communauté ({publicRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "mine" && styles.tabActive]}
          onPress={() => setActiveTab("mine")}
        >
          <Ionicons
            name="person"
            size={18}
            color={activeTab === "mine" ? "#EC4899" : COLORS.text.tertiary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "mine" && styles.tabTextActive,
            ]}
          >
            Mes demandes ({myRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EC4899"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EC4899" />
          </View>
        ) : activeTab === "community" ? (
          // Demandes de la communauté
          publicRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={64} color={COLORS.neutral.border} />
              <Text style={styles.emptyText}>Aucune demande pour le moment</Text>
              <Text style={styles.emptySubtext}>
                Soyez le premier à partager un sujet de prière
              </Text>
            </View>
          ) : (
            publicRequests.map((request) => (
              <ThemedCard key={request.id} variant="default" style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestAuthor}>
                    <View style={styles.authorAvatar}>
                      <Ionicons name="person" size={16} color={COLORS.neutral.white} />
                    </View>
                    <Text style={styles.authorName}>
                      {request.profile?.first_name || "Anonyme"}
                    </Text>
                  </View>
                  <View style={styles.requestMeta}>
                    <View
                      style={[
                        styles.urgencyBadge,
                        { backgroundColor: getUrgencyColor(request.urgency) + "20" },
                      ]}
                    >
                      <View
                        style={[
                          styles.urgencyDot,
                          { backgroundColor: getUrgencyColor(request.urgency) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.urgencyText,
                          { color: getUrgencyColor(request.urgency) },
                        ]}
                      >
                        {request.urgency}
                      </Text>
                    </View>
                    <Text style={styles.requestDate}>
                      {formatDate(request.created_at || "")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.requestSubject}>{request.subject}</Text>
                {request.description && (
                  <Text style={styles.requestDescription} numberOfLines={3}>
                    {request.description}
                  </Text>
                )}

                <View style={styles.requestFooter}>
                  <View style={styles.prayerCount}>
                    <Ionicons name="heart" size={16} color="#EC4899" />
                    <Text style={styles.prayerCountText}>
                      {request.prayer_count} personne{request.prayer_count !== 1 ? "s" : ""} prie{request.prayer_count !== 1 ? "nt" : ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.prayButton}
                    onPress={() => handlePrayFor(request.id)}
                  >
                    <Ionicons name="hand-left" size={16} color={COLORS.neutral.white} />
                    <Text style={styles.prayButtonText}>Je prie</Text>
                  </TouchableOpacity>
                </View>
              </ThemedCard>
            ))
          )
        ) : (
          // Mes demandes
          myRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={64} color={COLORS.neutral.border} />
              <Text style={styles.emptyText}>Aucune demande</Text>
              <Text style={styles.emptySubtext}>
                Partagez vos sujets de prière avec la communauté
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createButtonText}>Créer une demande</Text>
              </TouchableOpacity>
            </View>
          ) : (
            myRequests.map((request) => (
              <ThemedCard key={request.id} variant="default" style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.statusBadges}>
                    {!request.is_validated && request.is_public && (
                      <View style={styles.pendingBadge}>
                        <Ionicons name="time" size={12} color="#F59E0B" />
                        <Text style={styles.pendingBadgeText}>En attente</Text>
                      </View>
                    )}
                    {request.is_answered && (
                      <View style={styles.answeredBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                        <Text style={styles.answeredBadgeText}>Exaucée</Text>
                      </View>
                    )}
                    {!request.is_public && (
                      <View style={styles.privateBadge}>
                        <Ionicons name="lock-closed" size={12} color="#8B5CF6" />
                        <Text style={styles.privateBadgeText}>Privée</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.requestDate}>
                    {formatDate(request.created_at || "")}
                  </Text>
                </View>

                <Text style={styles.requestSubject}>{request.subject}</Text>
                {request.description && (
                  <Text style={styles.requestDescription} numberOfLines={3}>
                    {request.description}
                  </Text>
                )}

                {request.is_public && request.is_validated && !request.is_answered && (
                  <View style={styles.requestFooter}>
                    <View style={styles.prayerCount}>
                      <Ionicons name="heart" size={16} color="#EC4899" />
                      <Text style={styles.prayerCountText}>
                        {request.prayer_count} personne{request.prayer_count !== 1 ? "s" : ""}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.answeredButton}
                      onPress={() => {
                        setSelectedRequestId(request.id);
                        setShowTestimonyModal(true);
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="#22C55E" />
                      <Text style={styles.answeredButtonText}>Exaucée !</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {request.is_answered && request.testimony && (
                  <View style={styles.testimonyContainer}>
                    <Text style={styles.testimonyLabel}>Témoignage :</Text>
                    <Text style={styles.testimonyText}>{request.testimony}</Text>
                  </View>
                )}
              </ThemedCard>
            ))
          )
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal Créer une demande */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🙏 Nouvelle demande</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sujet */}
              <Text style={styles.fieldLabel}>Sujet de prière *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Guérison, emploi, famille..."
                placeholderTextColor={COLORS.text.tertiary}
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />

              {/* Description */}
              <Text style={styles.fieldLabel}>Description (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Détaillez votre demande..."
                placeholderTextColor={COLORS.text.tertiary}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
                maxLength={500}
              />

              {/* Urgence */}
              <Text style={styles.fieldLabel}>Niveau d'urgence</Text>
              <View style={styles.urgencyOptions}>
                {URGENCY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.urgencyOption,
                      urgency === level.value && {
                        backgroundColor: level.color + "20",
                        borderColor: level.color,
                      },
                    ]}
                    onPress={() => setUrgency(level.value)}
                  >
                    <View
                      style={[
                        styles.urgencyOptionDot,
                        { backgroundColor: level.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.urgencyOptionText,
                        urgency === level.value && { color: level.color },
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Visibilité */}
              <View style={styles.visibilityRow}>
                <View style={styles.visibilityInfo}>
                  <Text style={styles.visibilityLabel}>Demande publique</Text>
                  <Text style={styles.visibilityHint}>
                    {isPublic
                      ? "Visible par la communauté après validation"
                      : "Visible uniquement par vous et les pasteurs"}
                  </Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ false: COLORS.neutral.border, true: "#EC489980" }}
                  thumbColor={isPublic ? "#EC4899" : COLORS.neutral.white}
                />
              </View>

              {/* Bouton */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitRequest}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={["#EC4899", "#DB2777"]}
                  style={styles.submitButtonGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.neutral.white} />
                  ) : (
                    <>
                      <Ionicons name="send" size={18} color={COLORS.neutral.white} />
                      <Text style={styles.submitButtonText}>Envoyer</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Témoignage */}
      <Modal
        visible={showTestimonyModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTestimonyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎉 Prière exaucée !</Text>
              <TouchableOpacity onPress={() => setShowTestimonyModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.testimonyPrompt}>
              Gloire à Dieu ! Partagez votre témoignage pour encourager la communauté.
            </Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Racontez comment Dieu a répondu..."
              placeholderTextColor={COLORS.text.tertiary}
              multiline
              numberOfLines={5}
              value={testimony}
              onChangeText={setTestimony}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleMarkAnswered}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={["#22C55E", "#16A34A"]}
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.neutral.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.neutral.white} />
                    <Text style={styles.submitButtonText}>Confirmer</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
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
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral.white,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: "#EC489920",
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  tabTextActive: {
    color: "#EC4899",
    fontWeight: FONT_WEIGHT.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xxxl,
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
  },
  createButton: {
    marginTop: SPACING.lg,
    backgroundColor: "#EC4899",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  createButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
  requestCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  requestAuthor: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EC4899",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  authorName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  requestMeta: {
    alignItems: "flex-end",
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  requestDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
  statusBadges: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  pendingBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: "#F59E0B",
    fontWeight: FONT_WEIGHT.medium,
  },
  answeredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  answeredBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: "#22C55E",
    fontWeight: FONT_WEIGHT.medium,
  },
  privateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE9FE",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  privateBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: "#8B5CF6",
    fontWeight: FONT_WEIGHT.medium,
  },
  requestSubject: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  requestDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.borderLight,
  },
  prayerCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  prayerCountText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  prayButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EC4899",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  prayButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
  answeredButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.xs,
  },
  answeredButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: "#22C55E",
  },
  testimonyContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: "#F0FDF4",
    borderRadius: BORDER_RADIUS.md,
  },
  testimonyLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: "#22C55E",
    marginBottom: SPACING.xs,
  },
  testimonyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    fontStyle: "italic",
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  urgencyOptions: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  urgencyOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral.background,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    gap: SPACING.xs,
  },
  urgencyOptionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyOptionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
  },
  visibilityInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  visibilityLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  visibilityHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: 2,
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
  testimonyPrompt: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
});