/**
 * Layout pour la prière
 */

import { Stack } from "expo-router";

export default function PrayerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}