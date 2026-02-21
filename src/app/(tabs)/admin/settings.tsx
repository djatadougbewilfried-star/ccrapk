/**
 * Paramètres de l'église
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAdmin } from "../../../hooks/useAdmin";

export default function SettingsScreen() {
  const router = useRouter();
  const {
    isAdmin,
    settings,
    isLoading,
    loadData,
    updateSettings,
  } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggle = async (key: string, value: boolean) => {
    setIsSaving(true);
    const success = await updateSettings({ [key]: value });
    setIsSaving(false);

    if (success) {
      Alert.alert("Succès", "Paramètre mis à jour");
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="lock-closed" size={64} color="#d1d5db" />
          <Text style={styles.accessDeniedText}>Accès restreint</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Section Église */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de l'église</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="call-outline" size={20} color="#6b7280" />
                <View>
                  <Text style={styles.settingLabel}>Téléphone</Text>
                  <Text style={styles.settingValue}>
                    {settings?.contact_phone || "Non défini"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                <View>
                  <Text style={styles.settingLabel}>Email</Text>
                  <Text style={styles.settingValue}>
                    {settings?.contact_email || "Non défini"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="location-outline" size={20} color="#6b7280" />
                <View>
                  <Text style={styles.settingLabel}>Adresse</Text>
                  <Text style={styles.settingValue} numberOfLines={1}>
                    {settings?.address || "Non définie"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </View>
          </View>
        </View>

        {/* Section Règles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Règles de l'église</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Dons anonymes autorisés</Text>
                <Text style={styles.toggleDescription}>
                  Permettre aux donateurs de rester anonymes
                </Text>
              </View>
              <Switch
                value={settings?.allow_anonymous_donations ?? true}
                onValueChange={(value) =>
                  handleToggle("allow_anonymous_donations", value)
                }
                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                thumbColor={
                  settings?.allow_anonymous_donations ? "#2563eb" : "#f4f3f4"
                }
                disabled={isSaving}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Académie requise pour servir</Text>
                <Text style={styles.toggleDescription}>
                  Exiger l'Académie de Réveil pour les départements
                </Text>
              </View>
              <Switch
                value={settings?.require_academie_for_service ?? true}
                onValueChange={(value) =>
                  handleToggle("require_academie_for_service", value)
                }
                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                thumbColor={
                  settings?.require_academie_for_service ? "#2563eb" : "#f4f3f4"
                }
                disabled={isSaving}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Affectation tribu automatique</Text>
                <Text style={styles.toggleDescription}>
                  Affecter automatiquement les nouveaux membres
                </Text>
              </View>
              <Switch
                value={settings?.auto_assign_tribu ?? true}
                onValueChange={(value) =>
                  handleToggle("auto_assign_tribu", value)
                }
                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                thumbColor={
                  settings?.auto_assign_tribu ? "#2563eb" : "#f4f3f4"
                }
                disabled={isSaving}
              />
            </View>
          </View>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Anniversaires</Text>
                <Text style={styles.toggleDescription}>
                  Envoyer des notifications pour les anniversaires
                </Text>
              </View>
              <Switch
                value={settings?.send_birthday_notifications ?? true}
                onValueChange={(value) =>
                  handleToggle("send_birthday_notifications", value)
                }
                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                thumbColor={
                  settings?.send_birthday_notifications ? "#2563eb" : "#f4f3f4"
                }
                disabled={isSaving}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Rappels d'événements</Text>
                <Text style={styles.toggleDescription}>
                  Envoyer des rappels avant les événements
                </Text>
              </View>
              <Switch
                value={settings?.send_event_reminders ?? true}
                onValueChange={(value) =>
                  handleToggle("send_event_reminders", value)
                }
                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                thumbColor={
                  settings?.send_event_reminders ? "#2563eb" : "#f4f3f4"
                }
                disabled={isSaving}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleLabel}>Reçus de dons</Text>
                <Text style={styles.toggleDescription}>
                  Envoyer des reçus par email après un don
                </Text>
              </View>
              <Switch
                value={settings?.send_donation_receipts ?? true}
                onValueChange={(value) =>
                  handleToggle("send_donation_receipts", value)
                }
                trackColor={{ false: "#d1d5db", true: "#bfdbfe" }}
                thumbColor={
                  settings?.send_donation_receipts ? "#2563eb" : "#f4f3f4"
                }
                disabled={isSaving}
              />
            </View>
          </View>
        </View>

        {/* Section Réseaux sociaux */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.socialRow}>
              <View style={[styles.socialIcon, { backgroundColor: "#1877f2" }]}>
                <Ionicons name="logo-facebook" size={18} color="#ffffff" />
              </View>
              <Text style={styles.socialLabel}>Facebook</Text>
              <Text style={styles.socialValue} numberOfLines={1}>
                {settings?.facebook_url ? "Configuré" : "Non configuré"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.socialRow}>
              <View style={[styles.socialIcon, { backgroundColor: "#e4405f" }]}>
                <Ionicons name="logo-instagram" size={18} color="#ffffff" />
              </View>
              <Text style={styles.socialLabel}>Instagram</Text>
              <Text style={styles.socialValue} numberOfLines={1}>
                {settings?.instagram_url ? "Configuré" : "Non configuré"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.socialRow}>
              <View style={[styles.socialIcon, { backgroundColor: "#ff0000" }]}>
                <Ionicons name="logo-youtube" size={18} color="#ffffff" />
              </View>
              <Text style={styles.socialLabel}>YouTube</Text>
              <Text style={styles.socialValue} numberOfLines={1}>
                {settings?.youtube_url ? "Configuré" : "Non configuré"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#6b7280" />
          <Text style={styles.infoText}>
            Certains paramètres nécessitent des droits d'administrateur supérieurs pour être modifiés.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  accessDeniedText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
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
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  settingValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  toggleDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  socialLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  socialValue: {
    fontSize: 13,
    color: "#9ca3af",
    marginRight: 8,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f3f4f6",
    marginHorizontal: 20,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
});