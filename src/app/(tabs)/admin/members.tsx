/**
 * Gestion des membres
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAdmin } from "../../../hooks/useAdmin";
import { MemberCard } from "../../../components/features/admin";
import { MemberListItem } from "../../../types/database";

type FilterStatus = "all" | "Active" | "Pending" | "Suspended";

export default function MembersScreen() {
  const router = useRouter();
  const {
    isAdmin,
    members,
    membersCount,
    isLoading,
    loadData,
    loadMembers,
    updateMemberStatus,
    updateMemberRole,
  } = useAdmin();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedMember, setSelectedMember] = useState<MemberListItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadMembers({
        status: filterStatus === "all" ? undefined : filterStatus,
        search: searchQuery || undefined,
        limit: 50,
      });
    }
  }, [filterStatus, searchQuery, isAdmin]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers({
      status: filterStatus === "all" ? undefined : filterStatus,
      search: searchQuery || undefined,
      limit: 50,
    });
    setRefreshing(false);
  };

  const handleMemberPress = (member: MemberListItem) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const handleStatusChange = async (newStatus: "Active" | "Pending" | "Suspended") => {
    if (!selectedMember) return;

    setIsUpdating(true);
    const success = await updateMemberStatus(selectedMember.id, newStatus);
    setIsUpdating(false);

    if (success) {
      Alert.alert("Succès", `Statut mis à jour : ${newStatus}`);
      setShowModal(false);
    }
  };

  const handleRoleChange = (newRole: string) => {
    if (!selectedMember) return;

    Alert.alert(
      "Changer le rôle",
      `Attribuer le rôle "${newRole}" à ${selectedMember.first_name} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            setIsUpdating(true);
            const success = await updateMemberRole(selectedMember.id, newRole);
            setIsUpdating(false);

            if (success) {
              Alert.alert("Succès", "Rôle mis à jour");
              setShowModal(false);
            }
          },
        },
      ]
    );
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "Active", label: "Actifs" },
    { key: "Pending", label: "En attente" },
    { key: "Suspended", label: "Suspendus" },
  ];

  const roles = [
    "Fidèle",
    "Serviteur",
    "Chef de Famille",
    "Mobilisateur",
    "Responsable de Département",
    "Berger",
    "Pasteur Assistant",
  ];

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membres</Text>
        <Text style={styles.memberCount}>{membersCount}</Text>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchText}
            placeholder="Rechercher un membre..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterButton,
                filterStatus === f.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilterStatus(f.key)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterStatus === f.key && styles.filterButtonTextActive,
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
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : members.length > 0 ? (
          members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onPress={() => handleMemberPress(member)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>Aucun membre trouvé</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal détail membre */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMember && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedMember.first_name} {selectedMember.last_name}
                  </Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Infos */}
                <View style={styles.modalInfo}>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={18} color="#6b7280" />
                    <Text style={styles.infoText}>{selectedMember.phone}</Text>
                  </View>
                  {selectedMember.email && (
                    <View style={styles.infoRow}>
                      <Ionicons name="mail-outline" size={18} color="#6b7280" />
                      <Text style={styles.infoText}>{selectedMember.email}</Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Ionicons name="person-outline" size={18} color="#6b7280" />
                    <Text style={styles.infoText}>
                      Rôle : {selectedMember.role || "Fidèle"}
                    </Text>
                  </View>
                  {selectedMember.tribu_name && (
                    <View style={styles.infoRow}>
                      <Ionicons name="people-outline" size={18} color="#6b7280" />
                      <Text style={styles.infoText}>
                        Tribu : {selectedMember.tribu_name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions statut */}
                <View style={styles.actionSection}>
                  <Text style={styles.actionTitle}>Changer le statut</Text>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        selectedMember.status === "Active" && styles.statusBtnActive,
                      ]}
                      onPress={() => handleStatusChange("Active")}
                      disabled={isUpdating}
                    >
                      <View style={[styles.statusDot, { backgroundColor: "#22c55e" }]} />
                      <Text style={styles.statusBtnText}>Actif</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        selectedMember.status === "Pending" && styles.statusBtnActive,
                      ]}
                      onPress={() => handleStatusChange("Pending")}
                      disabled={isUpdating}
                    >
                      <View style={[styles.statusDot, { backgroundColor: "#f59e0b" }]} />
                      <Text style={styles.statusBtnText}>En attente</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        selectedMember.status === "Suspended" && styles.statusBtnActive,
                      ]}
                      onPress={() => handleStatusChange("Suspended")}
                      disabled={isUpdating}
                    >
                      <View style={[styles.statusDot, { backgroundColor: "#ef4444" }]} />
                      <Text style={styles.statusBtnText}>Suspendu</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Actions rôle */}
                <View style={styles.actionSection}>
                  <Text style={styles.actionTitle}>Changer le rôle</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.rolesScroll}
                  >
                    {roles.map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleBtn,
                          selectedMember.role === role && styles.roleBtnActive,
                        ]}
                        onPress={() => handleRoleChange(role)}
                        disabled={isUpdating}
                      >
                        <Text
                          style={[
                            styles.roleBtnText,
                            selectedMember.role === role && styles.roleBtnTextActive,
                          ]}
                        >
                          {role}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {isUpdating && (
                  <ActivityIndicator
                    size="small"
                    color="#2563eb"
                    style={{ marginTop: 16 }}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  memberCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#2563eb",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalInfo: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
  },
  actionSection: {
    marginBottom: 20,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
  },
  statusButtons: {
    flexDirection: "row",
    gap: 10,
  },
  statusBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    gap: 6,
  },
  statusBtnActive: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  rolesScroll: {
    marginHorizontal: -4,
  },
  roleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    marginHorizontal: 4,
  },
  roleBtnActive: {
    backgroundColor: "#2563eb",
  },
  roleBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  roleBtnTextActive: {
    color: "#ffffff",
  },
});