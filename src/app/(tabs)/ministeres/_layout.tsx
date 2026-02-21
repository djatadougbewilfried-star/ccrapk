/**
 * Layout pour les écrans ministères
 */

import { Stack } from "expo-router";

export default function MinisteresLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[slug]" />
      <Stack.Screen name="departments" />
    </Stack>
  );
}