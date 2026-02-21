/**
 * Écran Profil - Centre Chrétien de Réveil
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useUserStore } from "../../stores/userStore";
import { supabase } from "../../lib/supabase";
import { calculateProfileCompletion as calcCompletion } from "../../types/database";
import { ThemedCard } from "../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOWS,
  CHURCH_INFO,
} from "../../constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user, setUser, clearUser } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, any> | null>(null);

  // Charger le profil au montage
  useEffect(() => {
    loadProfile();
  }, []);

  // Fonction pour charger le profil depuis Supabase
  const loadProfile = async () => {
    try {
      // Récupérer l'utilisateur authentifié
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        console.log("Pas d'utilisateur authentifié");
        return;
      }

      // Récupérer le profil depuis la base de données
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Erreur chargement profil:", error);
        return;
      }

      if (profile) {
        setProfileData(profile);
        setUser(profile);
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  // Rafraîchir le profil
  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  // Obtenir les données à afficher (priorité au profileData frais)
  const displayData = profileData || user;

  // Calculer le nom complet
  const fullName = displayData
    ? `${displayData.first_name || ""} ${displayData.last_name || ""}`.trim()
    : "Chargement...";

  // Calculer les initiales
  const initials = displayData
    ? `${(displayData.first_name || "").charAt(0)}${(displayData.last_name || "").charAt(0)}`.toUpperCase()
    : "?";

  // Calculer l'année d'inscription
  const memberSince = displayData?.created_at
    ? new Date(displayData.created_at).getFullYear()
    : new Date().getFullYear();

  // Calculer la progression du profil (utilise la fonction centralisée de database.ts)
  const profileCompletion = displayData ? calcCompletion(displayData as any) : 0;

  // Déconnexion
  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            await signOut();
            clearUser();
            setIsLoading(false);
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: "Mon compte",
      items: [
        {
          icon: "person-outline",
          label: "Modifier mon profil",
          color: "#3B82F6",
          onPress: () => router.push("/(app)/profile/edit"),
        },
        {
          icon: "shield-checkmark-outline",
          label: "Sécurité",
          color: "#22C55E",
          onPress: () => {},
        },
        {
          icon: "notifications-outline",
          label: "Notifications",
          color: "#F59E0B",
          onPress: () => router.push("/(tabs)/notifications" as any),
        },
      ],
    },
    {
      title: "Activités",
      items: [
        {
          icon: "people-outline",
          label: "Ma Tribu",
          color: "#8B5CF6",
          onPress: () => router.push("/(tabs)/tribu" as any),
        },
        {
          icon: "school-outline",
          label: "Mes formations",
          color: "#EC4899",
          onPress: () => router.push("/(tabs)/formations" as any),
        },
        {
          icon: "wallet-outline",
          label: "Mes dons",
          color: COLORS.primary.gold,
          onPress: () => router.push("/(tabs)/finances" as any),
        },
      ],
    },
    {
      title: "Paramètres",
      items: [
        {
          icon: "language-outline",
          label: "Langue",
          color: "#6366F1",
          value: "Français",
          onPress: () => {},
        },
        {
          icon: "help-circle-outline",
          label: "Aide & Support",
          color: "#14B8A6",
          onPress: () => {},
        },
        {
          icon: "information-circle-outline",
          label: "À propos",
          color: "#6B7280",
          onPress: () => {},
        },
      ],
    },
  ];

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
        {/* Header avec avatar */}
        <LinearGradient
          colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
          style={styles.header}
        >
          <View style={styles.headerDecor} />

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {displayData?.photo_url ? (
              <Image
                source={{ uri: displayData.photo_url }}
                style={styles.avatar}
              />
            ) : (
              <LinearGradient
                colors={[COLORS.primary.gold, COLORS.primary.goldDark]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={COLORS.primary.gold} />
            </TouchableOpacity>
          </View>

          {/* Nom et rôle */}
          <Text style={styles.userName}>{fullName || "Utilisateur"}</Text>
          <Text style={styles.userRole}>{displayData?.role || "Fidèle"}</Text>

          {/* Badges */}
          <View style={styles.badgesRow}>
            {displayData?.is_baptized && (
              <View style={styles.badge}>
                <Ionicons name="water" size={14} color={COLORS.primary.gold} />
                <Text style={styles.badgeText}>Baptisé(e)</Text>
              </View>
            )}
            <View style={styles.badge}>
              <Ionicons name="calendar" size={14} color={COLORS.primary.gold} />
              <Text style={styles.badgeText}>Membre depuis {memberSince}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Progression profil */}
        {profileCompletion < 100 && (
          <View style={styles.section}>
            <ThemedCard variant="gold" style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Complétez votre profil</Text>
                <Text style={styles.progressPercent}>{profileCompletion}%</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[COLORS.primary.gold, COLORS.primary.goldLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${profileCompletion}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                Un profil complet aide votre communauté à mieux vous connaître
              </Text>
            </ThemedCard>
          </View>
        )}

        {/* Informations du profil */}
        <View style={styles.section}>
          <ThemedCard variant="default" style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informations</Text>
            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.text.tertiary} />
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{displayData?.email || "Non défini"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={18} color={COLORS.text.tertiary} />
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{displayData?.phone || "Non défini"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={COLORS.text.tertiary} />
              <Text style={styles.infoLabel}>Genre</Text>
              <Text style={styles.infoValue}>{displayData?.gender || "Non défini"}</Text>
            </View>
          </ThemedCard>
        </View>

        {/* Menus */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <ThemedCard variant="default" padding="none">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={item.onPress}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {"value" in item && (
                    <Text style={styles.menuValue}>{item.value}</Text>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={COLORS.neutral.border}
                  />
                </TouchableOpacity>
              ))}
            </ThemedCard>
          </View>
        ))}

        {/* Bouton déconnexion */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <Ionicons name="log-out-outline" size={22} color={COLORS.status.error} />
            <Text style={styles.logoutText}>
              {isLoading ? "Déconnexion..." : "Se déconnecter"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerChurch}>{CHURCH_INFO.name}</Text>
          <Text style={styles.footerSlogan}>{CHURCH_INFO.slogan}</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    alignItems: "center",
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
  avatarContainer: {
    position: "relative",
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: COLORS.neutral.white,
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.neutral.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },
  userName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  userRole: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary.goldLight,
    marginBottom: SPACING.md,
  },
  badgesRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHT.medium,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.tertiary,
    marginBottom: SPACING.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressCard: {
    padding: SPACING.lg,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  progressPercent: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.neutral.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  infoCard: {
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginLeft: SPACING.md,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
  },
  menuValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginRight: SPACING.sm,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.status.errorLight,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  logoutText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.status.error,
  },
  footer: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
  },
  footerChurch: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.secondary,
  },
  footerSlogan: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    fontStyle: "italic",
    marginTop: SPACING.xs,
  },
  footerVersion: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
    marginTop: SPACING.md,
  },
});