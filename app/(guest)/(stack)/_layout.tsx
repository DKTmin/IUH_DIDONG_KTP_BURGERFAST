// app/(guest)/(stack)/_layout.tsx
import { Stack } from "expo-router";

export default function GuestStackLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="orders" />
      <Stack.Screen name="product-detail" />
      <Stack.Screen name="stores" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}
