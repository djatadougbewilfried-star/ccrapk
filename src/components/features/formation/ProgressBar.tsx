/**
 * Barre de progression réutilisable
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = "#2563eb",
  height = 8,
  showLabel = true,
  label,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label || "Progression"}</Text>
          <Text style={[styles.percentage, { color }]}>{clampedProgress}%</Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View 
          style={[
            styles.fill, 
            { width: `${clampedProgress}%`, backgroundColor: color, height }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: "#6b7280",
  },
  percentage: {
    fontSize: 14,
    fontWeight: "600",
  },
  track: {
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 4,
  },
});

export default ProgressBar;