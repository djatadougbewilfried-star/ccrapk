/**
 * Écran d'inscription - Centre Chrétien de Réveil
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { ThemedInput } from "../../components/ui/ThemedInput";
import { GradientButton } from "../../components/ui/GradientButton";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  CHURCH_INFO,
} from "../../constants/theme";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Étape 1 : Identifiants
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Étape 2 : Infos personnelles
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedGender, setSelectedGender] = useState<string>("");

  // Consentements RGPD (non pré-cochés conformément au RGPD)
  const [consentDataProcessing, setConsentDataProcessing] = useState(false);
  const [consentCommunications, setConsentCommunications] = useState(false);

  const validateStep1 = () => {
    if (!email.trim() || !phone.trim() || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("Erreur", "Email invalide");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!firstName.trim() || !lastName.trim() || !selectedGender) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return false;
    }
    if (!consentDataProcessing) {
      Alert.alert(
        "Consentement requis",
        "Vous devez accepter le traitement de vos données personnelles pour créer un compte."
      );
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    const { error } = await signUp(email.trim(), password, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      gender: selectedGender as "Homme" | "Femme",
      consent_data_processing: consentDataProcessing,
      consent_communications: consentCommunications,
      consent_date: new Date().toISOString(),
    });
    setIsLoading(false);

    if (error) {
      Alert.alert("Erreur d'inscription", error);
    } else {
      Alert.alert(
        "Inscription réussie !",
        "Bienvenue dans la famille CCR ! Vous pouvez maintenant vous connecter.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );
    }
  };

  const selectGender = (gender: string) => {
    setSelectedGender(gender);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (step === 1 ? router.back() : setStep(1))}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[COLORS.primary.gold, COLORS.primary.goldLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: step === 1 ? "50%" : "100%" }]}
                />
              </View>
              <Text style={styles.progressText}>Étape {step}/2</Text>
            </View>
          </View>

          {/* Contenu */}
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>
                {step === 1 ? "Créer un compte" : "Vos informations"}
              </Text>
              <Text style={styles.subtitle}>
                {step === 1
                  ? "Rejoignez la communauté CCR"
                  : "Parlez-nous de vous"}
              </Text>
            </View>

            {step === 1 ? (
              // Étape 1
              <View style={styles.form}>
                <ThemedInput
                  label="Adresse email"
                  placeholder="votre@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                />

                <ThemedInput
                  label="Numéro de téléphone"
                  placeholder="+225 07 00 00 00 00"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  icon="call-outline"
                />

                <ThemedInput
                  label="Mot de passe"
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                />

                <ThemedInput
                  label="Confirmer le mot de passe"
                  placeholder="Retapez votre mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                />

                <GradientButton
                  title="Continuer"
                  onPress={handleNext}
                  size="lg"
                  icon={<Ionicons name="arrow-forward" size={20} color="#fff" />}
                />
              </View>
            ) : (
              // Étape 2
              <View style={styles.form}>
                <ThemedInput
                  label="Prénom"
                  placeholder="Votre prénom"
                  value={firstName}
                  onChangeText={setFirstName}
                  icon="person-outline"
                />

                <ThemedInput
                  label="Nom de famille"
                  placeholder="Votre nom"
                  value={lastName}
                  onChangeText={setLastName}
                  icon="person-outline"
                />

                {/* Sélection du genre */}
                <View style={styles.genderSection}>
                  <Text style={styles.genderLabel}>Genre</Text>
                  <View style={styles.genderOptions}>
                    {/* Bouton Homme */}
                    <TouchableOpacity
                      style={[
                        styles.genderOption,
                        selectedGender === "Homme" && styles.genderOptionActive,
                      ]}
                      onPress={() => selectGender("Homme")}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="man"
                        size={28}
                        color={selectedGender === "Homme" ? COLORS.primary.gold : COLORS.text.tertiary}
                      />
                      <Text
                        style={[
                          styles.genderText,
                          selectedGender === "Homme" && styles.genderTextActive,
                        ]}
                      >
                        Homme
                      </Text>
                    </TouchableOpacity>

                    {/* Bouton Femme */}
                    <TouchableOpacity
                      style={[
                        styles.genderOption,
                        selectedGender === "Femme" && styles.genderOptionActive,
                      ]}
                      onPress={() => selectGender("Femme")}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="woman"
                        size={28}
                        color={selectedGender === "Femme" ? COLORS.primary.gold : COLORS.text.tertiary}
                      />
                      <Text
                        style={[
                          styles.genderText,
                          selectedGender === "Femme" && styles.genderTextActive,
                        ]}
                      >
                        Femme
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Indicateur de sélection */}
                  {selectedGender !== "" && (
                    <Text style={styles.genderSelected}>
                      ✓ {selectedGender} sélectionné
                    </Text>
                  )}
                </View>

                {/* Consentements RGPD */}
                <View style={styles.consentSection}>
                  <TouchableOpacity
                    style={styles.consentRow}
                    onPress={() => setConsentDataProcessing(!consentDataProcessing)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, consentDataProcessing && styles.checkboxChecked]}>
                      {consentDataProcessing && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.consentText}>
                      J'accepte le traitement de mes données personnelles conformément à la politique de confidentialité du CCR. <Text style={styles.consentRequired}>*</Text>
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.consentRow}
                    onPress={() => setConsentCommunications(!consentCommunications)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, consentCommunications && styles.checkboxChecked]}>
                      {consentCommunications && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.consentText}>
                      J'accepte de recevoir des communications et notifications de la part du CCR (optionnel).
                    </Text>
                  </TouchableOpacity>
                </View>

                <GradientButton
                  title="Créer mon compte"
                  onPress={handleRegister}
                  loading={isLoading}
                  size="lg"
                />
              </View>
            )}

            {/* Lien connexion */}
            {step === 1 && (
              <View style={styles.loginSection}>
                <Text style={styles.loginText}>Déjà membre ?</Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={styles.loginLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.xs,
    textAlign: "right",
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  titleContainer: {
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  form: {
    gap: SPACING.sm,
  },
  genderSection: {
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  genderLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  genderOptions: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  genderOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 2,
    borderColor: COLORS.neutral.border,
  },
  genderOptionActive: {
    borderColor: COLORS.primary.gold,
    backgroundColor: "#FEF9E7",
  },
  genderText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.tertiary,
  },
  genderTextActive: {
    color: COLORS.primary.gold,
    fontWeight: FONT_WEIGHT.bold,
  },
  genderSelected: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary.gold,
    textAlign: "center",
    marginTop: SPACING.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  consentSection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary.gold,
    borderColor: COLORS.primary.gold,
  },
  consentText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  consentRequired: {
    color: "#EF4444",
    fontWeight: FONT_WEIGHT.bold,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
  },
  loginText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
  },
});