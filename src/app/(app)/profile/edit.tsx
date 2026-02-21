/**
 * Ecran Modifier le Profil - Centre Chretien de Reveil
 * Permet de modifier toutes les informations du profil utilisateur
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUserStore } from "../../../stores/userStore";
import { profileService } from "../../../services/profile.service";
import { ThemedInput } from "../../../components/ui/ThemedInput";
import { GradientButton } from "../../../components/ui/GradientButton";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";

// Options pour le statut matrimonial
const MARITAL_STATUS_OPTIONS = [
  { label: "Celibataire", value: "Celibataire" },
  { label: "Marie(e)", value: "Marie(e)" },
  { label: "Veuf(ve)", value: "Veuf(ve)" },
  { label: "Divorce(e)", value: "Divorce(e)" },
] as const;

// Type pour les champs du formulaire
interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  gender: "Homme" | "Femme" | "";
  date_of_birth: string;
  city: string;
  neighborhood: string;
  marital_status: string;
  profession: string;
  is_baptized: boolean;
}

export default function EditProfileScreen() {
  const { user, updateUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showMaritalPicker, setShowMaritalPicker] = useState(false);

  // Initialiser le formulaire avec les donnees du store
  const [form, setForm] = useState<FormData>({
    first_name: "",
    last_name: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    city: "",
    neighborhood: "",
    marital_status: "",
    profession: "",
    is_baptized: false,
  });

  // Charger les donnees du profil au montage
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        gender: (user.gender as "Homme" | "Femme" | "") || "",
        date_of_birth: (user as any).date_of_birth || "",
        city: (user as any).city || "",
        neighborhood: (user as any).neighborhood || "",
        marital_status: (user as any).marital_status || "",
        profession: (user as any).profession || "",
        is_baptized: (user as any).is_baptized || false,
      });
    }
  }, [user]);

  // Mettre a jour un champ du formulaire
  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validation basique
  const validateForm = (): boolean => {
    if (!form.first_name.trim()) {
      Alert.alert("Erreur", "Le prenom est obligatoire.");
      return false;
    }
    if (!form.last_name.trim()) {
      Alert.alert("Erreur", "Le nom de famille est obligatoire.");
      return false;
    }
    // Validation du format de la date si renseignee
    if (form.date_of_birth.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(form.date_of_birth.trim())) {
        Alert.alert("Erreur", "La date de naissance doit etre au format AAAA-MM-JJ (ex: 1990-05-15).");
        return false;
      }
    }
    return true;
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const updates: Record<string, any> = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim(),
        date_of_birth: form.date_of_birth.trim() || null,
        city: form.city.trim() || null,
        neighborhood: form.neighborhood.trim() || null,
        marital_status: form.marital_status || null,
        profession: form.profession.trim() || null,
        is_baptized: form.is_baptized,
      };

      // N'ajouter le genre que s'il est selectionne
      if (form.gender === "Homme" || form.gender === "Femme") {
        updates.gender = form.gender;
      }

      const { success, error } = await profileService.updateProfile(updates);

      if (success) {
        // Mettre a jour le store local
        updateUser(updates);
        Alert.alert("Succes", "Votre profil a ete mis a jour avec succes.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Erreur", error || "Impossible de mettre a jour le profil. Veuillez reessayer.");
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      Alert.alert("Erreur", "Une erreur inattendue s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir le label du statut matrimonial selectionne
  const getMaritalStatusLabel = (): string => {
    const option = MARITAL_STATUS_OPTIONS.find((o) => o.value === form.marital_status);
    return option ? option.label : "Selectionner";
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier mon profil</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section Identite */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={COLORS.primary.gold} />
              <Text style={styles.sectionTitle}>Identite</Text>
            </View>

            <ThemedInput
              label="Prenom"
              placeholder="Votre prenom"
              value={form.first_name}
              onChangeText={(text) => updateField("first_name", text)}
              icon="person-outline"
              autoCapitalize="words"
            />

            <ThemedInput
              label="Nom de famille"
              placeholder="Votre nom de famille"
              value={form.last_name}
              onChangeText={(text) => updateField("last_name", text)}
              icon="person-outline"
              autoCapitalize="words"
            />

            {/* Selection du genre */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Genre</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    form.gender === "Homme" && styles.genderOptionActive,
                  ]}
                  onPress={() => updateField("gender", "Homme")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="man"
                    size={28}
                    color={
                      form.gender === "Homme"
                        ? COLORS.primary.gold
                        : COLORS.text.tertiary
                    }
                  />
                  <Text
                    style={[
                      styles.genderText,
                      form.gender === "Homme" && styles.genderTextActive,
                    ]}
                  >
                    Homme
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.genderOption,
                    form.gender === "Femme" && styles.genderOptionActive,
                  ]}
                  onPress={() => updateField("gender", "Femme")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="woman"
                    size={28}
                    color={
                      form.gender === "Femme"
                        ? COLORS.primary.gold
                        : COLORS.text.tertiary
                    }
                  />
                  <Text
                    style={[
                      styles.genderText,
                      form.gender === "Femme" && styles.genderTextActive,
                    ]}
                  >
                    Femme
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ThemedInput
              label="Date de naissance (AAAA-MM-JJ)"
              placeholder="1990-05-15"
              value={form.date_of_birth}
              onChangeText={(text) => updateField("date_of_birth", text)}
              icon="calendar-outline"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>

          {/* Section Contact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call-outline" size={20} color={COLORS.primary.gold} />
              <Text style={styles.sectionTitle}>Contact</Text>
            </View>

            <ThemedInput
              label="Telephone"
              placeholder="+237 6XX XXX XXX"
              value={form.phone}
              onChangeText={(text) => updateField("phone", text)}
              icon="call-outline"
              keyboardType="phone-pad"
            />
          </View>

          {/* Section Localisation */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={COLORS.primary.gold} />
              <Text style={styles.sectionTitle}>Localisation</Text>
            </View>

            <ThemedInput
              label="Ville"
              placeholder="Votre ville"
              value={form.city}
              onChangeText={(text) => updateField("city", text)}
              icon="business-outline"
              autoCapitalize="words"
            />

            <ThemedInput
              label="Quartier"
              placeholder="Votre quartier"
              value={form.neighborhood}
              onChangeText={(text) => updateField("neighborhood", text)}
              icon="map-outline"
              autoCapitalize="words"
            />
          </View>

          {/* Section Situation */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase-outline" size={20} color={COLORS.primary.gold} />
              <Text style={styles.sectionTitle}>Situation</Text>
            </View>

            {/* Statut matrimonial - Picker */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Statut matrimonial</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowMaritalPicker(!showMaritalPicker)}
                activeOpacity={0.7}
              >
                <Ionicons name="heart-outline" size={20} color={COLORS.text.tertiary} />
                <Text
                  style={[
                    styles.pickerButtonText,
                    form.marital_status && styles.pickerButtonTextSelected,
                  ]}
                >
                  {getMaritalStatusLabel()}
                </Text>
                <Ionicons
                  name={showMaritalPicker ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={COLORS.text.tertiary}
                />
              </TouchableOpacity>

              {showMaritalPicker && (
                <View style={styles.pickerDropdown}>
                  {MARITAL_STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.pickerOption,
                        form.marital_status === option.value && styles.pickerOptionActive,
                      ]}
                      onPress={() => {
                        updateField("marital_status", option.value);
                        setShowMaritalPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          form.marital_status === option.value && styles.pickerOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {form.marital_status === option.value && (
                        <Ionicons name="checkmark" size={20} color={COLORS.primary.gold} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <ThemedInput
              label="Profession"
              placeholder="Votre profession"
              value={form.profession}
              onChangeText={(text) => updateField("profession", text)}
              icon="briefcase-outline"
              autoCapitalize="words"
            />
          </View>

          {/* Section Spirituel */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="water-outline" size={20} color={COLORS.primary.gold} />
              <Text style={styles.sectionTitle}>Vie spirituelle</Text>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Ionicons name="water" size={22} color={COLORS.primary.gold} />
                <View style={styles.switchTextContainer}>
                  <Text style={styles.switchLabel}>Baptise(e)</Text>
                  <Text style={styles.switchDescription}>
                    Indiquez si vous avez ete baptise(e) par immersion
                  </Text>
                </View>
              </View>
              <Switch
                value={form.is_baptized}
                onValueChange={(value) => updateField("is_baptized", value)}
                trackColor={{
                  false: COLORS.neutral.border,
                  true: COLORS.primary.goldLight,
                }}
                thumbColor={form.is_baptized ? COLORS.primary.gold : "#f4f3f4"}
                ios_backgroundColor={COLORS.neutral.border}
              />
            </View>
          </View>

          {/* Bouton de sauvegarde */}
          <View style={styles.saveSection}>
            <GradientButton
              title={isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
              onPress={handleSave}
              loading={isLoading}
              disabled={isLoading}
              size="lg"
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
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
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.neutral.background,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },

  // Sections
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },

  // Champ generique
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },

  // Gender
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
    paddingVertical: SPACING.lg,
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

  // Picker (statut matrimonial)
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.background,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  pickerButtonText: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    color: COLORS.text.tertiary,
  },
  pickerButtonTextSelected: {
    color: COLORS.text.primary,
  },
  pickerDropdown: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    overflow: "hidden",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  pickerOptionActive: {
    backgroundColor: "#FEF9E7",
  },
  pickerOptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  pickerOptionTextActive: {
    color: COLORS.primary.gold,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Switch (bapteme)
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral.borderLight,
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    flex: 1,
    marginRight: SPACING.md,
  },
  switchTextContainer: {
    flex: 1,
  },
  switchLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    lineHeight: 16,
  },

  // Save section
  saveSection: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: SPACING.lg,
  },
  cancelButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.tertiary,
  },
});
