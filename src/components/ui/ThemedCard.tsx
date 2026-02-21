/**
 * Carte thématique CCR
 */

import React from "react";
import {
  View,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, BORDER_RADIUS, SPACING, SHADOWS } from "../../constants/theme";

interface ThemedCardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "gold" | "gradient";
  style?: ViewStyle;
  padding?: "none" | "sm" | "md" | "lg";
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  variant = "default",
  style,
  padding = "md",
}) => {
  const getPadding = () => {
    switch (padding) {
      case "none":
        return 0;
      case "sm":
        return SPACING.md;
      case "lg":
        return SPACING.xl;
      default:
        return SPACING.lg;
    }
  };

  if (variant === "gradient") {
    return (
      <LinearGradient
        colors={[COLORS.primary.gold, COLORS.primary.goldLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientCard,
          { padding: getPadding() },
          SHADOWS.gold,
          style,
        ]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (variant === "gold") {
    return (
      <View
        style={[
          styles.goldCard,
          { padding: getPadding() },
          SHADOWS.md,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  if (variant === "elevated") {
    return (
      <View
        style={[
          styles.elevatedCard,
          { padding: getPadding() },
          SHADOWS.lg,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.defaultCard,
        { padding: getPadding() },
        SHADOWS.sm,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  defaultCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
  },
  elevatedCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.xl,
  },
  goldCard: {
    backgroundColor: COLORS.neutral.white,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary.goldSoft,
  },
  gradientCard: {
    borderRadius: BORDER_RADIUS.xl,
  },
});

export default ThemedCard;