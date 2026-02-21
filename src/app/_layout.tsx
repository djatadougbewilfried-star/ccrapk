/**
 * Layout racine de l'application CCR
 * Configure les providers, l'authentification et la navigation
 */

import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useAuthStore } from "../stores/authStore";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { getQueryClient } from "../lib/queryClient";
import { initNetworkMonitoring } from "../lib/offline";
import { Logger } from "../lib/logger";

import "../global.css";

// QueryClient singleton
const queryClient = getQueryClient();

/**
 * Composant de chargement initial
 */
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <Text style={styles.loadingTitle}>CCR</Text>
        <Text style={styles.loadingSubtitle}>Centre Chrétien de Réveil</Text>
      </View>
    </View>
  );
}

/**
 * Provider d'application avec tous les contexts nécessaires
 */
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

/**
 * Composant principal du layout
 */
function RootLayoutContent() {
  const { initialize, isLoading } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        Logger.info("Initialisation de l'application", undefined, "APP");

        // Initialiser l'auth
        await initialize();

        Logger.info("Application initialisée avec succès", undefined, "APP");
      } catch (error) {
        Logger.error("Erreur d'initialisation", { error }, "APP");
      } finally {
        setIsReady(true);
      }
    }

    init();
  }, [initialize]);

  // Initialiser le monitoring réseau
  useEffect(() => {
    const unsubscribe = initNetworkMonitoring();
    Logger.debug("Network monitoring initialisé", undefined, "APP");

    return () => {
      unsubscribe();
    };
  }, []);

  // Afficher l'écran de chargement pendant l'initialisation
  if (!isReady || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#FFFFFF" },
        }}
      >
        {/* Écran de splash/accueil */}
        <Stack.Screen
          name="index"
          options={{
            animation: "fade",
          }}
        />

        {/* Groupe authentification */}
        <Stack.Screen
          name="(auth)"
          options={{
            animation: "slide_from_bottom",
          }}
        />

        {/* Groupe principal avec tabs */}
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: "fade",
          }}
        />

        {/* Groupe app (écrans supplémentaires) */}
        <Stack.Screen
          name="(app)"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </>
  );
}

/**
 * Export du layout racine
 */
export default function RootLayout() {
  return (
    <AppProviders>
      <RootLayoutContent />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#1E3A5F",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingTitle: {
    fontSize: 48,
    fontWeight: "800",
    color: "#D4A84B",
    letterSpacing: 4,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 8,
    opacity: 0.8,
  },
});
