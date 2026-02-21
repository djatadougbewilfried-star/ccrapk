/**
 * Layout pour les routes Tribu
 */

import { Stack } from "expo-router";

export default function TribuLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="choisir" />
      <Stack.Screen name="membres" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="classement" />
      <Stack.Screen name="presence" />
      <Stack.Screen name="changer" />
      <Stack.Screen name="activites" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}