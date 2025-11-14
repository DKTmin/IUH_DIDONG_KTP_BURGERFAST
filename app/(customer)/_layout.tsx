import { Stack } from "expo-router";
import { View } from "react-native";
import { CartProvider } from "../context/CartContext";
import FloatingCart from "../components/FloatingCart";

export default function CustomerLayout() {
  return (
    <CartProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="stack" options={{ headerShown: false }} />
          <Stack.Screen
            name="cart"
            options={{
              headerShown: false,
              presentation: "card",
            }}
          />
        </Stack>
        <FloatingCart />
      </View>
    </CartProvider>
  );
}
