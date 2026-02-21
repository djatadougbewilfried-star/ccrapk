/**
 * Écran Ma Tribu - Centre Chrétien de Réveil
 * Dashboard principal de la Tribu de l'utilisateur
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTribu, useTribuRankings } from "../../../hooks/useTribu";
import { getTribuIcon, formatMemberName, getTribuConstantData } from "../../../services/tribu.service";

// Type pour les icônes Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function TribuScreen() {
  const {
    loading,
    error,
    myTribu,
    myMembership,
    hasTribu,
    isPending,
    isPatriarch,
    tribuMembers,
    pendingRequests,
    activities,
    myAttendanceStats,
    membersWithAlert,
    loadInitialData,
    loadTribuMembers,
    loadPendingRequests,
    loadActivities,
    loadMembersWithAlert,
  } = useTribu();

  const { currentRanking, rankings } = useTribuRankings();
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données au montage
  useEffect(() => {
    if (myTribu?.id) {
      loadTribuMembers();
      loadActivities();
      if (isPatriarch) {
        loadPendingRequests();
        loadMembersWithAlert();
      }
    }
  }, [myTribu?.id, isPatriarch]);

  // Rafraîchir
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    if (myTribu?.id) {
      await loadTribuMembers();
      await loadActivities();
      if (isPatriarch) {
        await loadPendingRequests();
        await loadMembersWithAlert();
      }
    }
    setRefreshing(false);
  };

  // Si pas de Tribu, afficher l'écran de choix
  if (!loading && !hasTribu && !isPending) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <NoTribuScreen />
      </SafeAreaView>
    );
  }

  // Si demande en attente
  if (!loading && isPending) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <PendingScreen tribu={myTribu} />
      </SafeAreaView>
    );
  }

  // Chargement
  if (loading && !myTribu) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-500 mt-4">Chargement de votre Tribu...</Text>
      </SafeAreaView>
    );
  }

  const tribuColor = myTribu?.color || "#6366F1";

  // Enrichir avec les données constantes (descriptions, icône par défaut)
  const tribuConstant = myTribu ? getTribuConstantData(myTribu.name) : undefined;
  const biblicalMeaning = myTribu?.biblical_meaning || tribuConstant?.description;
  const tribuIconName = getTribuIcon(myTribu?.icon || tribuConstant?.icon || null) as IoniconsName;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header avec gradient */}
        <LinearGradient
          colors={[tribuColor, adjustColor(tribuColor, -30)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
        >
          {/* Titre et settings */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center flex-1">
              <View className="bg-white/20 p-2 rounded-full mr-3">
                <Ionicons name={tribuIconName} size={24} color="white" />
              </View>
              <View>
                <Text className="text-white/80 text-sm">Ma Tribu</Text>
                <Text className="text-white text-2xl font-bold">
                  {myTribu?.name}
                </Text>
              </View>
            </View>
            {isPatriarch && (
              <TouchableOpacity
                onPress={() => router.push("/(app)/tribu/admin/parametres" as any)}
                className="bg-white/20 p-2 rounded-full"
              >
                <Ionicons name="settings-outline" size={24} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Signification biblique */}
          {biblicalMeaning && (
            <Text className="text-white/90 text-sm italic mb-4">
              "{biblicalMeaning}"
            </Text>
          )}

          {/* Slogan */}
          {myTribu?.slogan && (
            <View className="bg-white/20 rounded-xl px-4 py-3 mb-4">
              <Text className="text-white text-center font-semibold">
                🎯 {myTribu.slogan}
              </Text>
            </View>
          )}

          {/* Stats rapides */}
          <View className="flex-row justify-between">
            <StatBox
              icon="people"
              value={myTribu?.member_count || 0}
              label="Membres"
              light
            />
            <StatBox
              icon="trophy"
              value={`#${rankings.findIndex((r) => r.tribu.id === myTribu?.id) + 1 || "-"}`}
              label="Classement"
              light
            />
            <StatBox
              icon="star"
              value={myTribu?.total_points || 0}
              label="Points"
              light
            />
          </View>
        </LinearGradient>

        {/* Contenu */}
        <View className="px-5 -mt-4">
          {/* Carte Patriarche */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-gray-500 text-sm mb-3">
              {myTribu?.patriarch ? "Patriarche" : "Pas de Patriarche"}
            </Text>
            {myTribu?.patriarch ? (
              <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                  {myTribu.patriarch.photo_url ? (
                    <Image
                      source={{ uri: myTribu.patriarch.photo_url }}
                      className="w-14 h-14"
                    />
                  ) : (
                    <Ionicons name="person" size={30} color="#9CA3AF" />
                  )}
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-gray-900 font-semibold text-lg">
                    {formatMemberName(
                      myTribu.patriarch.first_name,
                      myTribu.patriarch.last_name
                    )}
                  </Text>
                  {myTribu.patriarch.phone && (
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="call-outline" size={14} color="#6366F1" />
                      <Text className="text-indigo-600 text-sm ml-1">
                        {myTribu.patriarch.phone}
                      </Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </View>
            ) : (
              <Text className="text-gray-400 italic">
                Aucun Patriarche assigné
              </Text>
            )}
          </View>

          {/* Alertes pour Patriarche */}
          {isPatriarch && membersWithAlert.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/tribu/admin/alertes" as any)}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4"
            >
              <View className="flex-row items-center">
                <View className="bg-red-100 p-2 rounded-full">
                  <Ionicons name="warning" size={24} color="#EF4444" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-red-800 font-semibold">
                    {membersWithAlert.length} membre(s) en alerte
                  </Text>
                  <Text className="text-red-600 text-sm">
                    3+ absences consécutives - Action requise
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EF4444" />
              </View>
            </TouchableOpacity>
          )}

          {/* Demandes en attente pour Patriarche */}
          {isPatriarch && pendingRequests.length > 0 && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/tribu/admin/demandes" as any)}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4"
            >
              <View className="flex-row items-center">
                <View className="bg-amber-100 p-2 rounded-full">
                  <Ionicons name="person-add" size={24} color="#F59E0B" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-amber-800 font-semibold">
                    {pendingRequests.length} demande(s) d'adhésion
                  </Text>
                  <Text className="text-amber-600 text-sm">
                    En attente de validation
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
              </View>
            </TouchableOpacity>
          )}

          {/* Actions rapides */}
          <Text className="text-gray-900 font-bold text-lg mb-3">
            Actions rapides
          </Text>
          <View className="flex-row flex-wrap justify-between mb-4">
            <ActionButton
              icon="people"
              label="Membres"
              color="#6366F1"
              onPress={() => router.push("/(app)/tribu/membres" as any)}
            />
            <ActionButton
              icon="chatbubbles"
              label="Chat"
              color="#10B981"
              onPress={() => router.push("/(app)/tribu/chat" as any)}
            />
            <ActionButton
              icon="calendar"
              label="Activités"
              color="#F59E0B"
              onPress={() => router.push("/(app)/tribu/activites" as any)}
            />
            <ActionButton
              icon="checkbox"
              label="Présence"
              color="#8B5CF6"
              onPress={() => router.push("/(app)/tribu/presence" as any)}
            />
          </View>

          {/* Ma présence */}
          {myAttendanceStats && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-900 font-bold text-lg">
                  Ma présence
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(app)/tribu/ma-presence" as any)}
                >
                  <Text className="text-indigo-600 text-sm">Voir tout</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-green-600">
                    {myAttendanceStats.presence_rate || 0}%
                  </Text>
                  <Text className="text-gray-500 text-xs">Taux présence</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-gray-900">
                    {myAttendanceStats.total_present || 0}
                  </Text>
                  <Text className="text-gray-500 text-xs">Présences</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-2xl font-bold text-red-500">
                    {myAttendanceStats.consecutive_absences || 0}
                  </Text>
                  <Text className="text-gray-500 text-xs">Absences consé.</Text>
                </View>
              </View>

              {myAttendanceStats.is_alert && (
                <View className="bg-red-50 rounded-xl p-3 mt-3">
                  <Text className="text-red-600 text-sm text-center">
                    ⚠️ Vous avez {myAttendanceStats.consecutive_absences} absences
                    consécutives
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Prochaines activités */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-900 font-bold text-lg">
                Prochaines activités
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(app)/tribu/activites" as any)}
              >
                <Text className="text-indigo-600 text-sm">Voir tout</Text>
              </TouchableOpacity>
            </View>

            {activities.length > 0 ? (
              activities.slice(0, 3).map((activity) => (
                <View
                  key={activity.id}
                  className="flex-row items-center py-3 border-b border-gray-100"
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${tribuColor}20` }}
                  >
                    <Ionicons
                      name={getActivityIcon(activity.activity_type) as IoniconsName}
                      size={20}
                      color={tribuColor}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-900 font-medium">
                      {activity.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {formatDate(activity.activity_date)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-gray-400 text-center py-4">
                Aucune activité prévue
              </Text>
            )}

            {isPatriarch && (
              <TouchableOpacity
                onPress={() => router.push("/(app)/tribu/activites/nouvelle" as any)}
                className="mt-3 py-3 border-t border-gray-100"
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="add-circle" size={20} color="#6366F1" />
                  <Text className="text-indigo-600 font-medium ml-2">
                    Créer une activité
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Flash Info - Classement */}
          {currentRanking && (
            <View className="bg-amber-50 rounded-2xl p-4 mb-4 border border-amber-200">
              <View className="flex-row items-center mb-2">
                <Ionicons name="trophy" size={20} color="#F59E0B" />
                <Text className="text-amber-800 font-bold ml-2">
                  Classement des Tribus
                </Text>
              </View>
              <View className="flex-row items-center">
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: currentRanking.tribu.color || "#6366F1" }}
                >
                  <Text className="text-white font-bold">
                    {currentRanking.position}
                  </Text>
                </View>
                <Text className="text-gray-900 font-medium flex-1">
                  {currentRanking.tribu.name}
                </Text>
                <View className="flex-row items-center">
                  {currentRanking.evolution === "up" && (
                    <Ionicons name="arrow-up" size={16} color="#22C55E" />
                  )}
                  {currentRanking.evolution === "down" && (
                    <Ionicons name="arrow-down" size={16} color="#EF4444" />
                  )}
                  <Text className="text-gray-600 ml-1">
                    {currentRanking.tribu.total_points} pts
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(app)/tribu/classement" as any)}
                className="mt-3"
              >
                <Text className="text-amber-600 text-center text-sm">
                  Voir le classement complet →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Vision de la Tribu */}
          {(myTribu?.vision || tribuConstant?.description) && (
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <Text className="text-gray-900 font-bold text-lg mb-2">
                {myTribu?.vision ? "Notre Vision" : "Identite biblique"}
              </Text>
              <Text className="text-gray-600 leading-6">
                {myTribu?.vision || tribuConstant?.description}
              </Text>
            </View>
          )}

          {/* Bouton changer de Tribu */}
          <TouchableOpacity
            onPress={() => router.push("/(app)/tribu/changer" as any)}
            className="mb-8"
          >
            <Text className="text-gray-400 text-center text-sm underline">
              Demander un changement de Tribu
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANTS AUXILIAIRES
// ============================================

function NoTribuScreen() {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="bg-indigo-100 p-6 rounded-full mb-6">
        <Ionicons name="people" size={64} color="#6366F1" />
      </View>
      <Text className="text-gray-900 text-2xl font-bold text-center mb-2">
        Rejoignez une Tribu
      </Text>
      <Text className="text-gray-500 text-center mb-8">
        Les Tribus sont des communautés fraternelles au sein de l'église.
        Choisissez votre Tribu pour participer aux activités et grandir ensemble.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(app)/tribu/choisir" as any)}
        className="bg-indigo-600 px-8 py-4 rounded-xl"
      >
        <Text className="text-white font-semibold text-lg">
          Choisir ma Tribu
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface PendingScreenProps {
  tribu: any;
}

function PendingScreen({ tribu }: PendingScreenProps) {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="bg-amber-100 p-6 rounded-full mb-6">
        <Ionicons name="hourglass" size={64} color="#F59E0B" />
      </View>
      <Text className="text-gray-900 text-2xl font-bold text-center mb-2">
        Demande en attente
      </Text>
      <Text className="text-gray-500 text-center mb-4">
        Votre demande d'adhésion à la Tribu{" "}
        <Text className="font-semibold" style={{ color: tribu?.color }}>
          {tribu?.name}
        </Text>{" "}
        est en cours de validation par le Patriarche.
      </Text>
      <View className="bg-amber-50 rounded-xl p-4 w-full">
        <Text className="text-amber-800 text-center">
          ⏳ Vous recevrez une notification dès que votre demande sera traitée.
        </Text>
      </View>
    </View>
  );
}

interface StatBoxProps {
  icon: IoniconsName;
  value: string | number;
  label: string;
  light?: boolean;
}

function StatBox({ icon, value, label, light = false }: StatBoxProps) {
  return (
    <View
      className={`items-center px-4 py-3 rounded-xl ${
        light ? "bg-white/20" : "bg-gray-100"
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={light ? "white" : "#6366F1"}
      />
      <Text
        className={`text-xl font-bold mt-1 ${
          light ? "text-white" : "text-gray-900"
        }`}
      >
        {value}
      </Text>
      <Text
        className={`text-xs ${light ? "text-white/80" : "text-gray-500"}`}
      >
        {label}
      </Text>
    </View>
  );
}

interface ActionButtonProps {
  icon: IoniconsName;
  label: string;
  color: string;
  onPress: () => void;
}

function ActionButton({ icon, label, color, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] bg-white rounded-2xl p-4 mb-3 shadow-sm"
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-gray-900 font-medium">{label}</Text>
    </TouchableOpacity>
  );
}

// ============================================
// HELPERS
// ============================================

function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    Prière: "hand-left",
    Sortie: "car",
    "Action caritative": "heart",
    "Étude biblique": "book",
    Fête: "gift",
    Repas: "restaurant",
    Sport: "football",
    Autre: "ellipse",
  };
  return icons[type] || "calendar";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("fr-FR", options);
}