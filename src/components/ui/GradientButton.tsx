/**
 * Bouton avec gradient doré
 */

import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOWS } from "../../constants/theme";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  icon,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const getSize = () => {
    switch (size) {
      case "sm":
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case "lg":
        return { paddingVertical: 18, paddingHorizontal: 28 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 24 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case "sm":
        return FONT_SIZE.sm;
      case "lg":
        return FONT_SIZE.lg;
      default:
        return FONT_SIZE.md;
    }
  };

  if (variant === "outline") {
    return (
      <TouchableOpacity
        style={[
          styles.outlineButton,
          getSize(),
          isDisabled && styles.disabledOutline,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary.gold} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.outlineText,
                { fontSize: getFontSize() },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === "secondary") {
    return (
      <TouchableOpacity
        style={[
          styles.secondaryButton,
          getSize(),
          isDisabled && styles.disabledSecondary,
          style,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.secondary.blue} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.secondaryText,
                { fontSize: getFontSize() },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[isDisabled && styles.disabledContainer, style]}
    >
      <LinearGradient
        colors={
          isDisabled
            ? [COLORS.neutral.border, COLORS.neutral.border]
            : [COLORS.primary.gold, COLORS.primary.goldLight]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, getSize(), SHADOWS.gold]}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.neutral.white} size="small" />
        ) : (
          <>
            {icon}
            <Text
              style={[
                styles.primaryText,
                { fontSize: getFontSize() },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.lg,
    gap: 8,
  },
  primaryText: {
    color: COLORS.neutral.white,
    fontWeight: FONT_WEIGHT.bold,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primary.gold,
    backgroundColor: "transparent",
    gap: 8,
  },
  outlineText: {
    color: COLORS.primary.gold,
    fontWeight: FONT_WEIGHT.bold,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary.goldSoft,
    gap: 8,
  },
  secondaryText: {
    color: COLORS.primary.goldDark,
    fontWeight: FONT_WEIGHT.bold,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  disabledOutline: {
    opacity: 0.5,
    borderColor: COLORS.neutral.border,
  },
  disabledSecondary: {
    opacity: 0.5,
  },
});

export default GradientButton;