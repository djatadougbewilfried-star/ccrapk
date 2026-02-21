/**
 * Écran Liste des Membres - Centre Chrétien de Réveil
 * Affiche tous les membres de la Tribu avec indicateur d'alerte
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTribu } from "../../../hooks/useTribu";
import { formatMemberName, getTribuIcon, getTribuConstantData } from "../../../services/tribu.service";
import type { TribuMember } from "../../../services/tribu.service";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function MembresScreen() {
  const {
    loading,
    myTribu,
    tribuMembers,
    isPatriarch,
    loadTribuMembers,
  } = useTribu();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMembers, setFilteredMembers] = useState<TribuMember[]>([]);

  // Charger au montage
  useEffect(() => {
    loadTribuMembers();
  }, []);

  // Filtrer les membres
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(tribuMembers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMembers(
        tribuMembers.filter((member) => {
          const fullName = `${member.profile?.first_name} ${member.profile?.last_name}`.toLowerCase();
          const phone = member.profile?.phone?.toLowerCase() || "";
          const city = member.profile?.city?.toLowerCase() || "";
          return fullName.includes(query) || phone.includes(query) || city.includes(query);
        })
      );
    }
  }, [searchQuery, tribuMembers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTribuMembers();
    setRefreshing(false);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\s/g, "").replace(/^\+/, "");
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const tribuColor = myTribu?.color || "#6366F1";
  const tribuConstant = myTribu ? getTribuConstantData(myTribu.name) : undefined;
  const tribuIconName = getTribuIcon(myTribu?.icon || tribuConstant?.icon || null) as IoniconsName;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: tribuColor }}
          >
            <Ionicons name={tribuIconName} size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 text-xl font-bold">
              Membres de {myTribu?.name}
            </Text>
            <Text className="text-gray-500 text-sm">
              {tribuMembers.length} membres actifs
            </Text>
          </View>
        </View>

        {/* Barre de recherche */}
        <View className="flex-row items-center bg-white rounded-xl px-4 py-3 mb-4 shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Rechercher un membre..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Liste des membres */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && tribuMembers.length === 0 ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color={tribuColor} />
          </View>
        ) : filteredMembers.length === 0 ? (
          <View className="py-10 items-center">
            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4">
              {searchQuery ? "Aucun membre trouvé" : "Aucun membre dans cette Tribu"}
            </Text>
          </View>
        ) : (
          filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              tribuColor={tribuColor}
              isPatriarch={isPatriarch}
              onCall={handleCall}
              onWhatsApp={handleWhatsApp}
            />
          ))
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANT CARTE MEMBRE
// ============================================

interface MemberCardProps {
  member: TribuMember;
  tribuColor: string;
  isPatriarch: boolean;
  onCall: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
}

function MemberCard({
  member,
  tribuColor,
  isPatriarch,
  onCall,
  onWhatsApp,
}: MemberCardProps) {
  const profile = member.profile;
  const stats = member.attendance_stats;
  const isAlert = stats?.is_alert || false;
  const consecutiveAbsences = stats?.consecutive_absences || 0;

  return (
    <View
      className={`bg-white rounded-2xl p-4 mb-3 shadow-sm ${
        isAlert ? "border-2 border-red-400" : ""
      }`}
    >
      <View className="flex-row items-center">
        {/* Avatar */}
        <View className="relative">
          <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
            {profile?.photo_url ? (
              <Image
                source={{ uri: profile.photo_url }}
                className="w-14 h-14"
              />
            ) : (
              <Ionicons name="person" size={28} color="#9CA3AF" />
            )}
          </View>
          {isAlert && (
            <View className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">!</Text>
            </View>
          )}
        </View>

        {/* Infos */}
        <View className="flex-1 ml-3">
          <Text className="text-gray-900 font-semibold text-lg">
            {formatMemberName(profile?.first_name, profile?.last_name)}
          </Text>
          
          {profile?.city && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm ml-1">
                {profile.neighborhood ? `${profile.neighborhood}, ` : ""}
                {profile.city}
              </Text>
            </View>
          )}

          {/* Alerte absences */}
          {isAlert && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="warning" size={14} color="#EF4444" />
              <Text className="text-red-500 text-sm ml-1 font-medium">
                {consecutiveAbsences} absences consécutives
              </Text>
            </View>
          )}
        </View>

        {/* Actions contact */}
        {profile?.phone && (
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => onCall(profile.phone!)}
              className="bg-green-100 p-2 rounded-full mr-2"
            >
              <Ionicons name="call" size={20} color="#22C55E" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onWhatsApp(profile.phone!)}
              className="bg-green-100 p-2 rounded-full"
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Stats de présence (visible par Patriarche) */}
      {isPatriarch && stats && stats.total_sessions > 0 && (
        <View className="flex-row mt-3 pt-3 border-t border-gray-100">
          <View className="flex-1 items-center">
            <Text className="text-green-600 font-bold">
              {stats.presence_rate || 0}%
            </Text>
            <Text className="text-gray-400 text-xs">Présence</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-gray-900 font-bold">{stats.total_present}</Text>
            <Text className="text-gray-400 text-xs">Présent</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-red-500 font-bold">{stats.total_absent}</Text>
            <Text className="text-gray-400 text-xs">Absent</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-amber-500 font-bold">{stats.total_late}</Text>
            <Text className="text-gray-400 text-xs">Retard</Text>
          </View>
        </View>
      )}
    </View>
  );
}