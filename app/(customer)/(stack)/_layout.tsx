// app/(customer)/(stack)/_layout.tsx
import { Stack } from "expo-router";

export default function CustomerStackLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="profile" />
            <Stack.Screen name="orders" />
            <Stack.Screen name="terms" />
            <Stack.Screen name="change-password" />
        </Stack>
    );
}
