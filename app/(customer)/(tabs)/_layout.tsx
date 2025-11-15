import useTranslation from "@/app/hooks/useTranslation";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        tabBarActiveTintColor: "#FFC107",
        tabBarInactiveTintColor: "#555",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("guestAccount.home"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: t("guestAccount.menu"),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="hamburger" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("guestAccount.account"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
