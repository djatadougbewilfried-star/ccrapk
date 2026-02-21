/**
 * Dashboard Administration - Centre Chrétien de Réveil
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOWS,
} from "../../../constants/theme";
import { useAdmin } from "../../../hooks/useAdmin";

const { width } = Dimensions.get("window");

/**
 * Retourne un libellé relatif en français pour une date ISO.
 */
function formatRelativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `Il y a ${diffD}j`;
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Retourne un nom d'icône Ionicons selon le type d'entité / action.
 */
function getActivityIcon(
  action: string,
  entityType: string | null
): keyof typeof Ionicons.glyphMap {
  if (entityType === "donation" || action.toLowerCase().includes("don")) {
    return "wallet";
  }
  if (entityType === "member" || action.toLowerCase().includes("membre")) {
    return "person-add";
  }
  if (
    entityType === "validation" ||
    action.toLowerCase().includes("valid")
  ) {
    return "checkmark-circle";
  }
  if (entityType === "event" || action.toLowerCase().includes("événement")) {
    return "calendar";
  }
  if (
    entityType === "department" ||
    action.toLowerCase().includes("département")
  ) {
    return "people";
  }
  return "ellipse";
}

export default function AdminDashboardScreen() {
  const router = useRouter();

  const {
    isAdmin,
    stats,
    pendingValidations,
    recentActivity,
    isLoading,
    error,
    loadData,
    formatNumber,
    formatAmount,
  } = useAdmin();

  const onRefresh = async () => {
    await loadData();
  };

  const quickActions = [
    {
      id: "members",
      title: "Membres",
      icon: "people",
      color: "#3B82F6",
      count: stats ? formatNumber(stats.total_members) : undefined,
      route: "/(tabs)/admin/members",
    },
    {
      id: "validations",
      title: "Validations",
      icon: "checkmark-circle",
      color: "#F59E0B",
      count: pendingValidations.length > 0
        ? pendingValidations.length.toString()
        : undefined,
      route: "/(tabs)/admin/members",
    },
    {
      id: "finances",
      title: "Finances",
      icon: "wallet",
      color: "#22C55E",
      route: "/(tabs)/finances",
    },
    {
      id: "settings",
      title: "Paramètres",
      icon: "settings",
      color: "#6B7280",
      route: "/(tabs)/admin/settings",
    },
  ];

  // -------------------------------------------------------
  // Écran : accès refusé (non-admin)
  // -------------------------------------------------------
  if (!isLoading && !isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <View style={styles.accessDeniedIcon}>
            <Ionicons name="lock-closed" size={48} color={COLORS.text.tertiary} />
          </View>
          <Text style={styles.accessDeniedTitle}>Accès restreint</Text>
          <Text style={styles.accessDeniedText}>
            Cette section est réservée aux administrateurs et pasteurs.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------
  // Écran : chargement initial
  // -------------------------------------------------------
  if (isLoading && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary.gold} />
          <Text style={styles.loadingText}>Chargement du tableau de bord...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------
  // Écran : erreur
  // -------------------------------------------------------
  if (error && !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle"
              size={48}
              color={COLORS.status?.error ?? "#EF4444"}
            />
          </View>
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------
  // Écran principal
  // -------------------------------------------------------
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.gold}
          />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
          style={styles.header}
        >
          <View style={styles.headerDecor} />
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Administration</Text>
              <Text style={styles.headerSubtitle}>Dashboard pastoral</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push("/(tabs)/admin/settings" as any)}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Stats principales */}
          <View style={styles.mainStats}>
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatValue}>
                {stats ? stats.total_members.toLocaleString() : "--"}
              </Text>
              <Text style={styles.mainStatLabel}>Membres</Text>
              {stats && stats.new_members_this_month > 0 && (
                <View style={styles.mainStatBadge}>
                  <Ionicons name="trending-up" size={12} color="#22C55E" />
                  <Text style={styles.mainStatBadgeText}>
                    +{stats.new_members_this_month}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.mainStatDivider} />
            <View style={styles.mainStatCard}>
              <Text style={styles.mainStatValue}>
                {stats ? stats.total_servants.toLocaleString() : "--"}
              </Text>
              <Text style={styles.mainStatLabel}>Serviteurs</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                {action.count !== undefined && (
                  <Text style={styles.quickActionCount}>{action.count}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Finances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finances du mois</Text>
          <ThemedCard variant="gold" style={styles.financeCard}>
            <View style={styles.financeHeader}>
              <View style={styles.financeIcon}>
                <Ionicons name="wallet" size={28} color={COLORS.primary.gold} />
              </View>
              <View style={styles.financeContent}>
                <Text style={styles.financeAmount}>
                  {stats ? formatAmount(stats.donations_this_month) : "--"}
                </Text>
                <Text style={styles.financeLabel}>
                  {stats ? stats.donations_count_this_month : 0} dons reçus
                </Text>
              </View>
            </View>
          </ThemedCard>
        </View>

        {/* Répartition H/F */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répartition des membres</Text>
          <View style={styles.genderCards}>
            <ThemedCard variant="default" style={styles.genderCard}>
              <View style={[styles.genderIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="man" size={28} color="#3B82F6" />
              </View>
              <Text style={styles.genderValue}>
                {stats ? stats.total_men.toLocaleString() : "--"}
              </Text>
              <Text style={styles.genderLabel}>Hommes</Text>
            </ThemedCard>
            <ThemedCard variant="default" style={styles.genderCard}>
              <View style={[styles.genderIcon, { backgroundColor: "#FDF2F8" }]}>
                <Ionicons name="woman" size={28} color="#EC4899" />
              </View>
              <Text style={styles.genderValue}>
                {stats ? stats.total_women.toLocaleString() : "--"}
              </Text>
              <Text style={styles.genderLabel}>Femmes</Text>
            </ThemedCard>
          </View>
        </View>

        {/* Activité récente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {recentActivity.length === 0 ? (
            <ThemedCard variant="default">
              <Text style={styles.emptyText}>Aucune activité récente</Text>
            </ThemedCard>
          ) : (
            <ThemedCard variant="default" padding="none">
              {recentActivity.map((activity, index) => (
                <View
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    index < recentActivity.length - 1 && styles.activityItemBorder,
                  ]}
                >
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={getActivityIcon(activity.action, activity.entity_type)}
                      size={18}
                      color={COLORS.primary.gold}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityAction}>{activity.action}</Text>
                    <Text style={styles.activityName}>
                      {activity.description ?? activity.entity_type ?? ""}
                    </Text>
                  </View>
                  <Text style={styles.activityTime}>
                    {formatRelativeTime(activity.created_at)}
                  </Text>
                </View>
              ))}
            </ThemedCard>
          )}
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
  /* Chargement */
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  /* Erreur */
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.neutral.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.neutral.white,
  },
  /* Accès refusé */
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  accessDeniedIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.neutral.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  accessDeniedTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  accessDeniedText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  /* Header */
  header: {
    paddingHorizontal: SPACING.xl,
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: "rgba(255,255,255,0.8)",
    marginTop: SPACING.xs,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainStats: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  mainStatCard: {
    flex: 1,
    alignItems: "center",
  },
  mainStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: SPACING.lg,
  },
  mainStatValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.neutral.white,
  },
  mainStatLabel: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  mainStatBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
    gap: 4,
  },
  mainStatBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: "#22C55E",
  },
  /* Sections */
  section: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  /* Actions rapides */
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  quickActionCard: {
    width: (width - SPACING.xl * 2 - SPACING.md) / 2,
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.md,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  quickActionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  quickActionCount: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
    marginTop: SPACING.xs,
  },
  /* Finances */
  financeCard: {
    padding: SPACING.lg,
  },
  financeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  financeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary.goldSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  financeContent: {
    flex: 1,
  },
  financeAmount: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.text.primary,
  },
  financeLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  /* Répartition H/F */
  genderCards: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  genderCard: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.lg,
  },
  genderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  genderValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  genderLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  /* Activité récente */
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    textAlign: "center",
    paddingVertical: SPACING.lg,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.borderLight,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.goldSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
  },
  activityName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
});
