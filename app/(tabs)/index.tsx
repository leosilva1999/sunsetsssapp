import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";

import { BrandLogo } from "@/src/components/ui/BrandLogo";
import { Button } from "@/src/components/ui/Button";
import { LocationRankCard } from "@/src/components/LocationRankCard";
import { PhotoCard } from "@/src/components/PhotoCard";
import { LocationSuggestions } from "@/src/components/LocationSuggestions";
import { AccountMenu } from "@/src/components/AccountMenu";
import { useTheme } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/theme/themeStore";
import { useAuthStore } from "@/src/stores/authStore";
import { usePhotoCount, useRecentPhotos, useWeeklyRanking } from "@/src/hooks/useHomeData";
import { useUnreadCount } from "@/src/hooks/useNotifications";
import { useLocationSuggestions } from "@/src/hooks/useLocationSuggestions";
import type { PhotoSort } from "@/src/types/api";
import type { Location } from "@/src/types/entities";

export default function HomeScreen() {
  const { colors, fonts, scheme, sunIconColor } = useTheme();
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  const [search, setSearch] = useState("");
  const [photosTab, setPhotosTab] = useState<PhotoSort>("recent");

  const photoCount = usePhotoCount();
  const weeklyRanking = useWeeklyRanking();
  const recentPhotos = useRecentPhotos(photosTab);
  const unreadCount = useUnreadCount();

  // Sugestões instantâneas (dropdown). O dropdown é irmão do hero/ScrollView, posicionado em
  // absoluto abaixo do campo: no Android, um filho que extrapola os limites do pai não recebe
  // toque, então não dá pra deixá-lo dentro do hero.
  const rootRef = useRef<View>(null);
  const searchRef = useRef<View>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [rootWindowY, setRootWindowY] = useState(0);
  // Topo do teclado em coordenadas da tela (null = recolhido) — limita a altura do dropdown pro
  // teclado não cobrir as sugestões; a lista rola dentro do espaço que sobra.
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null);
  const { height: windowHeight } = useWindowDimensions();
  const suggestions = useLocationSuggestions(search, suggestionsOpen);

  const openSuggestions = () => {
    setSuggestionsOpen(true);
    rootRef.current?.measureInWindow((_x, rootY) => {
      setRootWindowY(rootY);
      searchRef.current?.measureInWindow((_sx, searchY, _sw, searchHeight) => {
        setDropdownTop(searchY + searchHeight - rootY + 6);
      });
    });
  };
  const closeSuggestions = useCallback(() => setSuggestionsOpen(false), []);

  // Fecha ao sair da aba. Recolher o teclado NÃO fecha: é como a pessoa vê a lista inteira.
  useFocusEffect(useCallback(() => closeSuggestions, [closeSuggestions]));
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (event) => setKeyboardTop(event.endCoordinates.screenY));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardTop(null));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleSearch = () => {
    closeSuggestions();
    Keyboard.dismiss();
    router.push({ pathname: "/(tabs)/explore", params: { q: search.trim(), ts: String(Date.now()) } });
  };

  const handleSelectSuggestion = (location: Location) => {
    closeSuggestions();
    Keyboard.dismiss();
    router.push(`/locations/${location.id}`);
  };

  const showSuggestions = suggestionsOpen && suggestions.visible;
  // Espaço livre abaixo do campo: até o topo do teclado, ou até o fim da tela. Sem piso mínimo
  // alto de propósito — o rodapé "Ver todos" precisa continuar visível.
  const dropdownMaxHeight = Math.max(
    140,
    (keyboardTop ?? windowHeight) - (rootWindowY + dropdownTop) - (keyboardTop ? 8 : 16)
  );

  return (
    <View ref={rootRef} collapsable={false} style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient colors={colors.gradient} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.header}>
            <BrandLogo variant="horizontal" height={22} />
            <View style={styles.headerActions}>
              <Pressable
                hitSlop={8}
                onPress={() => setThemePreference(scheme === "dark" ? "light" : "dark")}
                style={[styles.iconButton, { borderColor: colors.border }]}
              >
                <Ionicons name={scheme === "dark" ? "sunny-outline" : "moon-outline"} size={18} color={colors.textOnGradient} />
              </Pressable>
              {isSignedIn && (
                <Pressable hitSlop={8} onPress={() => router.push("/notifications")} style={[styles.iconButton, { borderColor: colors.border }]}>
                  <Ionicons name="notifications-outline" size={18} color={colors.textOnGradient} />
                  {!!unreadCount.data?.count && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.accent, borderColor: colors.background }]}>
                      <Text style={styles.unreadBadgeText}>{unreadCount.data.count > 9 ? "9+" : unreadCount.data.count}</Text>
                    </View>
                  )}
                </Pressable>
              )}
              <AccountMenu />
            </View>
          </View>

          <Text style={[styles.counter, { color: colors.textOnGradient, fontFamily: fonts.mono }]}>
            {photoCount.data ? `${photoCount.data.count} PÔR DO SOL CATALOGADOS` : " "}
          </Text>
          <Text style={[styles.title, { color: colors.textOnGradient, fontFamily: fonts.display }]}>
            Encontre o melhor lugar pra ver o sol se pôr
          </Text>
          <Text style={[styles.subtitle, { color: colors.textOnGradient, fontFamily: fonts.body }]}>
            Descubra os pontos de pôr do sol mais bem avaliados perto de você, veja fotos de quem já foi e
            compartilhe as suas.
          </Text>

          <View ref={searchRef} collapsable={false} style={[styles.searchRow, { backgroundColor: colors.surface }]}>
            <TextInput
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                openSuggestions();
              }}
              onFocus={openSuggestions}
              onSubmitEditing={handleSearch}
              placeholder="Buscar por cidade, praia ou mirante..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.body }]}
              returnKeyType="search"
            />
            <Pressable style={[styles.searchButton, { backgroundColor: colors.textPrimary }]} onPress={handleSearch}>
              <Text style={[styles.searchButtonLabel, { color: colors.background, fontFamily: fonts.bodyBold }]}>
                Buscar
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
              Ranking da semana
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/ranking")}>
              <Text style={[styles.sectionLink, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>Ver tudo</Text>
            </Pressable>
          </View>
          <View style={styles.rankingList}>
            {(weeklyRanking.data ?? []).slice(0, 5).map((location, index) => (
              <LocationRankCard key={location.id} rank={index + 1} location={location} />
            ))}
            {weeklyRanking.isLoading && (
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Carregando ranking...
              </Text>
            )}
            {weeklyRanking.isSuccess && weeklyRanking.data.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Nenhuma avaliação nos últimos 7 dias ainda.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
            Fotos recentes
          </Text>
          <View style={styles.tabs}>
            <PhotosTabButton label="Recentes" active={photosTab === "recent"} onPress={() => setPhotosTab("recent")} />
            <PhotosTabButton
              label="Mais curtidas"
              active={photosTab === "top"}
              onPress={() => setPhotosTab("top")}
            />
          </View>

          <View style={styles.photoGrid}>
            {(recentPhotos.data?.items ?? []).slice(0, 6).map((photo) => (
              <PhotoCard key={photo.id} photo={photo} queryKey={["photos", "list", photosTab]} />
            ))}
          </View>
        </View>

        <View style={[styles.cta, { backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="camera-outline" size={28} color={sunIconColor} />
          <Text style={[styles.ctaTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
            Tirou uma foto boa hoje?
          </Text>
          <Button
            label="Postar foto"
            onPress={() => router.push(isSignedIn ? "/photos/new" : "/(auth)/login")}
          />
        </View>
      </ScrollView>

      {showSuggestions && (
        <>
          <Pressable style={[styles.backdrop, { top: dropdownTop }]} onPress={closeSuggestions} />
          <View style={[styles.dropdown, { top: dropdownTop, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LocationSuggestions
              text={search}
              locations={suggestions.locations}
              isSearching={suggestions.isSearching}
              error={suggestions.error}
              maxHeight={dropdownMaxHeight}
              onSelect={handleSelectSuggestion}
              onSeeAll={handleSearch}
            />
          </View>
        </>
      )}
    </View>
  );
}

function PhotosTabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors, fonts } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabButton, { backgroundColor: active ? colors.textPrimary : colors.surfaceAlt }]}
    >
      <Text
        style={[
          styles.tabButtonLabel,
          { color: active ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  unreadBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  counter: { fontSize: 12, letterSpacing: 1, marginTop: 28 },
  title: { fontSize: 32, lineHeight: 38, marginTop: 8 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 12, opacity: 0.9 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingLeft: 18,
    paddingRight: 4,
    marginTop: 20,
    minHeight: 52,
  },
  searchInput: { flex: 1, fontSize: 14 },
  searchButton: { borderRadius: 999, paddingHorizontal: 20, paddingVertical: 12 },
  searchButtonLabel: { fontSize: 14 },
  body: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 32 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 20 },
  sectionLink: { fontSize: 13 },
  rankingList: { gap: 10 },
  emptyText: { fontSize: 13 },
  tabs: { flexDirection: "row", gap: 8 },
  tabButton: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  tabButtonLabel: { fontSize: 12 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  backdrop: { position: "absolute", left: 0, right: 0, bottom: 0 },
  dropdown: {
    position: "absolute",
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cta: { borderRadius: 20, padding: 24, alignItems: "center", gap: 10 },
  ctaTitle: { fontSize: 18, textAlign: "center" },
});
