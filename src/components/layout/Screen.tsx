/**
 * Composant Screen - Wrapper pour tous les écrans
 * Gère SafeAreaView et styles de base
 */

import React from "react";
import { View, StyleSheet, ViewStyle, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  statusBarStyle?: "light-content" | "dark-content";
  edges?: ("top" | "bottom" | "left" | "right")[];
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  backgroundColor = "#ffffff",
  statusBarStyle = "dark-content",
  edges = ["top", "bottom"],
}) => {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }, style]}
      edges={edges}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={backgroundColor}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Screen;