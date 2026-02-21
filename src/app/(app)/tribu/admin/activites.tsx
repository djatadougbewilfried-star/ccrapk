/**
 * Gestion des Activités - Centre Chrétien de Réveil
 * Création et gestion des activités par le Patriarche
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
import { useTribu } from "../../../../hooks/useTribu";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const ACTIVITY_TYPES = [
  { label: "Prière", icon: "hand-left" },
  { label: "Sortie", icon: "car" },
  { label: "Action caritative", icon: "heart" },
  { label: "Étude biblique", icon: "book" },
  { label: "Fête", icon: "gift" },
  { label: "Repas", icon: "restaurant" },
  { label: "Sport", icon: "football" },
  { label: "Autre", icon: "ellipse" },
];

export default function AdminActivitesScreen() {
  const {
    myTribu,
    activities,
    loadActivities,
    createActivity,
  } = useTribu();

  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState("Prière");
  const [activityDate, setActivityDate] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    loadActivities(false); // Toutes les activités
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities(false);
    setRefreshing(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setActivityType("Prière");
    setActivityDate("");
    setLocation("");
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Veuillez donner un titre à l'activité");
      return;
    }

    if (!activityDate) {
      Alert.alert("Erreur", "Veuillez sélectionner une date");
      return;
    }

    setCreating(true);

    const result = await createActivity({
      title: title.trim(),
      description: description.trim() || undefined,
      activity_type: activityType,
      activity_date: activityDate,
      location: location.trim() || undefined,
    });

    if (result.success) {
      setShowCreateModal(false);
      resetForm();
      Alert.alert("Succès ✅", "Activité créée avec succès");
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }

    setCreating(false);
  };

  const tribuColor = myTribu?.color || "#6366F1";

  // Séparer activités passées et futures
  const now = new Date();
  const upcomingActivities = activities.filter(
    (a) => new Date(a.activity_date) >= now
  );
  const pastActivities = activities.filter(
    (a) => new Date(a.activity_date) < now
  );

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
              Activités
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
        {/* Activités à venir */}
        <Text className="text-gray-500 text-sm font-medium mb-3">
          À VENIR ({upcomingActivities.length})
        </Text>

        {upcomingActivities.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center mb-6">
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-center">
              Aucune activité prévue
            </Text>
          </View>
        ) : (
          upcomingActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              tribuColor={tribuColor}
              isPast={false}
            />
          ))
        )}

        {/* Activités passées */}
        {pastActivities.length > 0 && (
          <>
            <Text className="text-gray-500 text-sm font-medium mb-3 mt-6">
              PASSÉES ({pastActivities.length})
            </Text>
            {pastActivities.slice(0, 5).map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                tribuColor={tribuColor}
                isPast={true}
              />
            ))}
          </>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Modal création */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-5 pt-6 pb-8 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-900 text-xl font-bold">
                Nouvelle activité
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Titre */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-2">Titre *</Text>
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Ex: Sortie fraternelle à Grand-Bassam"
                  placeholderTextColor="#9CA3AF"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              {/* Type */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-2">Type</Text>
                <View className="flex-row flex-wrap">
                  {ACTIVITY_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.label}
                      onPress={() => setActivityType(type.label)}
                      className={`mr-2 mb-2 px-4 py-2 rounded-full flex-row items-center ${
                        activityType === type.label
                          ? "bg-indigo-600"
                          : "bg-gray-100"
                      }`}
                    >
                      <Ionicons
                        name={type.icon as IoniconsName}
                        size={16}
                        color={activityType === type.label ? "white" : "#6B7280"}
                      />
                      <Text
                        className={`ml-2 ${
                          activityType === type.label
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-2">Date et heure *</Text>
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="AAAA-MM-JJ HH:MM"
                  placeholderTextColor="#9CA3AF"
                  value={activityDate}
                  onChangeText={setActivityDate}
                />
              </View>

              {/* Lieu */}
              <View className="mb-4">
                <Text className="text-gray-500 text-sm mb-2">Lieu (optionnel)</Text>
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900"
                  placeholder="Ex: Église, Parc, Domicile du Patriarche..."
                  placeholderTextColor="#9CA3AF"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              {/* Description */}
              <View className="mb-6">
                <Text className="text-gray-500 text-sm mb-2">
                  Description (optionnel)
                </Text>
                <TextInput
                  className="bg-gray-100 rounded-xl px-4 py-3 text-gray-900 min-h-[100px]"
                  placeholder="Décrivez l'activité..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Bouton créer */}
              <TouchableOpacity
                onPress={handleCreate}
                disabled={creating}
                className="bg-indigo-600 py-4 rounded-xl mb-4"
              >
                {creating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center text-lg">
                    Créer l'activité
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANT CARTE ACTIVITÉ
// ============================================

interface ActivityCardProps {
  activity: any;
  tribuColor: string;
  isPast: boolean;
}

function ActivityCard({ activity, tribuColor, isPast }: ActivityCardProps) {
  const getActivityIcon = (type: string): IoniconsName => {
    const icons: Record<string, IoniconsName> = {
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
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View
      className={`bg-white rounded-2xl p-4 mb-3 shadow-sm ${
        isPast ? "opacity-60" : ""
      }`}
    >
      <View className="flex-row items-start">
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: isPast ? "#E5E7EB" : `${tribuColor}20` }}
        >
          <Ionicons
            name={getActivityIcon(activity.activity_type)}
            size={24}
            color={isPast ? "#9CA3AF" : tribuColor}
          />
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-gray-900 font-bold">{activity.title}</Text>
          <Text className="text-gray-500 text-sm">{activity.activity_type}</Text>

          <View className="flex-row items-center mt-2">
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text className="text-gray-400 text-sm ml-1">
              {formatDate(activity.activity_date)}
            </Text>
          </View>

          {activity.location && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm ml-1">
                {activity.location}
              </Text>
            </View>
          )}
        </View>

        {isPast && (
          <View className="bg-gray-100 px-2 py-1 rounded-full">
            <Text className="text-gray-500 text-xs">Passée</Text>
          </View>
        )}
      </View>

      {activity.description && (
        <Text className="text-gray-600 text-sm mt-3 ml-15">
          {activity.description}
        </Text>
      )}
    </View>
  );
}