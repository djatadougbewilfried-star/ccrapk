/**
 * Dashboard Accueil - Centre Chrétien de Réveil
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useProfile } from "../../hooks/useProfile";
import { ThemedCard } from "../../components/ui/ThemedCard";
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  SHADOWS,
  CHURCH_INFO,
} from "../../constants/theme";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const { profile, isLoading, loadProfile } = useProfile();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Bonjour");
    } else if (hour < 18) {
      setGreeting("Bon après-midi");
    } else {
      setGreeting("Bonsoir");
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: "prayer",
      title: "Prière",
      icon: "heart",
      color: "#EC4899",
      route: "/(tabs)/prayer",
    },
    {
      id: "donate",
      title: "Donner",
      icon: "wallet",
      color: COLORS.primary.gold,
      route: "/(tabs)/finances",
    },
    {
      id: "events",
      title: "Événements",
      icon: "calendar",
      color: "#3B82F6",
      route: "/(tabs)/events",
    },
    {
      id: "ministeres",
      title: "Ministères",
      icon: "grid",
      color: "#8B5CF6",
      route: "/(tabs)/ministeres",
    },
  ];

  const menuItems = [
    {
      id: "tribu",
      title: "Ma Tribu",
      subtitle: "Découvrez votre communauté",
      icon: "people",
      color: "#3B82F6",
      route: "/(tabs)/community",
    },
    {
      id: "formations",
      title: "Formations",
      subtitle: "Académie de Réveil & plus",
      icon: "school",
      color: "#8B5CF6",
      route: "/(tabs)/formations",
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Annonces et alertes",
      icon: "notifications",
      color: "#F59E0B",
      route: "/(tabs)/notifications",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary.gold}
          />
        }
      >
        {/* Header avec gradient */}
        <LinearGradient
          colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
          style={styles.header}
        >
          {/* Décoration */}
          <View style={styles.headerDecor1} />
          <View style={styles.headerDecor2} />

          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.logoMini}>
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.churchNameHeader}>{CHURCH_INFO.shortName}</Text>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={() => router.push("/(tabs)/notifications" as any)}
            >
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notifBadge} />
            </TouchableOpacity>
          </View>

          {/* Salutation */}
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>
              {profile?.first_name || "Bien-aimé(e)"} 👋
            </Text>
          </View>

          {/* Verset du jour */}
          <ThemedCard variant="default" style={styles.verseCard}>
            <View style={styles.verseHeader}>
              <Ionicons name="book" size={18} color={COLORS.primary.gold} />
              <Text style={styles.verseLabel}>Parole du jour</Text>
            </View>
            <Text style={styles.verseText}>
              "Tu aimeras le Seigneur ton Dieu de tout ton cœur, de toute ton âme et de toute ta pensée."
            </Text>
            <Text style={styles.verseRef}>Matthieu 22:37</Text>
          </ThemedCard>
        </LinearGradient>

        {/* Actions rapides */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickAction}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: `${action.color}15` },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={26}
                    color={action.color}
                  />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prochains événements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prochains événements</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/events" as any)}>
              <Text style={styles.seeAllLink}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsScroll}
          >
            {/* Événement 1 */}
            <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primary.gold, COLORS.primary.goldDark]}
                style={styles.eventGradient}
              >
                <View style={styles.eventDate}>
                  <Text style={styles.eventDay}>DIM</Text>
                  <Text style={styles.eventDayNum}>29</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>Culte de célébration</Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.eventTime}>09:00 - 12:00</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Événement 2 */}
            <TouchableOpacity style={styles.eventCard} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.secondary.blue, COLORS.secondary.blueDark]}
                style={styles.eventGradient}
              >
                <View style={styles.eventDate}>
                  <Text style={styles.eventDay}>MER</Text>
                  <Text style={styles.eventDayNum}>01</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>Réunion de prière</Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.eventTime}>18:30 - 20:00</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Menu principal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explorer</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.neutral.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Carte d'engagement */}
        <View style={styles.section}>
          <ThemedCard variant="gradient" style={styles.engagementCard}>
            <View style={styles.engagementContent}>
              <Ionicons name="heart" size={32} color="#fff" />
              <Text style={styles.engagementTitle}>Envie de servir ?</Text>
              <Text style={styles.engagementText}>
                Rejoignez un département et servez avec vos dons
              </Text>
              <TouchableOpacity
                style={styles.engagementButton}
                onPress={() => router.push("/(tabs)/ministeres" as any)}
              >
                <Text style={styles.engagementButtonText}>Découvrir</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary.gold} />
              </TouchableOpacity>
            </View>
          </ThemedCard>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerSlogan}>{CHURCH_INFO.slogan}</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
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
    paddingBottom: SPACING.xxxl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  headerDecor1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(212, 168, 75, 0.1)",
  },
  headerDecor2: {
    position: "absolute",
    bottom: 20,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  logoMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: 28,
    height: 28,
  },
  churchNameHeader: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
    letterSpacing: 2,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.status.error,
    borderWidth: 2,
    borderColor: COLORS.secondary.blue,
  },
  greetingSection: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: FONT_SIZE.lg,
    color: "rgba(255,255,255,0.7)",
  },
  userName: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
    marginTop: SPACING.xs,
  },
  verseCard: {
    marginHorizontal: SPACING.xl,
    padding: SPACING.lg,
  },
  verseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  verseLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary.gold,
  },
  verseText: {
    fontSize: FONT_SIZE.md,
    fontStyle: "italic",
    color: COLORS.text.primary,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  verseRef: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.secondary,
    textAlign: "right",
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING.xl,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.xl,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  quickAction: {
    alignItems: "center",
    width: (width - SPACING.xl * 2 - SPACING.md * 3) / 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
    backgroundColor: COLORS.neutral.white,
  },
  quickActionText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text.secondary,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text.primary,
  },
  seeAllLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary.gold,
  },
  eventsScroll: {
    paddingRight: SPACING.xl,
  },
  eventCard: {
    width: width * 0.7,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    ...SHADOWS.lg,
  },
  eventGradient: {
    flexDirection: "row",
    padding: SPACING.lg,
  },
  eventDate: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.md,
  },
  eventDay: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: "rgba(255,255,255,0.8)",
  },
  eventDayNum: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.neutral.white,
  },
  eventInfo: {
    flex: 1,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
    marginBottom: SPACING.xs,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  eventTime: {
    fontSize: FONT_SIZE.sm,
    color: "rgba(255,255,255,0.8)",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text.tertiary,
  },
  engagementCard: {
    padding: SPACING.xl,
  },
  engagementContent: {
    alignItems: "center",
  },
  engagementTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.neutral.white,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  engagementText: {
    fontSize: FONT_SIZE.md,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  engagementButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.neutral.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  engagementButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary.gold,
  },
  footer: {
    alignItems: "center",
    paddingVertical: SPACING.xxl,
    paddingBottom: SPACING.huge,
  },
  footerSlogan: {
    fontSize: FONT_SIZE.sm,
    fontStyle: "italic",
    color: COLORS.text.tertiary,
    marginBottom: SPACING.xs,
  },
  footerVersion: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text.tertiary,
  },
});