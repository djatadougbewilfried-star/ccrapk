/**
 * Layout pour les routes Admin Tribu (Patriarche)
 */

import { Stack } from "expo-router";

export default function TribuAdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="demandes" />
      <Stack.Screen name="parametres" />
      <Stack.Screen name="alertes" />
      <Stack.Screen name="presence" />
      <Stack.Screen name="activites" />
    </Stack>
  );
}