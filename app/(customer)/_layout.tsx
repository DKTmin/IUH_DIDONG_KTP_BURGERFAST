// app/(customer)/_layout.tsx
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import useTranslation from "../hooks/useTranslation";

export default function CustomerLayout() {
    const { t } = useTranslation();

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#FFC107", // 🌟 Màu icon và text khi đang chọn
            tabBarInactiveTintColor: "#555", // Màu khi không chọn
            tabBarStyle: {
                backgroundColor: "#fff", // Nền tab bar trắng cho nổi màu vàng
                borderTopColor: "#eee",
                height: 60,
                paddingBottom: 8,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "600",
            },
        }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: t('guestAccount.home'),
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: t('guestAccount.menu'),
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="hamburger" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="account"
                options={{
                    title: t('guestAccount.account'),
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
                }}
            />

            {/* ✅ Ẩn route (stack) khỏi tab bar */}
            <Tabs.Screen
                name="(stack)"
                options={{
                    href: null, // Không hiển thị trên thanh Tab
                }}
            />
        </Tabs>
    );
}
