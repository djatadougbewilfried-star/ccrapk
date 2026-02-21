/**
 * Paramètres de la Tribu - Centre Chrétien de Réveil
 * Personnalisation par le Patriarche
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
import { useTribu } from "../../../../hooks/useTribu";
import { getTribuIcon } from "../../../../services/tribu.service";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// Couleurs disponibles
const COLORS = [
  "#E74C3C", "#9B59B6", "#3498DB", "#F1C40F", "#1ABC9C",
  "#E67E22", "#34495E", "#27AE60", "#8E44AD", "#2980B9",
  "#16A085", "#C0392B", "#6366F1", "#EC4899", "#14B8A6",
];

export default function ParametresScreen() {
  const { myTribu, updateTribuInfo } = useTribu();

  const [slogan, setSlogan] = useState("");
  const [vision, setVision] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Charger les valeurs initiales
  useEffect(() => {
    if (myTribu) {
      setSlogan(myTribu.slogan || "");
      setVision(myTribu.vision || "");
      setDescription(myTribu.description_text || "");
      setSelectedColor(myTribu.color || "#6366F1");
    }
  }, [myTribu]);

  // Détecter les changements
  useEffect(() => {
    if (myTribu) {
      const changed =
        slogan !== (myTribu.slogan || "") ||
        vision !== (myTribu.vision || "") ||
        description !== (myTribu.description_text || "") ||
        selectedColor !== (myTribu.color || "#6366F1");
      setHasChanges(changed);
    }
  }, [slogan, vision, description, selectedColor, myTribu]);

  const handleSave = async () => {
    if (!myTribu?.id) return;

    setSaving(true);

    // Préparer les données avec les bons types
    const updateData: {
      color?: string;
      slogan?: string;
      vision?: string;
      description_text?: string;
    } = {
      color: selectedColor,
    };

    // N'ajouter que si non vide
    if (slogan.trim()) {
      updateData.slogan = slogan.trim();
    }
    if (vision.trim()) {
      updateData.vision = vision.trim();
    }
    if (description.trim()) {
      updateData.description_text = description.trim();
    }

    const result = await updateTribuInfo(myTribu.id, updateData);

    if (result.success) {
      Alert.alert("Succès ✅", "Les paramètres ont été enregistrés.");
      setHasChanges(false);
    } else {
      Alert.alert("Erreur", result.error || "Une erreur est survenue");
    }

    setSaving(false);
  };

  const tribuColor = selectedColor || myTribu?.color || "#6366F1";

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
              Paramètres Tribu
            </Text>
          </View>
          {hasChanges && (
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-indigo-600 px-4 py-2 rounded-xl"
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-medium">Enregistrer</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
      >
        {/* Aperçu */}
        <View
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: tribuColor }}
        >
          <View className="flex-row items-center mb-3">
            <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center">
              <Ionicons
            name={getTribuIcon(myTribu?.icon || null) as IoniconsName}
                size={24}
                color="white"
              />
            </View>
            <View className="ml-3">
              <Text className="text-white text-xl font-bold">
                {myTribu?.name}
              </Text>
              <Text className="text-white/80 text-sm">
                {myTribu?.member_count} membres
              </Text>
            </View>
          </View>
          {slogan ? (
            <View className="bg-white/20 rounded-xl px-4 py-2">
              <Text className="text-white text-center font-medium">
                🎯 {slogan}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Couleur */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-2">
            COULEUR DE LA TRIBU
          </Text>
          <View className="bg-white rounded-xl p-4">
            <View className="flex-row flex-wrap">
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className="p-1"
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      selectedColor === color ? "border-2 border-gray-900" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Slogan */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-2">
            SLOGAN (optionnel)
          </Text>
          <View className="bg-white rounded-xl">
            <TextInput
              className="px-4 py-3 text-gray-900"
              placeholder="Ex: Unis pour grandir ensemble"
              placeholderTextColor="#9CA3AF"
              value={slogan}
              onChangeText={setSlogan}
              maxLength={100}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-1 text-right">
            {slogan.length}/100
          </Text>
        </View>

        {/* Vision */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-2">
            VISION DE LA TRIBU (optionnel)
          </Text>
          <View className="bg-white rounded-xl">
            <TextInput
              className="px-4 py-3 text-gray-900 min-h-[100px]"
              placeholder="Décrivez la vision et les objectifs de votre Tribu..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={vision}
              onChangeText={setVision}
              maxLength={500}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-1 text-right">
            {vision.length}/500
          </Text>
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm font-medium mb-2">
            DESCRIPTION (optionnel)
          </Text>
          <View className="bg-white rounded-xl">
            <TextInput
              className="px-4 py-3 text-gray-900 min-h-[120px]"
              placeholder="Présentez votre Tribu aux nouveaux membres..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              maxLength={1000}
            />
          </View>
          <Text className="text-gray-400 text-xs mt-1 text-right">
            {description.length}/1000
          </Text>
        </View>

        {/* Info */}
        <View className="bg-blue-50 rounded-xl p-4 mb-8">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-700 text-sm ml-2 flex-1">
              Ces informations seront visibles par tous les membres de l'église et aideront les nouveaux à choisir leur Tribu.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 