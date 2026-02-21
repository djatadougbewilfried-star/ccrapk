/**
 * Écran Formations - Centre Chrétien de Réveil
 * Liste toutes les formations disponibles
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFormations } from "../../../hooks/useFormations";
import { Formation } from "../../../services/formations.service";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";

export default function FormationsScreen() {
  const {
    formations,
    activeEnrollments,
    completedEnrollments,
    isLoading,
    getFormationStatus,
    getEnrollmentProgressPercent,
    refresh,
  } = useFormations();

  const [refreshing, setRefreshing] = useState(false);

  // Rafraîchir
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Obtenir l'icône
  const getIcon = (icon: string | null): string => {
    const icons: Record<string, string> = {
      school: "school",
      water: "water",
      people: "people",
      globe: "globe",
    };
    return icons[icon || ""] || "book";
  };

  // Obtenir le badge de statut
  const renderStatusBadge = (formationId: string) => {
    const status = getFormationStatus(formationId);

    const badges: Record<string, { label: string; color: string; icon: string }> = {
      completed: { label: "Terminé", color: COLORS.status.success, icon: "checkmark-circle" },
      in_progress: { label: "En cours", color: COLORS.secondary.blue, icon: "play-circle" },
      approved: { label: "Validé", color: COLORS.status.success, icon: "checkmark" },
      pending: { label: "En attente", color: COLORS.status.warning, icon: "time" },
      access_pending: { label: "Demande envoyée", color: COLORS.status.warning, icon: "time" },
      access_rejected: { label: "Refusé", color: COLORS.status.error, icon: "close-circle" },
    };

    const badge = badges[status];
    if (!badge) return null;

    return (
      <View style={[styles.statusBadge, { backgroundColor: badge.color + "20" }]}>
        <Ionicons name={badge.icon as any} size={12} color={badge.color} />
        <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.label}</Text>
      </View>
    );
  };

  // Naviguer vers le détail
  const handleFormationPress = (formation: Formation) => {
    router.push({
      pathname: "/(app)/formation/[id]",
      params: { id: formation.id },
    });
  };

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
        {/* Header */}
        <LinearGradient
          colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Formations</Text>
          <Text style={styles.headerSubtitle}>
            Grandissez dans la foi et le service
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeEnrollments.length}</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedEnrollments.length}</Text>
              <Text style={styles.statLabel}>Terminées</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formations.length}</Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* État de chargement */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary.gold} />
              <Text style={styles.loadingText}>Chargement des formations...</Text>
            </View>
          )}

          {/* Mes formations en cours */}
          {!isLoading && activeEnrollments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mes formations en cours</Text>
              {activeEnrollments.map((enrollment) => {
                const formation = enrollment.formation;
                if (!formation) return null;

                return (
                  <TouchableOpacity
                    key={enrollment.id}
                    onPress={() => handleFormationPress(formation)}
                  >
                    <ThemedCard variant="default" style={styles.enrollmentCard}>
                      <View style={styles.enrollmentRow}>
                        <View
                          style={[
                            styles.enrollmentIcon,
                            { backgroundColor: (formation.color || COLORS.primary.gold) + "20" },
                          ]}
                        >
                          <Ionicons
                            name={getIcon(formation.icon) as any}
                            size={24}
                            color={formation.color || COLORS.primary.gold}
                          />
                        </View>
                        <View style={styles.enrollmentInfo}>
                          <Text style={styles.enrollmentName}>{formation.name}</Text>
                          <Text style={styles.enrollmentSession}>
                            {enrollment.session?.name || "Session en cours"}
                          </Text>
                        </View>
                        {renderStatusBadge(formation.id)}
                      </View>
                      {/* Barre de progression */}
                      {(() => {
                        const progressPercent = getEnrollmentProgressPercent(enrollment.id);
                        return (
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <View
                                style={[
                                  styles.progressFill,
                                  {
                                    width: `${progressPercent}%`,
                                    backgroundColor: formation.color || COLORS.primary.gold,
                                  },
                                ]}
                              />
                            </View>
                            <Text style={styles.progressText}>{progressPercent}%</Text>
                          </View>
                        );
                      })()}
                    </ThemedCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Toutes les formations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Toutes les formations</Text>
            {!isLoading &&
              formations.map((formation) => (
                <TouchableOpacity
                  key={formation.id}
                  onPress={() => handleFormationPress(formation)}
                  activeOpacity={0.7}
                >
                  <ThemedCard variant="default" style={styles.formationCard}>
                    <View style={styles.formationHeader}>
                      <View
                        style={[
                          styles.formationIcon,
                          { backgroundColor: (formation.color || COLORS.primary.gold) + "20" },
                        ]}
                      >
                        <Ionicons
                          name={getIcon(formation.icon) as any}
                          size={28}
                          color={formation.color || COLORS.primary.gold}
                        />
                      </View>
                      <View style={styles.formationInfo}>
                        <View style={styles.formationTitleRow}>
                          <Text style={styles.formationName}>{formation.name}</Text>
                          {formation.is_mandatory && (
                            <View style={styles.mandatoryBadge}>
                              <Text style={styles.mandatoryBadgeText}>Obligatoire</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.formationType}>{formation.type}</Text>
                        <View style={styles.formationMeta}>
                          <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color={COLORS.text.tertiary} />
                            <Text style={styles.metaText}>{formation.duration_months} mois</Text>
                          </View>
                          {formation.requires_pastor_approval && (
                            <View style={styles.metaItem}>
                              <Ionicons name="key-outline" size={14} color={COLORS.status.warning} />
                              <Text style={[styles.metaText, { color: COLORS.status.warning }]}>
                                Sur recommandation
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {renderStatusBadge(formation.id)}
                    </View>
                    <Text style={styles.formationDescription} numberOfLines={2}>
                      {formation.description}
                    </Text>
                    <View style={styles.formationFooter}>
                      <Text style={styles.viewMore}>Voir les détails</Text>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primary.gold} />
                    </View>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
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
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary.goldLight,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
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
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.tertiary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  enrollmentCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  enrollmentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  enrollmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  enrollmentInfo: {
    flex: 1,
  },
  enrollmentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  enrollmentSession: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  progressBar: {
    flex: 1,
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
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    minWidth: 35,
  },
  formationCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  formationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  formationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  formationInfo: {
    flex: 1,
  },
  formationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  formationName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  mandatoryBadge: {
    backgroundColor: COLORS.status.error + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  mandatoryBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.status.error,
  },
  formationType: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  formationMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.semibold,
  },
  formationDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginTop: SPACING.md,
  },
  formationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.borderLight,
  },
  viewMore: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary.gold,
  },
});