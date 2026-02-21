/**
 * Gestion des Présences - Centre Chrétien de Réveil
 * Création de sessions et pointage manuel par le Patriarche
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTribu, useAttendance } from "../../../../hooks/useTribu";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const EVENT_TYPES = [
  "Culte dimanche",
  "Culte semaine",
  "Activité Tribu",
  "Formation",
  "Croisade",
  "Veillée",
  "Autre",
];

export default function AdminPresenceScreen() {
  const {
    myTribu,
    activeSessions,
    loadActiveSessions,
    createAttendanceSession,
    closeSession,
    getSessionRecords,
    bulkCheckIn,
  } = useTribu();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPointageModal, setShowPointageModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  // Form pour nouvelle session
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("Culte dimanche");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    loadActiveSessions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActiveSessions();
    setRefreshing(false);
  };

  const handleCreateSession = async () => {
    if (!eventName.trim()) {
      Alert.alert("Erreur", "Veuillez donner un nom à la session");
      return;
    }

    setCreating(true);

    const result = await createAttendanceSession({
      tribu_id: myTribu?.id,
      event_type: eventType,
      event_name: eventName.trim(),
      event_date: eventDate,
    });

    if (result.success) {
      setShowCreateModal(false);
      setEventName("");
      Alert.alert("Succès ✅", "Session de présence créée avec succès");
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }

    setCreating(false);
  };

  const handleOpenPointage = (session: any) => {
    setSelectedSession(session);
    setShowPointageModal(true);
  };

  const handleCloseSession = async (sessionId: string) => {
    Alert.alert(
      "Clôturer la session",
      "Une fois clôturée, la session ne pourra plus être modifiée. Continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Clôturer",
          style: "destructive",
          onPress: async () => {
            const result = await closeSession(sessionId);
            if (result.success) {
              Alert.alert("Succès", "Session clôturée");
            } else {
              Alert.alert("Erreur", result.error || "Une erreur est survenue");
            }
          },
        },
      ]
    );
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
            <Text className="text-gray-900 text-xl font-bold">
              Gestion présences
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-medium ml-1">Nouvelle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Sessions actives */}
        <Text className="text-gray-500 text-sm font-medium mb-3">
          SESSIONS ACTIVES
        </Text>

        {activeSessions.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center mb-4">
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-center">
              Aucune session active
            </Text>
            <TouchableOpacity
              onPress={() => setShowCreateModal(true)}
              className="mt-4"
            >
              <Text className="text-indigo-600 font-medium">
                Créer une session →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeSessions.map((session) => (
            <SessionAdminCard
              key={session.id}
              session={session}
              tribuColor={tribuColor}
              onPointage={() => handleOpenPointage(session)}
              onClose={() => handleCloseSession(session.id)}
            />
          ))
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Modal création session */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-5 pt-6 pb-8">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-900 text-xl font-bold">
                Nouvelle session
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Nom */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-2">Nom de la session *</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                placeholder="Ex: Culte du 5 janvier 2025"
                placeholderTextColor="#9CA3AF"
                value={eventName}
                onChangeText={setEventName}
              />
            </View>

            {/* Type */}
            <View className="mb-4">
              <Text className="text-gray-500 text-sm mb-2">Type d'événement</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {EVENT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setEventType(type)}
                    className={`mr-2 px-4 py-2 rounded-full ${
                      eventType === type ? "bg-indigo-600" : "bg-gray-100"
                    }`}
                  >
                    <Text
                      className={
                        eventType === type ? "text-white" : "text-gray-600"
                      }
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Date */}
            <View className="mb-6">
              <Text className="text-gray-500 text-sm mb-2">Date</Text>
              <TextInput
                className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                placeholder="AAAA-MM-JJ"
                placeholderTextColor="#9CA3AF"
                value={eventDate}
                onChangeText={setEventDate}
              />
            </View>

            {/* Bouton créer */}
            <TouchableOpacity
              onPress={handleCreateSession}
              disabled={creating}
              className="bg-indigo-600 py-4 rounded-xl"
            >
              {creating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-center text-lg">
                  Créer la session
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal pointage */}
      {selectedSession && (
        <PointageModal
          visible={showPointageModal}
          session={selectedSession}
          tribuColor={tribuColor}
          onClose={() => {
            setShowPointageModal(false);
            setSelectedSession(null);
          }}
          getSessionRecords={getSessionRecords}
          bulkCheckIn={bulkCheckIn}
        />
      )}
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANTS
// ============================================

interface SessionAdminCardProps {
  session: any;
  tribuColor: string;
  onPointage: () => void;
  onClose: () => void;
}

