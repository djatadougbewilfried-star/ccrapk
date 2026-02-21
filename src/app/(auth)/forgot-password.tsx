/**
 * Écran mot de passe oublié - Centre Chrétien de Réveil
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
} from "../../constants/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre adresse email");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Erreur", "Adresse email invalide");
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(email.trim());
    setIsLoading(false);

    if (error) {
      Alert.alert("Erreur", error);
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail" size={48} color={COLORS.primary.gold} />
          </View>
          <Text style={styles.successTitle}>Email envoyé !</Text>
          <Text style={styles.successText}>
            Nous avons envoyé un lien de réinitialisation à{"\n"}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.successHint}>
            Vérifiez votre boîte de réception et suivez les instructions pour
            réinitialiser votre mot de passe.
          </Text>
          <GradientButton
            title="Retour à la connexion"
            onPress={() => router.replace("/(auth)/login")}
            size="lg"
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

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
              style={styles.backButtonIcon}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Contenu */}
          <View style={styles.content}>
            {/* Icône */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-open" size={40} color={COLORS.primary.gold} />
              </View>
            </View>

            {/* Titre */}
            <Text style={styles.title}>Mot de passe oublié ?</Text>
            <Text style={styles.subtitle}>
              Pas de souci ! Entrez votre adresse email et nous vous enverrons un
              lien pour réinitialiser votre mot de passe.
            </Text>

            {/* Formulaire */}
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

              <GradientButton
                title="Envoyer le lien"
                onPress={handleResetPassword}
                loading={isLoading}
                size="lg"
              />
            </View>

            {/* Lien retour */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push("/(auth)/login")}
            >
              <Ionicons
                name="arrow-back"
                size={16}
                color={COLORS.text.secondary}
              />
              <Text style={styles.loginLinkText}>Retour à la connexion</Text>
            </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary.goldSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: SPACING.xxxl,
  },
  form: {
    gap: SPACING.lg,
  },
  loginLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.xxxl,
    gap: SPACING.sm,
  },
  loginLinkText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary.goldSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  successTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  emailHighlight: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
  },
  successHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.xxxl,
  },
  backButton: {
    width: "100%",
  },
});