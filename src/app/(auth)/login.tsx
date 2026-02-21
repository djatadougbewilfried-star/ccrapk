/**
 * Écran de connexion - Centre Chrétien de Réveil
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
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

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      Alert.alert("Erreur de connexion", error);
    } else {
      router.replace("/(tabs)");
    }
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
          {/* Header avec gradient */}
          <LinearGradient
            colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
            style={styles.header}
          >
            <View style={styles.headerDecor} />
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.churchName}>{CHURCH_INFO.shortName}</Text>
            <Text style={styles.welcomeText}>Bienvenue !</Text>
          </LinearGradient>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Connexion</Text>
              <Text style={styles.formSubtitle}>
                Connectez-vous pour accéder à votre espace
              </Text>
            </View>

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
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => router.push("/(auth)/forgot-password")}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <GradientButton
              title="Se connecter"
              onPress={handleLogin}
              loading={isLoading}
              size="lg"
            />

            {/* Séparateur */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>ou</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Inscription */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Vous n'avez pas de compte ?</Text>
              <TouchableOpacity
                onPress={() => router.push("/(auth)/register")}
              >
                <Text style={styles.registerLink}>Créer un compte</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{CHURCH_INFO.slogan}</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  headerDecor: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(212, 168, 75, 0.1)",
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.primary.gold,
  },
  logo: {
    width: 60,
    height: 60,
  },
  churchName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
    letterSpacing: 2,
  },
  welcomeText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  formHeader: {
    marginBottom: SPACING.xxl,
  },
  formTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  formSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: SPACING.xxl,
    marginTop: -SPACING.sm,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary.gold,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.xxl,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.neutral.border,
  },
  separatorText: {
    marginHorizontal: SPACING.lg,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.sm,
  },
  registerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
  },
  registerLink: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
  },
  footer: {
    paddingVertical: SPACING.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    fontStyle: "italic",
    color: COLORS.text.tertiary,
  },
});