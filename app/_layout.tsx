// app/_layout.tsx
import { Stack } from "expo-router";
import { LanguageProvider } from "./context/LanguageProvider";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* 
        index.tsx → Trang chọn tư cách
        auth/* → các trang đăng nhập / đăng ký
        (guest)/* → giao diện khách
        (customer)/* → giao diện khách hàng đã đăng nhập
      */}
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="(guest)" />
        <Stack.Screen name="(customer)" />
      </Stack>
    </LanguageProvider>
  );
}