function SessionAdminCard({
  session,
  tribuColor,
  onPointage,
  onClose,
}: SessionAdminCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-start mb-3">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${tribuColor}20` }}
        >
          <Ionicons name="clipboard" size={24} color={tribuColor} />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-gray-900 font-bold">{session.event_name}</Text>
          <Text className="text-gray-500 text-sm">{session.event_type}</Text>
          <Text className="text-gray-400 text-sm">
            {formatDate(session.event_date)}
          </Text>
        </View>
        <View className="bg-green-100 px-2 py-1 rounded-full">
          <Text className="text-green-700 text-xs font-medium">Active</Text>
        </View>
      </View>

      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={onPointage}
          className="flex-1 py-3 rounded-xl flex-row items-center justify-center"
          style={{ backgroundColor: tribuColor }}
        >
          <Ionicons name="checkbox" size={20} color="white" />
          <Text className="text-white font-medium ml-2">Pointer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          className="px-4 py-3 rounded-xl bg-gray-100"
        >
          <Ionicons name="lock-closed" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// MODAL POINTAGE
// ============================================

interface PointageModalProps {
  visible: boolean;
  session: any;
  tribuColor: string;
  onClose: () => void;
  getSessionRecords: (sessionId: string) => Promise<any>;
  bulkCheckIn: (sessionId: string, records: any[]) => Promise<any>;
}

function PointageModal({
  visible,
  session,
  tribuColor,
  onClose,
  getSessionRecords,
  bulkCheckIn,
}: PointageModalProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, "present" | "absent" | "late">>({});

  useEffect(() => {
    if (visible && session) {
      loadRecords();
    }
  }, [visible, session]);

  const loadRecords = async () => {
    setLoading(true);
    const result = await getSessionRecords(session.id);
    if (result.success && result.data) {
      setRecords(result.data);
      // Initialiser les changements avec les valeurs actuelles
      const initialChanges: Record<string, any> = {};
      result.data.forEach((r: any) => {
        initialChanges[r.user_id] = r.status;
      });
      setChanges(initialChanges);
    }
    setLoading(false);
  };

  const handleStatusChange = (userId: string, status: "present" | "absent" | "late") => {
    setChanges((prev) => ({ ...prev, [userId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);

    const recordsToUpdate = Object.entries(changes).map(([userId, status]) => ({
      userId,
      status,
    }));

    const result = await bulkCheckIn(session.id, recordsToUpdate);

    if (result.success) {
      Alert.alert("Succès ✅", "Présences enregistrées");
      onClose();
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }

    setSaving(false);
  };

  const presentCount = Object.values(changes).filter((s) => s === "present").length;
  const absentCount = Object.values(changes).filter((s) => s === "absent").length;
  const lateCount = Object.values(changes).filter((s) => s === "late").length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="px-5 pt-6 pb-4 border-b border-gray-100">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-900 text-xl font-bold">
                Pointage manuel
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-500">{session.event_name}</Text>

            {/* Stats */}
            <View className="flex-row mt-4 -mx-1">
              <View className="flex-1 mx-1 bg-green-50 rounded-xl p-2 items-center">
                <Text className="text-green-600 font-bold text-lg">{presentCount}</Text>
                <Text className="text-green-600 text-xs">Présents</Text>
              </View>
              <View className="flex-1 mx-1 bg-red-50 rounded-xl p-2 items-center">
                <Text className="text-red-600 font-bold text-lg">{absentCount}</Text>
                <Text className="text-red-600 text-xs">Absents</Text>
              </View>
              <View className="flex-1 mx-1 bg-amber-50 rounded-xl p-2 items-center">
                <Text className="text-amber-600 font-bold text-lg">{lateCount}</Text>
                <Text className="text-amber-600 text-xs">Retards</Text>
              </View>
            </View>
          </View>

          {/* Liste */}
          <ScrollView className="flex-1 px-5 py-4">
            {loading ? (
              <View className="py-10 items-center">
                <ActivityIndicator color={tribuColor} size="large" />
              </View>
            ) : records.length === 0 ? (
              <View className="py-10 items-center">
                <Text className="text-gray-500">Aucun membre à pointer</Text>
              </View>
            ) : (
              records.map((record) => (
                <PointageItem
                  key={record.id}
                  record={record}
                  status={changes[record.user_id] || record.status}
                  onStatusChange={(status) =>
                    handleStatusChange(record.user_id, status)
                  }
                />
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View className="px-5 py-4 border-t border-gray-100">
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="py-4 rounded-xl"
              style={{ backgroundColor: tribuColor }}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-center text-lg">
                  Enregistrer les présences
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface PointageItemProps {
  record: any;
  status: "present" | "absent" | "late";
  onStatusChange: (status: "present" | "absent" | "late") => void;
}

function PointageItem({ record, status, onStatusChange }: PointageItemProps) {
  const profile = record.profile;

  return (
    <View className="flex-row items-center py-3 border-b border-gray-50">
      <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
        <Ionicons name="person" size={20} color="#9CA3AF" />
      </View>
      <Text className="flex-1 ml-3 text-gray-900 font-medium">
        {profile?.first_name} {profile?.last_name}
      </Text>

      <View className="flex-row space-x-1">
        <TouchableOpacity
          onPress={() => onStatusChange("present")}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            status === "present" ? "bg-green-500" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="checkmark"
            size={20}
            color={status === "present" ? "white" : "#9CA3AF"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onStatusChange("late")}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            status === "late" ? "bg-amber-500" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="time"
            size={20}
            color={status === "late" ? "white" : "#9CA3AF"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onStatusChange("absent")}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            status === "absent" ? "bg-red-500" : "bg-gray-100"
          }`}
        >
          <Ionicons
            name="close"
            size={20}
            color={status === "absent" ? "white" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}