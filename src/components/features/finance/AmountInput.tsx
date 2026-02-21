/**
 * Input de montant avec suggestions rapides
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
}

const quickAmounts = [1000, 2000, 5000, 10000, 25000, 50000];

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  currency = "FCFA",
}) => {
  const formatDisplay = (val: string): string => {
    const num = parseInt(val) || 0;
    return new Intl.NumberFormat("fr-FR").format(num);
  };

  return (
    <View style={styles.container}>
      {/* Input principal */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value ? formatDisplay(value) : ""}
          onChangeText={(text) => {
            // Enlever les espaces et garder uniquement les chiffres
            const cleanValue = text.replace(/\s/g, "").replace(/[^0-9]/g, "");
            onChange(cleanValue);
          }}
          placeholder="0"
          placeholderTextColor="#d1d5db"
          keyboardType="number-pad"
        />
        <Text style={styles.currency}>{currency}</Text>
      </View>

      {/* Montants rapides */}
      <Text style={styles.quickLabel}>Montants suggérés</Text>
      <View style={styles.quickContainer}>
        {quickAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.quickButton,
              value === String(amount) && styles.quickButtonActive,
            ]}
            onPress={() => onChange(String(amount))}
          >
            <Text style={[
              styles.quickButtonText,
              value === String(amount) && styles.quickButtonTextActive,
            ]}>
              {new Intl.NumberFormat("fr-FR").format(amount)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  currency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6b7280",
    marginLeft: 8,
  },
  quickLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 16,
    marginBottom: 8,
  },
  quickContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    color: "#374151",
  },
  quickButtonTextActive: {
    color: "#ffffff",
  },
});

export default AmountInput;