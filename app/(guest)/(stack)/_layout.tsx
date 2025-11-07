// app/(guest)/(stack)/_layout.tsx
import { Stack } from "expo-router";

export default function GuestStackLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="orders" />
    </Stack>
  );
}
