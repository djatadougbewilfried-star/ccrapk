/**
 * Layout pour les écrans de tribu
 */

import { Stack } from "expo-router";

export default function TribuLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}