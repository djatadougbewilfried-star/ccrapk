/**
 * Dashboard Admin Patriarche - Centre Chrétien de Réveil
 * Vue d'ensemble pour la gestion de la Tribu
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTribu } from "../../../../hooks/useTribu";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function AdminDashboardScreen() {
  const {
    loading,
    myTribu,
    tribuMembers,
    pendingRequests,
    membersWithAlert,
    activities,
    rankings,
    loadTribuMembers,
    loadPendingRequests,
    loadMembersWithAlert,
    loadActivities,
    loadInitialData,
  } = useTribu();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTribuMembers();
    loadPendingRequests();
    loadMembersWithAlert();
    loadActivities();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    await loadTribuMembers();
    await loadPendingRequests();
    await loadMembersWithAlert();
    await loadActivities();
    setRefreshing(false);
  };

  const tribuColor = myTribu?.color || "#6366F1";
  const myRanking = rankings.findIndex((r) => r.tribu.id === myTribu?.id) + 1;

  // Calcul des stats
  const activeMembers = tribuMembers.filter((m) => m.status === "Active").length;
  const avgPresenceRate =
    tribuMembers.length > 0
      ? Math.round(
          tribuMembers.reduce(
            (sum, m) => sum + (m.attendance_stats?.presence_rate || 0),
            0
          ) / tribuMembers.length
        )
      : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={[tribuColor, adjustColor(tribuColor, -30)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-4 pb-6"
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">
            Administration
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/tribu/admin/parametres" as any)}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-white/80 text-sm">Patriarche de</Text>
        <Text className="text-white text-2xl font-bold">{myTribu?.name}</Text>

        {/* Stats rapides */}
        <View className="flex-row mt-4 -mx-1">
          <StatCard
            icon="people"
            value={activeMembers}
            label="Membres"
            light
          />
          <StatCard
            icon="trophy"
            value={`#${myRanking || "-"}`}
            label="Classement"
            light
          />
          <StatCard
            icon="checkmark-circle"
            value={`${avgPresenceRate}%`}
            label="Présence moy."
            light
          />
          <StatCard
            icon="star"
            value={myTribu?.total_points || 0}
            label="Points"
            light
          />
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-5 -mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Alertes critiques */}
        {(membersWithAlert.length > 0 || pendingRequests.length > 0) && (
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-gray-900 font-bold text-lg mb-3">
              🚨 Actions requises
            </Text>

            {pendingRequests.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/(app)/tribu/admin/demandes" as any)}
                className="flex-row items-center py-3 border-b border-gray-100"
              >
                <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center">
                  <Ionicons name="person-add" size={20} color="#F59E0B" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium">
                    {pendingRequests.length} demande(s) d'adhésion
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    En attente de validation
                  </Text>
                </View>
                <View className="bg-amber-500 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {pendingRequests.length}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {membersWithAlert.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push("/(app)/tribu/admin/alertes" as any)}
                className="flex-row items-center py-3"
              >
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                  <Ionicons name="warning" size={20} color="#EF4444" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium">
                    {membersWithAlert.length} membre(s) en alerte
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    3+ absences consécutives
                  </Text>
                </View>
                <View className="bg-red-500 px-2 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">
                    {membersWithAlert.length}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Menu de gestion */}
        <Text className="text-gray-500 text-sm font-medium mb-3">
          GESTION DE LA TRIBU
        </Text>

        <View className="flex-row flex-wrap justify-between mb-4">
          <AdminMenuItem
            icon="people"
            label="Membres"
            description={`${activeMembers} actifs`}
            color="#6366F1"
            onPress={() => router.push("/(app)/tribu/membres" as any)}
          />
          <AdminMenuItem
            icon="person-add"
            label="Demandes"
            description={`${pendingRequests.length} en attente`}
            color="#F59E0B"
            badge={pendingRequests.length}
            onPress={() => router.push("/(app)/tribu/admin/demandes" as any)}
          />
          <AdminMenuItem
            icon="warning"
            label="Alertes"
            description={`${membersWithAlert.length} membres`}
            color="#EF4444"
            badge={membersWithAlert.length}
            onPress={() => router.push("/(app)/tribu/admin/alertes" as any)}
          />
          <AdminMenuItem
            icon="checkbox"
            label="Présence"
            description="Gérer le pointage"
            color="#8B5CF6"
            onPress={() => router.push("/(app)/tribu/admin/presence" as any)}
          />
          <AdminMenuItem
            icon="calendar"
            label="Activités"
            description={`${activities.length} prévues`}
            color="#10B981"
            onPress={() => router.push("/(app)/tribu/admin/activites" as any)}
          />
          <AdminMenuItem
            icon="chatbubbles"
            label="Chat"
            description="Modération"
            color="#3B82F6"
            onPress={() => router.push("/(app)/tribu/chat" as any)}
          />
          <AdminMenuItem
            icon="settings"
            label="Paramètres"
            description="Personnalisation"
            color="#6B7280"
            onPress={() => router.push("/(app)/tribu/admin/parametres" as any)}
          />
          <AdminMenuItem
            icon="trophy"
            label="Classement"
            description={`#${myRanking} position`}
            color="#F59E0B"
            onPress={() => router.push("/(app)/tribu/classement" as any)}
          />
        </View>

        {/* Résumé des membres */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-900 font-bold text-lg">
              Résumé présence
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(app)/tribu/admin/presence" as any)}
            >
              <Text className="text-indigo-600 text-sm">Voir détails</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            <PresenceStat
              label="Excellente"
              sublabel="> 80%"
              value={tribuMembers.filter((m) => (m.attendance_stats?.presence_rate || 0) > 80).length}
              color="#22C55E"
            />
            <PresenceStat
              label="Moyenne"
              sublabel="50-80%"
              value={tribuMembers.filter((m) => {
                const rate = m.attendance_stats?.presence_rate || 0;
                return rate >= 50 && rate <= 80;
              }).length}
              color="#F59E0B"
            />
            <PresenceStat
              label="Faible"
              sublabel="< 50%"
              value={tribuMembers.filter((m) => (m.attendance_stats?.presence_rate || 0) < 50).length}
              color="#EF4444"
            />
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANTS
// ============================================

interface StatCardProps {
  icon: IoniconsName;
  value: string | number;
  label: string;
  light?: boolean;
}

function StatCard({ icon, value, label, light }: StatCardProps) {
  return (
    <View className="flex-1 mx-1 bg-white/20 rounded-xl p-3 items-center">
      <Ionicons name={icon} size={18} color={light ? "white" : "#6366F1"} />
      <Text className={`text-lg font-bold mt-1 ${light ? "text-white" : "text-gray-900"}`}>
        {value}
      </Text>
      <Text className={`text-xs ${light ? "text-white/80" : "text-gray-500"}`}>
        {label}
      </Text>
    </View>
  );
}

interface AdminMenuItemProps {
  icon: IoniconsName;
  label: string;
  description: string;
  color: string;
  badge?: number;
  onPress: () => void;
}

function AdminMenuItem({
  icon,
  label,
  description,
  color,
  badge,
  onPress,
}: AdminMenuItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-start justify-between">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {badge !== undefined && badge > 0 && (
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: color }}
          >
            <Text className="text-white text-xs font-bold">{badge}</Text>
          </View>
        )}
      </View>
      <Text className="text-gray-900 font-semibold mt-3">{label}</Text>
      <Text className="text-gray-500 text-sm">{description}</Text>
    </TouchableOpacity>
  );
}

interface PresenceStatProps {
  label: string;
  sublabel: string;
  value: number;
  color: string;
}

function PresenceStat({ label, sublabel, value, color }: PresenceStatProps) {
  return (
    <View className="items-center flex-1">
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-gray-900 text-sm font-medium">{label}</Text>
      <Text className="text-gray-400 text-xs">{sublabel}</Text>
    </View>
  );
}

// Helper
function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}