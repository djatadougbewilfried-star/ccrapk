/**
 * Écran Communauté - Centre Chrétien de Réveil
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemedCard } from "../../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
} from "../../../constants/theme";

export default function CommunityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ma Communauté</Text>
          <Text style={styles.headerSubtitle}>
            Votre tribu et vos frères en Christ
          </Text>
        </View>

        {/* Contenu à venir */}
        <View style={styles.section}>
          <ThemedCard variant="gold" style={styles.comingSoonCard}>
            <Ionicons name="people" size={48} color={COLORS.primary.gold} />
            <Text style={styles.comingSoonTitle}>Bientôt disponible</Text>
            <Text style={styles.comingSoonText}>
              Découvrez les membres de votre tribu, participez aux discussions
              et restez connectés avec votre communauté.
            </Text>
          </ThemedCard>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
  },
  comingSoonCard: {
    alignItems: "center",
    padding: SPACING.xxl,
  },
  comingSoonTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  comingSoonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text.secondary,
    textAlign: "center",
    lineHeight: 22,
  },
});