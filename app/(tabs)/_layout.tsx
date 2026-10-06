import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "@/src/stores/authStore";
import { useTheme } from "@/src/theme/useTheme";
import { HapticTab } from "@/src/components/ui/HapticTab";

export default function TabsLayout() {
  const status = useAuthStore((s) => s.status);
  const { colors, sunIconColor, fonts } = useTheme();

  if (status === "signedOut") return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: sunIconColor,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{ title: "Fotos", tabBarIcon: ({ color, size }) => <Ionicons name="images" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="ranking"
        options={{ title: "Ranking", tabBarIcon: ({ color, size }) => <Ionicons name="trophy" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
