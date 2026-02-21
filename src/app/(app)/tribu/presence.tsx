/**
 * Écran Présence - Centre Chrétien de Réveil
 * Auto-pointage GPS et sessions de présence
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useTribu } from "../../../hooks/useTribu";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function PresenceScreen() {
  const {
    myTribu,
    isPatriarch,
    activeSessions,
    myAttendanceStats,
    loadActiveSessions,
    checkInWithGPS,
  } = useTribu();

  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    loadActiveSessions();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission requise",
        "L'accès à la localisation est nécessaire pour le pointage automatique."
      );
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveSessions();
    await requestLocationPermission();
    setRefreshing(false);
  };

  const handleCheckIn = async (sessionId: string) => {
    if (!location) {
      Alert.alert("Erreur", "Impossible d'obtenir votre position GPS.");
      return;
    }

    setCheckingIn(sessionId);

    const result = await checkInWithGPS(
      sessionId,
      location.coords.latitude,
      location.coords.longitude
    );

    if (result.success) {
      Alert.alert(
        "Pointage réussi ! ✅",
        `Vous avez été marqué présent. Distance: ${result.distance || 0}m`
      );
      await loadActiveSessions();
    } else {
      Alert.alert("Échec du pointage", result.error || "Une erreur est survenue");
    }

    setCheckingIn(null);
  };

  const tribuColor = myTribu?.color || "#6366F1";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-gray-900 text-xl font-bold">Présence</Text>
          </View>

          {isPatriarch && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/tribu/presence/nouvelle" as any)}
              className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white font-medium ml-1">Nouvelle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Ma présence stats */}
        {myAttendanceStats && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <Text className="text-gray-900 font-bold text-lg mb-3">
              Mes statistiques
            </Text>
            <View className="flex-row justify-between">
              <StatItem
                value={`${myAttendanceStats.presence_rate || 0}%`}
                label="Taux présence"
                color="#22C55E"
              />
              <StatItem
                value={myAttendanceStats.total_present || 0}
                label="Présences"
                color="#6366F1"
              />
              <StatItem
                value={myAttendanceStats.total_absent || 0}
                label="Absences"
                color="#EF4444"
              />
              <StatItem
                value={myAttendanceStats.total_late || 0}
                label="Retards"
                color="#F59E0B"
              />
            </View>

            {myAttendanceStats.is_alert && (
              <View className="bg-red-50 rounded-xl p-3 mt-3">
                <Text className="text-red-600 text-sm text-center">
                  ⚠️ {myAttendanceStats.consecutive_absences} absences consécutives
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Sessions actives */}
        <Text className="text-gray-500 text-sm font-medium mb-3">
          SESSIONS DE POINTAGE ACTIVES
        </Text>

        {activeSessions.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-center">
              Aucune session de pointage active
            </Text>
          </View>
        ) : (
          activeSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              tribuColor={tribuColor}
              onCheckIn={() => handleCheckIn(session.id)}
              isCheckingIn={checkingIn === session.id}
              hasLocation={!!location}
            />
          ))
        )}

        {/* Bouton admin */}
        {isPatriarch && (
          <TouchableOpacity
            onPress={() => router.push("/(app)/tribu/admin/presence" as any)}
            className="mt-4 py-4 border border-gray-200 rounded-xl"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="clipboard" size={20} color="#6366F1" />
              <Text className="text-indigo-600 font-medium ml-2">
                Gérer les présences (Patriarche)
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANTS
// ============================================

interface StatItemProps {
  value: string | number;
  label: string;
  color: string;
}

function StatItem({ value, label, color }: StatItemProps) {
  return (
    <View className="items-center">
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
      <Text className="text-gray-500 text-xs">{label}</Text>
    </View>
  );
}

interface SessionCardProps {
  session: any;
  tribuColor: string;
  onCheckIn: () => void;
  isCheckingIn: boolean;
  hasLocation: boolean;
}

function SessionCard({
  session,
  tribuColor,
  onCheckIn,
  isCheckingIn,
  hasLocation,
}: SessionCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-start">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${tribuColor}20` }}
        >
          <Ionicons
            name={getEventIcon(session.event_type) as IoniconsName}
            size={24}
            color={tribuColor}
          />
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-gray-900 font-bold">{session.event_name}</Text>
          <Text className="text-gray-500 text-sm">{session.event_type}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm ml-1">
              {formatDate(session.event_date)}
            </Text>
          </View>
          {session.location_name && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm ml-1">
                {session.location_name}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Bouton pointage */}
      <TouchableOpacity
        onPress={onCheckIn}
        disabled={isCheckingIn || !hasLocation}
        className="mt-4 py-3 rounded-xl flex-row items-center justify-center"
        style={{
          backgroundColor: hasLocation ? tribuColor : "#E5E7EB",
        }}
      >
        {isCheckingIn ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Ionicons
              name="location"
              size={20}
              color={hasLocation ? "white" : "#9CA3AF"}
            />
            <Text
              className={`font-semibold ml-2 ${
                hasLocation ? "text-white" : "text-gray-400"
              }`}
            >
              {hasLocation ? "Je suis présent" : "GPS non disponible"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    "Culte dimanche": "home",
    "Culte semaine": "book",
    "Activité Tribu": "people",
    Formation: "school",
    Croisade: "megaphone",
    Veillée: "moon",
    Autre: "calendar",
  };
  return icons[type] || "calendar";
}