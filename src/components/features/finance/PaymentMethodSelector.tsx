/**
 * Sélecteur de mode de paiement
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PaymentMethod } from "../../../types/database";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: "mtn_momo",
    name: "MTN Mobile Money",
    description: "Paiement via MTN MoMo",
    color: "#FFCC00",
    icon: "phone-portrait",
  },
  {
    id: "orange_money",
    name: "Orange Money",
    description: "Paiement via Orange Money",
    color: "#FF6600",
    icon: "phone-portrait",
  },
  {
    id: "wave",
    name: "Wave",
    description: "Paiement via Wave",
    color: "#1DC4FF",
    icon: "phone-portrait",
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {paymentOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            selectedMethod === option.id && styles.optionSelected,
            selectedMethod === option.id && { borderColor: option.color },
          ]}
          onPress={() => onSelect(option.id)}
          activeOpacity={0.7}
        >
          {/* Icône */}
          <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
            <Ionicons name={option.icon as any} size={20} color="#ffffff" />
          </View>

          {/* Contenu */}
          <View style={styles.content}>
            <Text style={styles.name}>{option.name}</Text>
            <Text style={styles.description}>{option.description}</Text>
          </View>

          {/* Radio button */}
          <View style={[
            styles.radio,
            selectedMethod === option.id && styles.radioSelected,
            selectedMethod === option.id && { borderColor: option.color },
          ]}>
            {selectedMethod === option.id && (
              <View style={[styles.radioInner, { backgroundColor: option.color }]} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  optionSelected: {
    backgroundColor: "#f0fdf4",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: "#6b7280",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderWidth: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default PaymentMethodSelector;