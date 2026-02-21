/**
 * Carte pour enregistrer une prière
 */

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PrayerLogCardProps {
  onSubmit: (minutes: number, type?: string, notes?: string) => Promise<boolean>;
  todayMinutes?: number;
  goalMinutes?: number;
}

export const PrayerLogCard: React.FC<PrayerLogCardProps> = ({
  onSubmit,
  todayMinutes = 0,
  goalMinutes = 30,
}) => {
  const [minutes, setMinutes] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const prayerTypes = [
    { id: "louange", label: "Louange", icon: "musical-notes" },
    { id: "intercession", label: "Intercession", icon: "people" },
    { id: "adoration", label: "Adoration", icon: "heart" },
    { id: "meditation", label: "Méditation", icon: "book" },
  ];

  const quickMinutes = [5, 10, 15, 30, 45, 60];

  const handleSubmit = async () => {
    const mins = parseInt(minutes) || 0;
    if (mins <= 0) return;

    setIsSubmitting(true);
    const success = await onSubmit(mins, selectedType || undefined);
    setIsSubmitting(false);

    if (success) {
      setShowSuccess(true);
      setMinutes("");
      setSelectedType(null);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const progress = Math.min(100, Math.round(((todayMinutes + (parseInt(minutes) || 0)) / goalMinutes) * 100));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="time" size={24} color="#2563eb" />
        <Text style={styles.title}>Temps de prière</Text>
      </View>

      {/* Progression du jour */}
      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Aujourd'hui</Text>
          <Text style={styles.progressValue}>
            {todayMinutes} / {goalMinutes} min
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(100, (todayMinutes / goalMinutes) * 100)}%` }]} />
        </View>
      </View>

      {/* Sélection rapide des minutes */}
      <Text style={styles.sectionLabel}>Durée (minutes)</Text>
      <View style={styles.quickSelect}>
        {quickMinutes.map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.quickButton,
              minutes === String(m) && styles.quickButtonActive,
            ]}
            onPress={() => setMinutes(String(m))}
          >
            <Text style={[
              styles.quickButtonText,
              minutes === String(m) && styles.quickButtonTextActive,
            ]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Input personnalisé */}
      <TextInput
        style={styles.input}
        placeholder="Ou entrez un nombre personnalisé..."
        placeholderTextColor="#9ca3af"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="number-pad"
      />

      {/* Type de prière */}
      <Text style={styles.sectionLabel}>Type de prière (optionnel)</Text>
      <View style={styles.typesRow}>
        {prayerTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeButton,
              selectedType === type.id && styles.typeButtonActive,
            ]}
            onPress={() => setSelectedType(
              selectedType === type.id ? null : type.id
            )}
          >
            <Ionicons 
              name={type.icon as any} 
              size={20} 
              color={selectedType === type.id ? "#2563eb" : "#6b7280"} 
            />
            <Text style={[
              styles.typeButtonText,
              selectedType === type.id && styles.typeButtonTextActive,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bouton soumettre */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!minutes || isSubmitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!minutes || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : showSuccess ? (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>Enregistré !</Text>
          </>
        ) : (
          <>
            <Ionicons name="add-circle" size={20} color="#ffffff" />
            <Text style={styles.submitButtonText}>Enregistrer ma prière</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  progressSection: {
    marginBottom: 20,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  quickSelect: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  quickButtonTextActive: {
    color: "#ffffff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  typesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  typeButtonActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
  },
  typeButtonText: {
    fontSize: 13,
    color: "#6b7280",
  },
  typeButtonTextActive: {
    color: "#2563eb",
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PrayerLogCard;