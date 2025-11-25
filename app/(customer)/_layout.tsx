import { Stack } from "expo-router";
import { View } from "react-native";
import ChatAssistant from "../components/ChatAssistant";
import FloatingCart from "../components/FloatingCart";
import { CartProvider } from "../context/CartContext";

export default function CustomerLayout() {
  return (
    <CartProvider>
      <View style={{ flex: 1 }}>
        {/* Main content fills parent */}
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(stack)" options={{ headerShown: false }} />
            <Stack.Screen
              name="cart"
              options={{
                headerShown: false,
                presentation: "card",
              }}
            />
          </Stack>
        </View>
        {/* Floating icons absolutely positioned above tab bar */}
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            left: 0,
            top: 0,
          }}
        >
          <FloatingCart />
          <ChatAssistant cartActive={true} />
        </View>
      </View>
    </CartProvider>
  );
}
