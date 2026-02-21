/**
 * Écran Changer de Tribu - Centre Chrétien de Réveil
 * Permet de demander un changement de Tribu
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTribu } from "../../../hooks/useTribu";
import { getTribuIcon, getTribuConstantData } from "../../../services/tribu.service";
import type { Tribu } from "../../../services/tribu.service";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function ChangerTribuScreen() {
  const {
    myTribu,
    allTribus,
    canChange,
    requestTribuChange,
    loadChangeRequests,
    changeRequests,
  } = useTribu();

  const [selectedTribu, setSelectedTribu] = useState<Tribu | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadChangeRequests();
  }, []);

  const handleSubmit = async () => {
    if (!selectedTribu) {
      Alert.alert("Erreur", "Veuillez sélectionner une Tribu");
      return;
    }

    if (reason.trim().length < 20) {
      Alert.alert("Erreur", "Veuillez donner une raison d'au moins 20 caractères");
      return;
    }

    setSubmitting(true);

    const result = await requestTribuChange(selectedTribu.id, reason.trim());

    if (result.success) {
      Alert.alert(
        "Demande envoyée ✅",
        "Votre demande de changement de Tribu a été envoyée au Responsable de l'Intégration.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }

    setSubmitting(false);
  };

  const availableTribus = allTribus.filter((t) => t.id !== myTribu?.id);

  // Si changement impossible
  if (!canChange.canChange) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="px-5 pt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
            <Text className="text-gray-700 ml-2">Retour</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-amber-100 p-6 rounded-full mb-6">
            <Ionicons name="alert-circle" size={64} color="#F59E0B" />
          </View>
          <Text className="text-gray-900 text-xl font-bold text-center mb-2">
            Changement impossible
          </Text>
          <Text className="text-gray-500 text-center mb-4">
            {canChange.reason}
          </Text>

          {canChange.nextChangeDate && (
            <View className="bg-gray-100 rounded-xl p-4 w-full">
              <Text className="text-gray-600 text-center">
                Prochain changement possible le :{"\n"}
                <Text className="font-bold">
                  {new Date(canChange.nextChangeDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </Text>
            </View>
          )}

          {canChange.remainingChanges !== undefined && (
            <Text className="text-gray-400 text-sm mt-4">
              Changements restants : {canChange.remainingChanges}/12
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
          <Text className="text-gray-700 ml-2">Retour</Text>
        </TouchableOpacity>

        <Text className="text-gray-900 text-2xl font-bold mb-2">
          Changer de Tribu
        </Text>
        <Text className="text-gray-500">
          Vous pouvez changer de Tribu {canChange.remainingChanges} fois encore.
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Tribu actuelle */}
        {myTribu && (
          <View className="mb-6">
            <Text className="text-gray-500 text-sm font-medium mb-2">
              TRIBU ACTUELLE
            </Text>
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: `${myTribu.color}20` }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: myTribu.color || "#6366F1" }}
                >
                  <Ionicons
                    name={getTribuIcon(myTribu.icon) as IoniconsName}
                    size={24}
                    color="white"
                  />
                </View>
                <View className="ml-3">
                  <Text className="text-gray-900 font-bold text-lg">
                    {myTribu.name}
                  </Text>
                  <Text className="text-gray-500">
                    {myTribu.member_count} membres
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Nouvelle Tribu */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-2">
            NOUVELLE TRIBU
          </Text>

          <View className="flex-row flex-wrap justify-between">
            {availableTribus.map((tribu) => (
              <TouchableOpacity
                key={tribu.id}
                onPress={() => setSelectedTribu(tribu)}
                className={`w-[48%] mb-3 rounded-xl p-3 border-2 ${
                  selectedTribu?.id === tribu.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: tribu.color || "#6366F1" }}
                  >
                    <Ionicons
                      name={getTribuIcon(tribu.icon) as IoniconsName}
                      size={20}
                      color="white"
                    />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="text-gray-900 font-medium" numberOfLines={1}>
                      {tribu.name}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {tribu.member_count} membres
                    </Text>
                    {getTribuConstantData(tribu.name)?.description && (
                      <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                        {getTribuConstantData(tribu.name)!.description}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Raison */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-2">
            RAISON DU CHANGEMENT *
          </Text>
          <TextInput
            className="bg-white rounded-xl p-4 text-gray-900 min-h-[120px]"
            placeholder="Expliquez pourquoi vous souhaitez changer de Tribu..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            value={reason}
            onChangeText={setReason}
          />
          <Text className="text-gray-400 text-xs mt-1">
            Minimum 20 caractères ({reason.length}/20)
          </Text>
        </View>

        {/* Avertissement */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <View className="flex-row">
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <View className="flex-1 ml-2">
              <Text className="text-amber-800 font-medium">Attention</Text>
              <Text className="text-amber-700 text-sm mt-1">
                • Le changement sera soumis au Responsable de l'Intégration{"\n"}
                • Délai minimum de 3 mois entre deux changements{"\n"}
                • Maximum 12 changements au total dans votre vie
              </Text>
            </View>
          </View>
        </View>

        {/* Bouton soumettre */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting || !selectedTribu || reason.length < 20}
          className={`py-4 rounded-xl mb-8 ${
            selectedTribu && reason.length >= 20 ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-center text-lg">
              Soumettre la demande
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}