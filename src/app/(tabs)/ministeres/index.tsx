/**
 * Écran Ministères/Départements - Centre Chrétien de Réveil
 * Liste tous les départements avec possibilité de rejoindre
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
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useDepartments } from "../../../hooks/useDepartments";
import { Department } from "../../../services/departments.service";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from "../../../constants/theme";

export default function MinisteresScreen() {
  const {
    departmentsByMinistere,
    userDepartments,
    isLoading,
    isMember,
    hasPendingRequest,
    getDepartmentStatus,
    remainingSlots,
    refresh,
  } = useDepartments();

  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMinistere, setSelectedMinistere] = useState<string | null>(null);

  // Rafraîchir
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Filtrer les départements par recherche
  const filterDepartments = (departments: Department[]) => {
    if (!searchQuery.trim()) return departments;
    const query = searchQuery.toLowerCase();
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(query) ||
        d.description?.toLowerCase().includes(query)
    );
  };

  // Obtenir l'icône
  const getIcon = (icon: string | null): string => {
    const icons: Record<string, string> = {
      door: "enter",
      shield: "shield",
      "hand-right": "hand-right",
      people: "people",
      clipboard: "clipboard",
      call: "call",
      happy: "happy",
      home: "home",
      megaphone: "megaphone",
      heart: "heart",
      sparkles: "sparkles",
      wine: "wine",
      "color-palette": "color-palette",
      body: "body",
      storefront: "storefront",
      business: "business",
      calculator: "calculator",
      "stats-chart": "stats-chart",
      brush: "brush",
      settings: "settings",
      "musical-notes": "musical-notes",
      "musical-note": "musical-note",
    };
    return icons[icon || ""] || "briefcase";
  };

  // Obtenir le badge de statut
  const renderStatusBadge = (departmentId: string) => {
    const status = getDepartmentStatus(departmentId);

    if (status === "member") {
      return (
        <View style={[styles.statusBadge, styles.memberBadge]}>
          <Ionicons name="checkmark-circle" size={12} color={COLORS.status.success} />
          <Text style={styles.memberBadgeText}>Membre</Text>
        </View>
      );
    }

    if (status === "pending") {
      return (
        <View style={[styles.statusBadge, styles.pendingBadge]}>
          <Ionicons name="time" size={12} color={COLORS.status.warning} />
          <Text style={styles.pendingBadgeText}>En attente</Text>
        </View>
      );
    }

    return null;
  };

  // Naviguer vers le détail
  const handleDepartmentPress = (department: Department) => {
    router.push({
      pathname: "/(app)/departement/[id]",
      params: { id: department.id },
    });
  };

  // Ministères disponibles
  const ministeres = departmentsByMinistere.map((m) => m.ministere);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Départements</Text>
        <Text style={styles.headerSubtitle}>
          {userDepartments.length} département{userDepartments.length > 1 ? "s" : ""} • {remainingSlots} place{remainingSlots > 1 ? "s" : ""} disponible{remainingSlots > 1 ? "s" : ""}
        </Text>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un département..."
            placeholderTextColor={COLORS.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filtres par ministère */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedMinistere === null && styles.filterChipActive,
          ]}
          onPress={() => setSelectedMinistere(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedMinistere === null && styles.filterChipTextActive,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        {ministeres.map((ministere) => (
          <TouchableOpacity
            key={ministere}
            style={[
              styles.filterChip,
              selectedMinistere === ministere && styles.filterChipActive,
            ]}
            onPress={() => setSelectedMinistere(ministere)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedMinistere === ministere && styles.filterChipTextActive,
              ]}
            >
              {ministere}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.gold}
          />
        }
      >
        {/* État de chargement */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary.gold} />
            <Text style={styles.loadingText}>Chargement des départements...</Text>
          </View>
        )}

        {/* Liste par ministère */}
        {!isLoading &&
          departmentsByMinistere
            .filter((m) => selectedMinistere === null || m.ministere === selectedMinistere)
            .map((ministereGroup) => {
              const filteredDepartments = filterDepartments(ministereGroup.departments);
              if (filteredDepartments.length === 0) return null;

              return (
                <View key={ministereGroup.ministere} style={styles.ministereSection}>
                  {/* En-tête ministère */}
                  <View style={styles.ministereHeader}>
                    <View style={styles.ministereIcon}>
                      <Ionicons
                        name={ministereGroup.ministere === "Louange" ? "musical-notes" : "briefcase"}
                        size={16}
                        color={COLORS.primary.gold}
                      />
                    </View>
                    <Text style={styles.ministereTitle}>
                      Ministère {ministereGroup.ministere === "Direction des Cultes" ? "de la " : "de la "}
                      {ministereGroup.ministere}
                    </Text>
                    <View style={styles.ministereBadge}>
                      <Text style={styles.ministereBadgeText}>
                        {filteredDepartments.length}
                      </Text>
                    </View>
                  </View>

                  {/* Grille des départements */}
                  <View style={styles.departmentsGrid}>
                    {filteredDepartments.map((department) => (
                      <TouchableOpacity
                        key={department.id}
                        style={styles.departmentCard}
                        onPress={() => handleDepartmentPress(department)}
                        activeOpacity={0.7}
                      >
                        {/* Badge de statut */}
                        {renderStatusBadge(department.id)}

                        {/* Icône */}
                        <View
                          style={[
                            styles.departmentIcon,
                            { backgroundColor: (department.color || COLORS.primary.gold) + "20" },
                          ]}
                        >
                          <Ionicons
                            name={getIcon(department.icon) as any}
                            size={24}
                            color={department.color || COLORS.primary.gold}
                          />
                        </View>

                        {/* Nom */}
                        <Text style={styles.departmentName} numberOfLines={2}>
                          {department.name}
                        </Text>

                        {/* Flèche */}
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={COLORS.text.tertiary}
                          style={styles.departmentArrow}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}

        {/* Message si aucun résultat */}
        {!isLoading && searchQuery && departmentsByMinistere.every(
          (m) => filterDepartments(m.departments).length === 0
        ) && (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color={COLORS.neutral.border} />
            <Text style={styles.emptyTitle}>Aucun résultat</Text>
            <Text style={styles.emptyText}>
              Aucun département ne correspond à "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Mes départements */}
        {!isLoading && userDepartments.length > 0 && !searchQuery && (
          <View style={styles.myDepartmentsSection}>
            <Text style={styles.sectionTitle}>Mes départements</Text>
            {userDepartments.map((dept) => (
              <ThemedCard
                key={dept.id}
                variant="default"
                style={styles.myDepartmentCard}
              >
                <TouchableOpacity
                  style={styles.myDepartmentRow}
                  onPress={() => handleDepartmentPress(dept)}
                >
                  <View
                    style={[
                      styles.myDepartmentIcon,
                      { backgroundColor: (dept.color || COLORS.primary.gold) + "20" },
                    ]}
                  >
                    <Ionicons
                      name={getIcon(dept.icon) as any}
                      size={20}
                      color={dept.color || COLORS.primary.gold}
                    />
                  </View>
                  <View style={styles.myDepartmentInfo}>
                    <Text style={styles.myDepartmentName}>{dept.name}</Text>
                    <Text style={styles.myDepartmentMinistere}>
                      {dept.ministere_name}
                    </Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Actif</Text>
                  </View>
                </TouchableOpacity>
              </ThemedCard>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text.primary,
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.neutral.white,
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary.gold,
    borderColor: COLORS.primary.gold,
  },
  filterChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: COLORS.neutral.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
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
  ministereSection: {
    marginTop: SPACING.lg,
  },
  ministereHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  ministereIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary.gold + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  ministereTitle: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  ministereBadge: {
    backgroundColor: COLORS.neutral.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  ministereBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
  },
  departmentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  departmentCard: {
    width: "48%",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: SPACING.xs,
    right: SPACING.xs,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    gap: 2,
  },
  memberBadge: {
    backgroundColor: COLORS.status.success + "20",
  },
  memberBadgeText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.status.success,
  },
  pendingBadge: {
    backgroundColor: COLORS.status.warning + "20",
  },
  pendingBadgeText: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.status.warning,
  },
  departmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  departmentName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.primary,
    textAlign: "center",
    minHeight: 36,
  },
  departmentArrow: {
    marginTop: SPACING.xs,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.secondary,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.tertiary,
    marginTop: SPACING.sm,
    textAlign: "center",
  },
  myDepartmentsSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  myDepartmentCard: {
    marginBottom: SPACING.sm,
  },
  myDepartmentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
  },
  myDepartmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  myDepartmentInfo: {
    flex: 1,
  },
  myDepartmentName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
  },
  myDepartmentMinistere: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: COLORS.status.success + "20",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  activeBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.status.success,
  },
});