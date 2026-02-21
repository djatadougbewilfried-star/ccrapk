/**
 * Écran des départements de l'utilisateur
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMinisteres } from "../../../hooks/useMinisteres";

export default function MyDepartmentsScreen() {
  const router = useRouter();
  const {
    userDepartments,
    departments,
    isLoading,
    loadData,
    leaveDepartment,
    getIconName,
  } = useMinisteres();

  const [refreshing, setRefreshing] = useState(false);
  const [isLeaving, setIsLeaving] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLeaveDepartment = async (departmentId: string, departmentName: string) => {
    Alert.alert(
      "Quitter le département",
      `Voulez-vous vraiment quitter le département "${departmentName}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Quitter",
          style: "destructive",
          onPress: async () => {
            setIsLeaving(departmentId);
            await leaveDepartment(departmentId);
            setIsLeaving(null);
          },
        },
      ]
    );
  };

  // Enrichir les userDepartments avec les infos du département
  const enrichedDepartments = userDepartments
    .filter((ud) => ud.status === "active")
    .map((ud) => {
      const dept = departments.find((d) => d.id === ud.department_id);
      return { ...ud, departmentInfo: dept };
    })
    .filter((ud) => ud.departmentInfo);

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
        <Text style={styles.headerTitle}>Mes départements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Résumé */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="briefcase" size={32} color="#2563eb" />
          </View>
          <Text style={styles.summaryNumber}>{enrichedDepartments.length}</Text>
          <Text style={styles.summaryLabel}>
            département{enrichedDepartments.length > 1 ? "s" : ""} actif{enrichedDepartments.length > 1 ? "s" : ""}
          </Text>
          <Text style={styles.summaryHint}>Maximum 5 départements</Text>
        </View>

        {/* Liste des départements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos engagements</Text>

          {enrichedDepartments.length > 0 ? (
            enrichedDepartments.map((item) => {
              const dept = item.departmentInfo!;
              return (
                <View key={item.id} style={styles.departmentCard}>
                  <View style={[styles.deptIcon, { backgroundColor: `${dept.color}15` }]}>
                    <Ionicons
                      name={getIconName(dept.icon) as any}
                      size={24}
                      color={dept.color}
                    />
                  </View>
                  <View style={styles.deptContent}>
                    <Text style={styles.deptName}>{dept.name}</Text>
                    <View style={styles.deptMeta}>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>
                          {item.role === "responsable"
                            ? "Responsable"
                            : item.role === "assistant"
                            ? "Assistant"
                            : "Serviteur"}
                        </Text>
                      </View>
                      <Text style={styles.deptDate}>
                        Depuis {new Date(item.joined_at).toLocaleDateString("fr-FR", {
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    {dept.meeting_day && (
                      <View style={styles.meetingInfo}>
                        <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                        <Text style={styles.meetingText}>
                          Réunion : {dept.meeting_day}
                          {dept.meeting_time && ` à ${dept.meeting_time.substring(0, 5)}`}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.leaveButton}
                    onPress={() => handleLeaveDepartment(dept.id, dept.name)}
                    disabled={isLeaving === dept.id}
                  >
                    {isLeaving === dept.id ? (
                      <ActivityIndicator size="small" color="#dc2626" />
                    ) : (
                      <Ionicons name="exit-outline" size={20} color="#dc2626" />
                    )}
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>
                Vous n'êtes membre d'aucun département
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push("/(tabs)/ministeres" as any)}
              >
                <Text style={styles.exploreButtonText}>Explorer les ministères</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Info */}
        {enrichedDepartments.length > 0 && enrichedDepartments.length < 5 && (
          <View style={styles.infoCard}>
            <Ionicons name="add-circle" size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              Vous pouvez encore rejoindre {5 - enrichedDepartments.length} département{5 - enrichedDepartments.length > 1 ? "s" : ""}.
            </Text>
          </View>
        )}

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
  summaryCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: "#2563eb",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  departmentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  deptIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  deptContent: {
    flex: 1,
  },
  deptName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  deptMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
  },
  deptDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  meetingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  meetingText: {
    fontSize: 12,
    color: "#6b7280",
  },
  leaveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
  },
});