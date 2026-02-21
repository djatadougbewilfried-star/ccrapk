/**
 * Écran pour faire un don
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFinances } from "../../../hooks/useFinances";
import {
  DonationTypeCard,
  PaymentMethodSelector,
  AmountInput,
} from "../../../components/features/finance";
import { PaymentMethod } from "../../../types/database";

type Step = "type" | "amount" | "payment" | "confirm" | "processing" | "success";

export default function DonateScreen() {
  const router = useRouter();
  const { donationTypes, createDonation, processPayment, formatAmount } = useFinances();

  // États du formulaire
  const [step, setStep] = useState<Step>("type");
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dedication, setDedication] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationId, setDonationId] = useState<string | null>(null);

  const selectedType = donationTypes.find((t) => t.id === selectedTypeId);

  const canProceed = (): boolean => {
    switch (step) {
      case "type":
        return !!selectedTypeId;
      case "amount":
        return parseInt(amount) >= 100;
      case "payment":
        return !!paymentMethod && phoneNumber.length >= 8;
      default:
        return true;
    }
  };

  const handleNext = () => {
    switch (step) {
      case "type":
        setStep("amount");
        break;
      case "amount":
        setStep("payment");
        break;
      case "payment":
        setStep("confirm");
        break;
      case "confirm":
        handleSubmit();
        break;
    }
  };

  const handleBack = () => {
    switch (step) {
      case "amount":
        setStep("type");
        break;
      case "payment":
        setStep("amount");
        break;
      case "confirm":
        setStep("payment");
        break;
      default:
        router.back();
    }
  };

  const handleSubmit = async () => {
    if (!selectedTypeId || !paymentMethod) return;

    setStep("processing");
    setIsProcessing(true);

    // Créer le don
    const { donation, error } = await createDonation({
      type_id: selectedTypeId,
      amount: parseInt(amount),
      payment_method: paymentMethod,
      payment_phone: phoneNumber,
      is_anonymous: isAnonymous,
      dedication: dedication || undefined,
    });

    if (error || !donation) {
      Alert.alert("Erreur", error || "Une erreur est survenue");
      setStep("confirm");
      setIsProcessing(false);
      return;
    }

    setDonationId(donation.id);

    // Simuler le paiement
    const success = await processPayment(donation.id, paymentMethod, phoneNumber);

    setIsProcessing(false);

    if (success) {
      setStep("success");
    } else {
      Alert.alert(
        "Paiement échoué",
        "Le paiement n'a pas pu être effectué. Veuillez réessayer.",
        [
          { text: "Réessayer", onPress: () => setStep("confirm") },
          { text: "Annuler", onPress: () => router.back() },
        ]
      );
    }
  };

  const renderStepIndicator = () => {
    const steps = ["type", "amount", "payment", "confirm"];
    const currentIndex = steps.indexOf(step);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((s, index) => (
          <React.Fragment key={s}>
            <View
              style={[
                styles.stepDot,
                index <= currentIndex && styles.stepDotActive,
              ]}
            />
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentIndex && styles.stepLineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    switch (step) {
      case "type":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Type de don</Text>
            <Text style={styles.stepSubtitle}>
              Choisissez le type de don que vous souhaitez faire
            </Text>
            <View style={styles.typeList}>
              {donationTypes.map((type) => (
                <DonationTypeCard
                  key={type.id}
                  type={type}
                  isSelected={selectedTypeId === type.id}
                  onPress={() => setSelectedTypeId(type.id)}
                />
              ))}
            </View>
          </View>
        );

      case "amount":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Montant</Text>
            <Text style={styles.stepSubtitle}>
              Entrez le montant de votre {selectedType?.name.toLowerCase()}
            </Text>
            <AmountInput value={amount} onChange={setAmount} />
          </View>
        );

      case "payment":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Mode de paiement</Text>
            <Text style={styles.stepSubtitle}>
              Choisissez comment vous souhaitez payer
            </Text>
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
            />
            
            {paymentMethod && (
              <View style={styles.phoneInput}>
                <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="07 XX XX XX XX"
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            )}
          </View>
        );

      case "confirm":
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirmation</Text>
            <Text style={styles.stepSubtitle}>
              Vérifiez les détails de votre don
            </Text>

            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Type</Text>
                <Text style={styles.confirmValue}>{selectedType?.name}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Montant</Text>
                <Text style={styles.confirmValueBig}>
                  {formatAmount(parseInt(amount))}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Paiement</Text>
                <Text style={styles.confirmValue}>
                  {paymentMethod === "mtn_momo" && "MTN Mobile Money"}
                  {paymentMethod === "orange_money" && "Orange Money"}
                  {paymentMethod === "wave" && "Wave"}
                </Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Téléphone</Text>
                <Text style={styles.confirmValue}>{phoneNumber}</Text>
              </View>
            </View>

            {/* Options supplémentaires */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
                {isAnonymous && <Ionicons name="checkmark" size={14} color="#ffffff" />}
              </View>
              <Text style={styles.optionText}>Don anonyme</Text>
            </TouchableOpacity>

            <View style={styles.dedicationInput}>
              <Text style={styles.inputLabel}>Dédicace (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex: En mémoire de..., Pour le projet..."
                placeholderTextColor="#9ca3af"
                value={dedication}
                onChangeText={setDedication}
                multiline
              />
            </View>
          </View>
        );

      case "processing":
        return (
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.processingTitle}>Traitement en cours...</Text>
            <Text style={styles.processingText}>
              Veuillez valider le paiement sur votre téléphone
            </Text>
          </View>
        );

      case "success":
        return (
          <View style={styles.successContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
            </View>
            <Text style={styles.successTitle}>Merci pour votre don !</Text>
            <Text style={styles.successAmount}>
              {formatAmount(parseInt(amount))}
            </Text>
            <Text style={styles.successText}>
              Votre {selectedType?.name.toLowerCase()} a été enregistré avec succès.
              Que Dieu vous bénisse abondamment !
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => router.back()}
            >
              <Text style={styles.successButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        {step !== "processing" && step !== "success" && (
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Faire un don</Text>
            <View style={{ width: 40 }} />
          </View>
        )}

        {/* Indicateur d'étapes */}
        {step !== "processing" && step !== "success" && renderStepIndicator()}

        {/* Contenu */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {renderContent()}
        </ScrollView>

        {/* Bouton continuer */}
        {step !== "processing" && step !== "success" && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !canProceed() && styles.continueButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!canProceed() || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.continueButtonText}>
                  {step === "confirm" ? "Confirmer le don" : "Continuer"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },
  stepDotActive: {
    backgroundColor: "#22c55e",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: "#22c55e",
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 24,
  },
  typeList: {
    gap: 0,
  },
  phoneInput: {
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  confirmCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  confirmLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  confirmValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  confirmValueBig: {
    fontSize: 20,
    fontWeight: "700",
    color: "#22c55e",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  optionText: {
    fontSize: 15,
    color: "#374151",
  },
  dedicationInput: {
    marginTop: 16,
  },
  processingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
  },
  processingText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  successContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#22c55e",
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  successButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  continueButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});