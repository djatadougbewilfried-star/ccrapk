/**
 * Gestion des Alertes - Centre Chrétien de Réveil
 * Membres avec 3+ absences consécutives
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTribu } from "../../../../hooks/useTribu";
import { formatMemberName } from "../../../../services/tribu.service";

export default function AlertesScreen() {
  const {
    myTribu,
    membersWithAlert,
    loadMembersWithAlert,
    getMemberAttendanceHistory,
  } = useTribu();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [memberHistory, setMemberHistory] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadMembersWithAlert();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembersWithAlert();
    setRefreshing(false);
  };

  const handleExpandMember = async (userId: string) => {
    if (expandedMember === userId) {
      setExpandedMember(null);
      return;
    }

    setExpandedMember(userId);

    // Charger l'historique si pas encore chargé
    if (!memberHistory[userId]) {
      const result = await getMemberAttendanceHistory(userId, 10);
      if (result.success && result.data) {
        setMemberHistory((prev) => ({
          ...prev,
          [userId]: result.data!,
        }));
      }
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWhatsApp = (phone: string) => {
    const formattedPhone = phone.replace(/\s/g, "").replace(/^\+/, "");
    Linking.openURL(`whatsapp://send?phone=${formattedPhone}`);
  };

  const tribuColor = myTribu?.color || "#6366F1";

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-gray-900 text-xl font-bold">
              Membres en alerte
            </Text>
            <Text className="text-gray-500 text-sm">
              {membersWithAlert.length} membre(s) avec 3+ absences
            </Text>
          </View>
        </View>

        {/* Info */}
        <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
          <View className="flex-row items-start">
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text className="text-red-700 text-sm ml-2 flex-1">
              Ces membres ont au moins 3 absences consécutives. Une action pastorale est recommandée.
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {membersWithAlert.length === 0 ? (
          <View className="py-20 items-center">
            <View className="bg-green-100 p-6 rounded-full mb-4">
              <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2">
              Aucune alerte
            </Text>
            <Text className="text-gray-500 text-center">
              Tous les membres de la Tribu sont assidus. Félicitations !
            </Text>
          </View>
        ) : (
          membersWithAlert.map((member) => (
            <AlertCard
              key={member.user_id}
              member={member}
              tribuColor={tribuColor}
              isExpanded={expandedMember === member.user_id}
              history={memberHistory[member.user_id]}
              onToggle={() => handleExpandMember(member.user_id)}
              onCall={() => member.phone && handleCall(member.phone)}
              onWhatsApp={() => member.phone && handleWhatsApp(member.phone)}
            />
          ))
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANT CARTE ALERTE
// ============================================

interface AlertCardProps {
  member: any;
  tribuColor: string;
  isExpanded: boolean;
  history?: any[];
  onToggle: () => void;
  onCall: () => void;
  onWhatsApp: () => void;
}

function AlertCard({
  member,
  tribuColor,
  isExpanded,
  history,
  onToggle,
  onCall,
  onWhatsApp,
}: AlertCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "#22C55E";
      case "late":
        return "#F59E0B";
      case "absent":
        return "#EF4444";
      default:
        return "#9CA3AF";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "present":
        return "Présent";
      case "late":
        return "Retard";
      case "absent":
        return "Absent";
      default:
        return "-";
    }
  };

  return (
    <View className="bg-white rounded-2xl mb-3 shadow-sm border-l-4 border-red-500 overflow-hidden">
      {/* En-tête cliquable */}
      <TouchableOpacity onPress={onToggle} className="p-4">
        <View className="flex-row items-center">
          <View className="relative">
            <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
              {member.photo_url ? (
                <Image source={{ uri: member.photo_url }} className="w-14 h-14" />
              ) : (
                <Ionicons name="person" size={28} color="#9CA3AF" />
              )}
            </View>
            <View className="absolute -bottom-1 -right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white text-xs font-bold">
                {member.consecutive_absences}
              </Text>
            </View>
          </View>

          <View className="flex-1 ml-3">
            <Text className="text-gray-900 font-bold text-lg">
              {formatMemberName(member.first_name, member.last_name)}
            </Text>
            <Text className="text-red-600 text-sm font-medium">
              {member.consecutive_absences} absences consécutives
            </Text>
            <Text className="text-gray-500 text-sm">
              Taux de présence: {member.presence_rate || 0}%
            </Text>
          </View>

          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#9CA3AF"
          />
        </View>
      </TouchableOpacity>

      {/* Contenu étendu */}
      {isExpanded && (
        <View className="px-4 pb-4 border-t border-gray-100">
          {/* Actions de contact */}
          <View className="flex-row py-3 space-x-3">
            <TouchableOpacity
              onPress={onCall}
              className="flex-1 bg-green-50 py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="call" size={20} color="#22C55E" />
              <Text className="text-green-700 font-medium ml-2">Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onWhatsApp}
              className="flex-1 bg-green-50 py-3 rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text className="text-green-700 font-medium ml-2">WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Historique */}
          <Text className="text-gray-500 text-sm font-medium mb-2 mt-2">
            HISTORIQUE RÉCENT
          </Text>

          {history ? (
            history.length > 0 ? (
              history.map((record, index) => (
                <View
                  key={record.id || index}
                  className="flex-row items-center py-2 border-b border-gray-50"
                >
                  <View
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: getStatusColor(record.status) }}
                  />
                  <View className="flex-1">
                    <Text className="text-gray-900 text-sm">
                      {record.session?.event_name || "Session"}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {record.session?.event_date
                        ? new Date(record.session.event_date).toLocaleDateString("fr-FR")
                        : "-"}
                    </Text>
                  </View>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: getStatusColor(record.status) }}
                  >
                    {getStatusLabel(record.status)}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-400 text-sm text-center py-4">
                Aucun historique disponible
              </Text>
            )
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-400 text-sm">Chargement...</Text>
            </View>
          )}

          {/* Conseil pastoral */}
          <View className="bg-blue-50 rounded-xl p-3 mt-3">
            <View className="flex-row items-start">
              <Ionicons name="bulb" size={18} color="#3B82F6" />
              <Text className="text-blue-700 text-sm ml-2 flex-1">
                Conseil: Prenez contact avec ce membre pour comprendre sa situation et l'encourager à revenir.
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}