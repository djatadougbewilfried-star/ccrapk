/**
 * Layout pour les formations
 */

import { Stack } from "expo-router";

export default function FormationsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}