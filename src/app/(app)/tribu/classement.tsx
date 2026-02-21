/**
 * Écran Classement des Tribus - Centre Chrétien de Réveil
 * Affiche le classement complet des 12 Tribus
 */

import React, { useState } from "react";
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
import { useTribuRankings, useTribu } from "../../../hooks/useTribu";
import { getTribuIcon, getTribuConstantData } from "../../../services/tribu.service";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

export default function ClassementScreen() {
  const { rankings, loading } = useTribuRankings();
  const { myTribu, refreshRankings } = useTribu();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (refreshRankings) {
      await refreshRankings();
    }
    setRefreshing(false);
  };

  // Top 3
  const top3 = rankings.slice(0, 3);
  const rest = rankings.slice(3);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-gray-900 text-xl font-bold">
            Classement des Tribus
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && rankings.length === 0 ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : (
          <>
            {/* Podium Top 3 */}
            <View className="px-5 mb-6">
              <View className="flex-row justify-center items-end h-48">
                {/* 2ème place */}
                {top3[1] && (
                  <PodiumItem
                    ranking={top3[1]}
                    position={2}
                    isMyTribu={top3[1].tribu.id === myTribu?.id}
                  />
                )}

                {/* 1ère place */}
                {top3[0] && (
                  <PodiumItem
                    ranking={top3[0]}
                    position={1}
                    isMyTribu={top3[0].tribu.id === myTribu?.id}
                  />
                )}

                {/* 3ème place */}
                {top3[2] && (
                  <PodiumItem
                    ranking={top3[2]}
                    position={3}
                    isMyTribu={top3[2].tribu.id === myTribu?.id}
                  />
                )}
              </View>
            </View>

            {/* Reste du classement */}
            <View className="px-5">
              <Text className="text-gray-500 text-sm font-medium mb-3">
                CLASSEMENT COMPLET
              </Text>

              {rest.map((ranking) => (
                <RankingCard
                  key={ranking.tribu.id}
                  ranking={ranking}
                  isMyTribu={ranking.tribu.id === myTribu?.id}
                />
              ))}
            </View>

            {/* Légende */}
            <View className="px-5 py-6">
              <Text className="text-gray-400 text-xs text-center">
                Le classement est mis à jour chaque lundi.{"\n"}
                Points basés sur : croissance, assiduité, activités, formations, dons.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// COMPOSANTS
// ============================================

interface PodiumItemProps {
  ranking: any;
  position: number;
  isMyTribu: boolean;
}

function PodiumItem({ ranking, position, isMyTribu }: PodiumItemProps) {
  const heights: Record<number, number> = { 1: 140, 2: 110, 3: 90 };
  const podiumColors: Record<number, string> = {
    1: "#FFD700",
    2: "#C0C0C0",
    3: "#CD7F32",
  };
  const tribuColor = ranking.tribu.color || "#6366F1";

  return (
    <View className="items-center mx-2">
      {/* Badge */}
      <View
        className="w-10 h-10 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: tribuColor }}
      >
        <Ionicons
          name={getTribuIcon(ranking.tribu.icon) as IoniconsName}
          size={20}
          color="white"
        />
      </View>

      {/* Nom */}
      <Text
        className={`text-center font-bold text-sm mb-1 ${
          isMyTribu ? "text-indigo-600" : "text-gray-900"
        }`}
        numberOfLines={1}
      >
        {ranking.tribu.name}
      </Text>

      {/* Points */}
      <Text className="text-gray-500 text-xs mb-2">
        {ranking.tribu.total_points} pts
      </Text>

      {/* Podium */}
      <View
        style={{
          width: 80,
          height: heights[position] || 90,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: podiumColors[position] || "#6366F1",
        }}
      >
        <Text className="text-white text-3xl font-bold">{position}</Text>
        {position === 1 && (
          <Ionicons name="trophy" size={24} color="white" />
        )}
      </View>
    </View>
  );
}

interface RankingCardProps {
  ranking: any;
  isMyTribu: boolean;
}

function RankingCard({ ranking, isMyTribu }: RankingCardProps) {
  const tribuColor = ranking.tribu.color || "#6366F1";

  return (
    <View
      className={`flex-row items-center bg-white rounded-xl p-4 mb-3 ${
        isMyTribu ? "border-2 border-indigo-500" : ""
      }`}
    >
      {/* Position */}
      <View className="w-10 items-center">
        <Text className="text-gray-900 font-bold text-lg">
          {ranking.position}
        </Text>
        {ranking.evolution === "up" && (
          <View className="flex-row items-center">
            <Ionicons name="arrow-up" size={12} color="#22C55E" />
            <Text className="text-green-600 text-xs">{ranking.evolutionValue}</Text>
          </View>
        )}
        {ranking.evolution === "down" && (
          <View className="flex-row items-center">
            <Ionicons name="arrow-down" size={12} color="#EF4444" />
            <Text className="text-red-500 text-xs">{ranking.evolutionValue}</Text>
          </View>
        )}
      </View>

      {/* Icône */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mx-3"
        style={{ backgroundColor: tribuColor }}
      >
        <Ionicons
          name={getTribuIcon(ranking.tribu.icon) as IoniconsName}
          size={24}
          color="white"
        />
      </View>

      {/* Infos */}
      <View className="flex-1">
        <Text
          className={`font-bold ${isMyTribu ? "text-indigo-600" : "text-gray-900"}`}
        >
          {ranking.tribu.name}
          {isMyTribu && " (Ma Tribu)"}
        </Text>
        <Text className="text-gray-500 text-sm">
          {ranking.tribu.member_count} membres
        </Text>
        {getTribuConstantData(ranking.tribu.name)?.description && (
          <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
            {getTribuConstantData(ranking.tribu.name)!.description}
          </Text>
        )}
      </View>

      {/* Points */}
      <View className="items-end">
        <Text className="text-gray-900 font-bold">
          {ranking.tribu.total_points}
        </Text>
        <Text className="text-gray-400 text-xs">points</Text>
      </View>
    </View>
  );
}