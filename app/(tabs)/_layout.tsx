import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/src/theme/useTheme";
import { HapticTab } from "@/src/components/ui/HapticTab";

// Navegação por tabs é pública (seção 5 da spec — Início/Explorar/Fotos/Ranking não exigem
// login). Telas/ações que exigem sessão (perfil próprio, postar foto) checam e redirecionam
// individualmente — ver app/(tabs)/profile.tsx e o CTA de postar foto na Home.
export default function TabsLayout() {
  const { colors, sunIconColor, fonts } = useTheme();

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
