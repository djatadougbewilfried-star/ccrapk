/**
 * Écran Dons/Finances - Centre Chrétien de Réveil
 * Permet de faire des dons et voir l'historique
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Switch,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useDonations } from "../../../hooks/useDonations";
import { useUserStore } from "../../../stores/userStore";
import { DonationType } from "../../../services/donations.service";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";

type PaymentMethod = "mtn" | "orange" | "wave";

export default function FinancesScreen() {
  const { user } = useUserStore();
  const {
    donationTypesByCategory,
    donations,
    stats,
    isLoading,
    makeDonation,
    formatAmount,
    getDonationTypeById,
    refresh,
  } = useDonations();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Montants rapides
  const quickAmounts = [5000, 10000, 25000, 50000, 100000];

  // Méthodes de paiement
  const paymentMethods: { key: PaymentMethod; name: string; color: string; icon: string; prefix: string }[] = [
    { key: "mtn", name: "MTN MoMo", color: "#FFCC00", icon: "phone-portrait", prefix: "05, 04" },
    { key: "orange", name: "Orange Money", color: "#FF6600", icon: "phone-portrait", prefix: "07" },
    { key: "wave", name: "Wave", color: "#1DC8FF", icon: "phone-portrait", prefix: "01" },
  ];

  // Icônes des catégories
  const categoryIcons: Record<string, string> = {
    "Dons réguliers": "repeat",
    "Projets": "construct",
    "Ministères": "megaphone",
    "Solidarité": "heart",
    "Soutien pastoral": "person",
    "Autre": "ellipsis-horizontal",
  };

  // Rafraîchir les données
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Obtenir l'icône du type de don
  const getTypeIcon = (icon: string | null): string => {
    const icons: Record<string, string> = {
      "trending-up": "trending-up",
      gift: "gift",
      heart: "heart",
      business: "business",
      "hardware-chip": "hardware-chip",
      megaphone: "megaphone",
      globe: "globe",
      people: "people",
      "hand-left": "hand-left",
      person: "person",
      ribbon: "ribbon",
      "ellipsis-horizontal": "ellipsis-horizontal",
    };
    return icons[icon || ""] || "cash";
  };

  // Valider le numéro de téléphone
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, "");
    return cleanPhone.length === 10 && /^0[1457]\d{8}$/.test(cleanPhone);
  };

  // Formater le numéro de téléphone
  const formatPhoneNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, "");
    const limited = cleaned.substring(0, 10);
    
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)} ${limited.slice(2)}`;
    if (limited.length <= 6) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4)}`;
    if (limited.length <= 8) return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6)}`;
    return `${limited.slice(0, 2)} ${limited.slice(2, 4)} ${limited.slice(4, 6)} ${limited.slice(6, 8)} ${limited.slice(8)}`;
  };

  // Ouvrir le modal de paiement
  const handleOpenPayment = () => {
    if (!selectedType) {
      Alert.alert("Erreur", "Veuillez sélectionner un type de don");
      return;
    }

    const amountNum = parseInt(amount.replace(/\s/g, ""), 10);
    if (!amountNum || amountNum < 100) {
      Alert.alert("Erreur", "Le montant minimum est de 100 F CFA");
      return;
    }

    if (user?.phone) {
      setPhoneNumber(formatPhoneNumber(user.phone));
    }

    setShowPaymentModal(true);
  };

  // Soumettre le don
  const handleSubmit = async () => {
    if (!paymentMethod) {
      Alert.alert("Erreur", "Veuillez sélectionner une méthode de paiement");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\s/g, "");
    if (!validatePhone(cleanPhone)) {
      Alert.alert("Erreur", "Veuillez entrer un numéro de téléphone valide (10 chiffres)");
      return;
    }

    const amountNum = parseInt(amount.replace(/\s/g, ""), 10);
    const selectedTypeData = getDonationTypeById(selectedType!);
    const typeName = selectedTypeData?.name || "Don";
    const methodName = paymentMethods.find((p) => p.key === paymentMethod)?.name;

    setShowPaymentModal(false);

    Alert.alert(
      "Confirmer le don",
      `Type: ${typeName}\nMontant: ${formatAmount(amountNum)}\nPaiement: ${methodName}\nNuméro: ${phoneNumber}\n\nVous recevrez une demande de paiement sur ce numéro.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            setIsSubmitting(true);

            const result = await makeDonation({
              type_id: selectedType!,
              amount: amountNum,
              payment_method: paymentMethod,
              is_anonymous: isAnonymous,
              phone_number: cleanPhone,
            });

            setIsSubmitting(false);

            if (result.success) {
              Alert.alert(
                "Don enregistré ! 🙏",
                `Votre don de ${formatAmount(amountNum)} a été enregistré.\n\nUne demande de paiement ${methodName} sera envoyée au ${phoneNumber}.\n\nMerci pour votre générosité !`,
                [
                  {
                    text: "OK",
                    onPress: () => {
                      setSelectedType(null);
                      setAmount("");
                      setIsAnonymous(false);
                      setPaymentMethod(null);
                      setPhoneNumber(user?.phone ? formatPhoneNumber(user.phone) : "");
                    },
                  },
                ]
              );
            } else {
              Alert.alert("Erreur", result.error || "Une erreur est survenue");
            }
          },
        },
      ]
    );
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Obtenir le type de don sélectionné
  const selectedTypeData = selectedType ? getDonationTypeById(selectedType) : null;

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
        {/* Header avec stats */}
        <LinearGradient
          colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Mes Dons</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatAmount(stats.thisMonthAmount)}</Text>
              <Text style={styles.statLabel}>Ce mois</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.donationCount}</Text>
              <Text style={styles.statLabel}>Total dons</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatAmount(stats.totalAmount)}</Text>
              <Text style={styles.statLabel}>Cumul</Text>
            </View>
          </View>
        </LinearGradient>

        {/* État de chargement */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary.gold} />
          </View>
        )}

        {!isLoading && (
          <View style={styles.content}>
            {/* Types de dons par catégorie */}
            <Text style={styles.sectionTitle}>Type de don</Text>
            <Text style={styles.sectionSubtitle}>
              Sélectionnez la catégorie de votre don
            </Text>

            {donationTypesByCategory.map((category) => (
              <View key={category.category} style={styles.categoryContainer}>
                {/* En-tête de catégorie */}
                <View style={styles.categoryHeader}>
                  <Ionicons
                    name={categoryIcons[category.category] as any || "folder"}
                    size={18}
                    color={COLORS.primary.gold}
                  />
                  <Text style={styles.categoryTitle}>{category.category}</Text>
                </View>

                {/* Types de dons dans la catégorie */}
                <View style={styles.typesGrid}>
                  {category.types.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeCard,
                        selectedType === type.id && styles.typeCardSelected,
                        { borderColor: selectedType === type.id ? type.color || COLORS.primary.gold : COLORS.neutral.border },
                      ]}
                      onPress={() => setSelectedType(type.id)}
                    >
                      <View
                        style={[
                          styles.typeIcon,
                          { backgroundColor: (type.color || COLORS.primary.gold) + "20" },
                        ]}
                      >
                        <Ionicons
                          name={getTypeIcon(type.icon) as any}
                          size={20}
                          color={type.color || COLORS.primary.gold}
                        />
                      </View>
                      <Text style={styles.typeName} numberOfLines={1}>{type.name}</Text>
                      {selectedType === type.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={type.color || COLORS.primary.gold}
                          style={styles.typeCheck}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* Description du type sélectionné */}
            {selectedTypeData && selectedTypeData.description && (
              <View style={[styles.typeDescription, { borderLeftColor: selectedTypeData.color || COLORS.primary.gold }]}>
                <View style={styles.typeDescriptionHeader}>
                  <Ionicons 
                    name={getTypeIcon(selectedTypeData.icon) as any} 
                    size={20} 
                    color={selectedTypeData.color || COLORS.primary.gold} 
                  />
                  <Text style={[styles.typeDescriptionTitle, { color: selectedTypeData.color || COLORS.primary.gold }]}>
                    {selectedTypeData.name}
                  </Text>
                </View>
                <Text style={styles.typeDescriptionText}>
                  {selectedTypeData.description}
                </Text>
              </View>
            )}

            {/* Montant */}
            <Text style={styles.sectionTitle}>Montant</Text>
            <ThemedCard variant="default" style={styles.amountCard}>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.text.tertiary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
                />
                <Text style={styles.amountCurrency}>F CFA</Text>
              </View>

              {/* Montants rapides */}
              <View style={styles.quickAmounts}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      amount === quickAmount.toString() && styles.quickAmountButtonActive,
                    ]}
                    onPress={() => setAmount(quickAmount.toString())}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        amount === quickAmount.toString() && styles.quickAmountTextActive,
                      ]}
                    >
                      {quickAmount >= 1000 ? `${quickAmount / 1000}K` : quickAmount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ThemedCard>

            {/* Don anonyme */}
            <ThemedCard variant="default" style={styles.anonymousCard}>
              <View style={styles.anonymousRow}>
                <View style={styles.anonymousInfo}>
                  <Ionicons name="eye-off" size={20} color={COLORS.text.secondary} />
                  <View style={styles.anonymousText}>
                    <Text style={styles.anonymousTitle}>Don anonyme</Text>
                    <Text style={styles.anonymousSubtitle}>
                      Votre nom ne sera pas visible
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isAnonymous}
                  onValueChange={setIsAnonymous}
                  trackColor={{ false: COLORS.neutral.border, true: COLORS.primary.gold + "50" }}
                  thumbColor={isAnonymous ? COLORS.primary.gold : COLORS.neutral.white}
                />
              </View>
            </ThemedCard>

            {/* Bouton Continuer */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedType || !amount || isSubmitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleOpenPayment}
              disabled={!selectedType || !amount || isSubmitting}
            >
              <LinearGradient
                colors={
                  !selectedType || !amount || isSubmitting
                    ? [COLORS.neutral.border, COLORS.neutral.border]
                    : [COLORS.primary.gold, COLORS.primary.goldDark]
                }
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={COLORS.neutral.white} />
                ) : (
                  <>
                    <Text style={styles.submitButtonText}>Continuer</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.neutral.white} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Historique des dons */}
            {donations.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Historique récent</Text>
                {donations.slice(0, 5).map((donation) => {
                  const donationType = donation.donation_types;
                  return (
                    <ThemedCard key={donation.id} variant="default" style={styles.historyCard}>
                      <View style={styles.historyRow}>
                        <View style={[styles.historyIcon, { backgroundColor: (donationType?.color || COLORS.primary.gold) + "20" }]}>
                          <Ionicons
                            name={getTypeIcon(donationType?.icon || null) as any}
                            size={20}
                            color={donationType?.color || COLORS.primary.gold}
                          />
                        </View>
                        <View style={styles.historyInfo}>
                          <Text style={styles.historyType}>
                            {donationType?.name || "Don"}
                          </Text>
                          <Text style={styles.historyDate}>
                            {formatDate(donation.donated_at)} • {donation.payment_method?.toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.historyAmount}>
                          <Text style={styles.historyAmountText}>
                            {formatAmount(donation.amount)}
                          </Text>
                          <View
                            style={[
                              styles.historyStatus,
                              {
                                backgroundColor:
                                  donation.payment_status === "completed"
                                    ? COLORS.status.success + "20"
                                    : donation.payment_status === "pending"
                                    ? COLORS.status.warning + "20"
                                    : COLORS.status.error + "20",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.historyStatusText,
                                {
                                  color:
                                    donation.payment_status === "completed"
                                      ? COLORS.status.success
                                      : donation.payment_status === "pending"
                                      ? COLORS.status.warning
                                      : COLORS.status.error,
                                },
                              ]}
                            >
                              {donation.payment_status === "completed"
                                ? "✓ Payé"
                                : donation.payment_status === "pending"
                                ? "En attente"
                                : "Échoué"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ThemedCard>
                  );
                })}
              </>
            )}

            {/* Message si pas de dons */}
            {donations.length === 0 && (
              <View style={styles.emptyHistory}>
                <Ionicons name="wallet-outline" size={48} color={COLORS.neutral.border} />
                <Text style={styles.emptyHistoryText}>
                  Vous n'avez pas encore fait de don
                </Text>
              </View>
            )}

            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>

      {/* Modal de paiement */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Header du modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Paiement</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Résumé */}
              <View style={styles.modalSummary}>
                <Text style={styles.modalSummaryLabel}>Montant à payer</Text>
                <Text style={styles.modalSummaryAmount}>
                  {formatAmount(parseInt(amount || "0", 10))}
                </Text>
                <Text style={styles.modalSummaryType}>
                  {selectedTypeData?.name || "Don"}
                </Text>
              </View>

              {/* Méthodes de paiement */}
              <Text style={styles.modalSectionTitle}>Choisir le mode de paiement</Text>
              <View style={styles.paymentMethods}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.key}
                    style={[
                      styles.paymentCard,
                      paymentMethod === method.key && styles.paymentCardSelected,
                      paymentMethod === method.key && { borderColor: method.color },
                    ]}
                    onPress={() => setPaymentMethod(method.key)}
                  >
                    <View style={[styles.paymentIcon, { backgroundColor: method.color + "20" }]}>
                      <Ionicons name={method.icon as any} size={20} color={method.color} />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentName}>{method.name}</Text>
                      <Text style={styles.paymentPrefix}>Numéros: {method.prefix}</Text>
                    </View>
                    {paymentMethod === method.key && (
                      <Ionicons name="checkmark-circle" size={22} color={method.color} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Numéro de téléphone */}
              <Text style={styles.modalSectionTitle}>Numéro de téléphone</Text>
              <View style={styles.phoneInputContainer}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+225</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="07 XX XX XX XX"
                  placeholderTextColor={COLORS.text.tertiary}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                  maxLength={14}
                />
                {validatePhone(phoneNumber.replace(/\s/g, "")) && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.status.success} style={styles.phoneCheck} />
                )}
              </View>
              <Text style={styles.phoneHint}>
                Vous recevrez une demande de paiement sur ce numéro
              </Text>

              {/* Bouton Payer */}
              <TouchableOpacity
                style={[
                  styles.payButton,
                  (!paymentMethod || !validatePhone(phoneNumber.replace(/\s/g, ""))) && styles.payButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!paymentMethod || !validatePhone(phoneNumber.replace(/\s/g, ""))}
              >
                <LinearGradient
                  colors={
                    !paymentMethod || !validatePhone(phoneNumber.replace(/\s/g, ""))
                      ? [COLORS.neutral.border, COLORS.neutral.border]
                      : [COLORS.primary.gold, COLORS.primary.goldDark]
                  }
                  style={styles.payButtonGradient}
                >
                  <Ionicons name="shield-checkmark" size={20} color={COLORS.neutral.white} />
                  <Text style={styles.payButtonText}>
                    Payer {formatAmount(parseInt(amount || "0", 10))}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Sécurité */}
              <View style={styles.securityNote}>
                <Ionicons name="lock-closed" size={14} color={COLORS.text.tertiary} />
                <Text style={styles.securityNoteText}>
                  Paiement sécurisé • Vos données sont protégées
                </Text>
              </View>
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
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary.goldLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.md,
  },
  categoryContainer: {
    marginBottom: SPACING.lg,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  categoryTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.secondary,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  typeCard: {
    width: "31%",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
  },
  typeCardSelected: {
    backgroundColor: COLORS.primary.gold + "10",
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  typeName: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
    textAlign: "center",
  },
  typeCheck: {
    position: "absolute",
    top: 2,
    right: 2,
  },
  typeDescription: {
    backgroundColor: COLORS.neutral.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 4,
  },
  typeDescriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  typeDescriptionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  typeDescriptionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  amountCard: {
    padding: SPACING.lg,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    textAlign: "center",
    minWidth: 80,
  },
  amountCurrency: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.text.tertiary,
    marginLeft: SPACING.sm,
  },
  quickAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAmountButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.background,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
  },
  quickAmountButtonActive: {
    backgroundColor: COLORS.primary.gold,
    borderColor: COLORS.primary.gold,
  },
  quickAmountText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
  },
  quickAmountTextActive: {
    color: COLORS.neutral.white,
  },
  anonymousCard: {
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  anonymousInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  anonymousText: {
    gap: 2,
  },
  anonymousTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  anonymousSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  submitButton: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  historyCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  historyInfo: {
    flex: 1,
    gap: 2,
  },
  historyType: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  historyDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  historyAmount: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  historyAmountText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  historyStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  historyStatusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
  },
  emptyHistory: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  emptyHistoryText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.tertiary,
    marginTop: SPACING.md,
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
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  modalSummary: {
    alignItems: "center",
    backgroundColor: COLORS.primary.gold + "10",
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  modalSummaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  modalSummaryAmount: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
    marginVertical: SPACING.xs,
  },
  modalSummaryType: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  modalSectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  paymentMethods: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
  },
  paymentCardSelected: {
    backgroundColor: COLORS.primary.gold + "05",
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  paymentPrefix: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    overflow: "hidden",
  },
  phonePrefix: {
    backgroundColor: COLORS.neutral.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  phonePrefixText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text.primary,
    letterSpacing: 1,
  },
  phoneCheck: {
    marginRight: SPACING.md,
  },
  phoneHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  payButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    marginBottom: SPACING.md,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  payButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  securityNoteText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
});