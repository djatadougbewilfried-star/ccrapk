/**
 * Écran historique des dons
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFinances } from "../../../hooks/useFinances";
import { DonationHistoryCard } from "../../../components/features/finance";

type FilterType = "all" | "completed" | "pending" | "failed";

export default function HistoryScreen() {
  const router = useRouter();
  const { donations, isLoading, loadData, formatAmount } = useFinances();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredDonations = donations.filter((d) => {
    switch (filter) {
      case "completed":
        return d.payment_status === "completed";
      case "pending":
        return d.payment_status === "pending" || d.payment_status === "processing";
      case "failed":
        return d.payment_status === "failed" || d.payment_status === "cancelled";
      default:
        return true;
    }
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "completed", label: "Complétés" },
    { key: "pending", label: "En attente" },
    { key: "failed", label: "Échoués" },
  ];

  // Calculer le total des dons complétés
  const totalCompleted = donations
    .filter((d) => d.payment_status === "completed")
    .reduce((sum, d) => sum + d.amount, 0);

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
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
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Résumé */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total des dons</Text>
        <Text style={styles.summaryAmount}>{formatAmount(totalCompleted)}</Text>
        <Text style={styles.summaryCount}>
          {donations.filter((d) => d.payment_status === "completed").length} transactions
        </Text>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterButton,
                filter === f.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filter === f.key && styles.filterButtonTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Liste */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredDonations.length > 0 ? (
          <View style={styles.listContent}>
            {filteredDonations.map((donation) => (
              <DonationHistoryCard key={donation.id} donation={donation} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun don trouvé</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
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
    backgroundColor: "#22c55e",
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterButtonActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 12,
  },
});