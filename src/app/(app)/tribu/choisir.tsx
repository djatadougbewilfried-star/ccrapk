/**
 * Écran Choisir une Tribu - Centre Chrétien de Réveil
 * Permet aux nouveaux membres de choisir leur Tribu
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTribu } from "../../../hooks/useTribu";
import { getTribuIcon, formatMemberName, getTribuConstantData } from "../../../services/tribu.service";
import type { Tribu } from "../../../services/tribu.service";

// Type pour les icônes Ionicons
type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function ChoisirTribuScreen() {
  const params = useLocalSearchParams<{ invitedBy?: string; tribuId?: string }>();
  const {
    loading,
    allTribus,
    rankings,
    joinTribu,
    loadInitialData,
  } = useTribu();

  const [selectedTribu, setSelectedTribu] = useState<Tribu | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [joining, setJoining] = useState(false);

  // Si invité par quelqu'un, pré-sélectionner la Tribu
  useEffect(() => {
    if (params.tribuId && allTribus.length > 0) {
      const tribu = allTribus.find((t) => t.id === params.tribuId);
      if (tribu) {
        setSelectedTribu(tribu);
        setShowConfirmModal(true);
      }
    }
  }, [params.tribuId, allTribus]);

  // Rejoindre la Tribu
  const handleJoinTribu = async () => {
    if (!selectedTribu) return;

    setJoining(true);
    const result = await joinTribu(selectedTribu.id, params.invitedBy);

    if (result.success) {
      setShowConfirmModal(false);
      Alert.alert(
        "Demande envoyée ! 🎉",
        `Votre demande d'adhésion à la Tribu ${selectedTribu.name} a été envoyée au Patriarche. Vous serez notifié dès qu'elle sera validée.`,
        [
          {
            text: "OK",
            onPress: () => router.replace("/(app)/tribu"),
          },
        ]
      );
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }

    setJoining(false);
  };

  // Sélectionner une Tribu
  const handleSelectTribu = (tribu: Tribu) => {
    setSelectedTribu(tribu);
    setShowConfirmModal(true);
  };

  // Trouver le classement d'une Tribu
  const getTribuRanking = (tribuId: string) => {
    const index = rankings.findIndex((r) => r.tribu.id === tribuId);
    return index >= 0 ? index + 1 : null;
  };

  if (loading && allTribus.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-gray-500 mt-4">Chargement des Tribus...</Text>
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
          Choisissez votre Tribu
        </Text>
        <Text className="text-gray-500">
          Les 12 Tribus représentent les 12 fils de Jacob. Chaque Tribu a sa
          propre identité et ses activités. Choisissez celle qui vous correspond !
        </Text>
      </View>

      {/* Liste des Tribus */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Indication parrainage */}
        {params.invitedBy && (
          <View className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="gift" size={24} color="#6366F1" />
              <View className="ml-3 flex-1">
                <Text className="text-indigo-800 font-semibold">
                  Vous avez été invité(e) !
                </Text>
                <Text className="text-indigo-600 text-sm">
                  Vous pouvez rejoindre la même Tribu que votre parrain ou en
                  choisir une autre.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Grille des Tribus */}
        <View className="flex-row flex-wrap justify-between">
          {allTribus.map((tribu) => (
            <TribuCard
              key={tribu.id}
              tribu={tribu}
              ranking={getTribuRanking(tribu.id)}
              onSelect={() => handleSelectTribu(tribu)}
              isHighlighted={params.tribuId === tribu.id}
            />
          ))}
        </View>
      </ScrollView>

      {/* Modal de confirmation */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-5 pt-6 pb-8">
            {selectedTribu && (
              <>
                {/* Header Tribu */}
                <LinearGradient
                  colors={[
                    selectedTribu.color || "#6366F1",
                    adjustColor(selectedTribu.color || "#6366F1", -30),
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-2xl p-5 mb-4"
                >
                  <View className="flex-row items-center">
                    <View className="bg-white/20 p-3 rounded-full">
                      <Ionicons
                        name={getTribuIcon(selectedTribu.icon) as IoniconsName}
                        size={32}
                        color="white"
                      />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-white text-2xl font-bold">
                        {selectedTribu.name}
                      </Text>
                      <Text className="text-white/80">
                        {selectedTribu.member_count} membres
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Signification */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-1">
                    Signification biblique
                  </Text>
                  <Text className="text-gray-900 italic">
                    "{selectedTribu.biblical_meaning || getTribuConstantData(selectedTribu.name)?.description || ""}"
                  </Text>
                </View>

                {/* Patriarche */}
                {selectedTribu.patriarch && (
                  <View className="bg-gray-50 rounded-xl p-4 mb-4">
                    <Text className="text-gray-500 text-sm mb-2">Patriarche</Text>
                    <View className="flex-row items-center">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: selectedTribu.color || "#6366F1" }}
                      >
                        <Ionicons name="person" size={20} color="white" />
                      </View>
                      <Text className="text-gray-900 font-medium ml-3">
                        {formatMemberName(
                          selectedTribu.patriarch.first_name,
                          selectedTribu.patriarch.last_name
                        )}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Classement */}
                <View className="flex-row items-center justify-center bg-amber-50 rounded-xl p-3 mb-6">
                  <Ionicons name="trophy" size={20} color="#F59E0B" />
                  <Text className="text-amber-800 font-medium ml-2">
                    #{getTribuRanking(selectedTribu.id) || "-"} au classement •{" "}
                    {selectedTribu.total_points} points
                  </Text>
                </View>

                {/* Description (Supabase ou constantes en fallback) */}
                {(selectedTribu.description_text || getTribuConstantData(selectedTribu.name)?.description) && (
                  <View className="mb-6">
                    <Text className="text-gray-600 leading-6">
                      {selectedTribu.description_text || getTribuConstantData(selectedTribu.name)?.description}
                    </Text>
                  </View>
                )}

                {/* Note */}
                <View className="bg-blue-50 rounded-xl p-4 mb-6">
                  <View className="flex-row items-start">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <Text className="text-blue-700 text-sm ml-2 flex-1">
                      Votre demande sera envoyée au Patriarche pour validation.
                      Vous serez notifié(e) dès qu'elle sera acceptée.
                    </Text>
                  </View>
                </View>

                {/* Boutons */}
                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={() => setShowConfirmModal(false)}
                    className="flex-1 bg-gray-100 py-4 rounded-xl"
                    disabled={joining}
                  >
                    <Text className="text-gray-700 font-semibold text-center">
                      Annuler
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleJoinTribu}
                    className="flex-1 py-4 rounded-xl"
                    style={{ backgroundColor: selectedTribu.color || "#6366F1" }}
                    disabled={joining}
                  >
                    {joining ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-center">
                        Rejoindre
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANTS
// ============================================

interface TribuCardProps {
  tribu: Tribu;
  ranking: number | null;
  onSelect: () => void;
  isHighlighted?: boolean;
}

function TribuCard({ tribu, ranking, onSelect, isHighlighted }: TribuCardProps) {
  const tribuColor = tribu.color || "#6366F1";

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`w-[48%] mb-4 rounded-2xl overflow-hidden ${
        isHighlighted ? "border-2 border-indigo-500" : ""
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <LinearGradient
        colors={[tribuColor, adjustColor(tribuColor, -20)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4"
      >
        {/* Badge classement */}
        {ranking && ranking <= 3 && (
          <View className="absolute top-2 right-2 bg-white/30 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">#{ranking}</Text>
          </View>
        )}

        {/* Icône */}
        <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center mb-3">
          <Ionicons
            name={getTribuIcon(tribu.icon) as IoniconsName}
            size={24}
            color="white"
          />
        </View>

        {/* Nom */}
        <Text className="text-white text-lg font-bold mb-1">{tribu.name}</Text>

        {/* Membres */}
        <View className="flex-row items-center">
          <Ionicons name="people" size={14} color="rgba(255,255,255,0.8)" />
          <Text className="text-white/80 text-sm ml-1">
            {tribu.member_count} membres
          </Text>
        </View>
      </LinearGradient>

      {/* Badge invité */}
      {isHighlighted && (
        <View className="bg-indigo-600 py-2">
          <Text className="text-white text-xs text-center font-medium">
            Tribu de votre parrain
          </Text>
        </View>
      )}
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