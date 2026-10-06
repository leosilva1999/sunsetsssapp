import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

import { fontsToLoad } from "@/src/theme/typography";
import { useTheme } from "@/src/theme/useTheme";
import { queryClient } from "@/src/lib/queryClient";
import { useAuthStore } from "@/src/stores/authStore";
import { getStoredSession } from "@/src/lib/secureStorage";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontsToLoad);
  const [hydrated, setHydrated] = useState(false);
  const hydrate = useAuthStore((s) => s.hydrate);
  const { scheme, colors } = useTheme();

  useEffect(() => {
    getStoredSession()
      .then(hydrate)
      .catch(() => hydrate(null))
      .finally(() => setHydrated(true));
  }, [hydrate]);

  const ready = (fontsLoaded || !!fontError) && hydrated;

  const onLayoutRootView = useCallback(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <QueryClientProvider client={queryClient}>
        <View style={[styles.root, { backgroundColor: colors.background }]}>
          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }} />

        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
