/**
 * Composant de chargement animé
 * Utilisé pendant les opérations asynchrones
 */

import React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = Colors.primary[600],
  message,
  fullScreen = false,
}) => {
  const content = (
    <>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: "center",
  },
});

export default LoadingSpinner;