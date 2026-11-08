import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Link, Stack, router, useLocalSearchParams } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { Button } from "@/src/components/ui/Button";
import { TextField } from "@/src/components/ui/TextField";
import { RatingStars } from "@/src/components/RatingStars";
import { LocationMap } from "@/src/components/LocationMap";
import { ReportModal } from "@/src/components/ReportModal";
import { moderationApi } from "@/src/api/moderation";
import { ApiError } from "@/src/api/client";
import { REPORT_REASONS_FOR_LOCATION } from "@/src/lib/reportReasons";
import { LOCATION_CATEGORY_LABELS } from "@/src/lib/locationCategory";
import { formatDistance } from "@/src/lib/formatDistance";
import type { ReportReason } from "@/src/types/entities";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";
import { getErrorMessage } from "@/src/lib/errorMessage";
import {
  useDeleteRating,
  useLocation,
  useLocationPhotos,
  useLocationRatings,
  useLocationSunset,
  useMyRating,
  useNearbyLocations,
  useUpsertRating,
} from "@/src/hooks/useLocationDetail";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

// Seção 5.4. Mapa: a proposta da API (docs/proposal-location-map-embed.md) é pra web (iframe +
// key do Google Maps Embed). Sem key configurada e sem build nativo (react-native-maps exigiria
// sair do Expo Go), usamos "abrir no app de Mapas" — zero credencial, funciona hoje.
export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, fonts, sunIconColor, headerOptions } = useTheme();
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");

  const location = useLocation(id);
  const sunset = useLocationSunset(id);
  const photos = useLocationPhotos(id);
  const ratings = useLocationRatings(id);
  const nearby = useNearbyLocations(id);
  const myRating = useMyRating(id);
  const upsertRating = useUpsertRating(id);
  const deleteRating = useDeleteRating(id);

  const [reportOpen, setReportOpen] = useState(false);
  const reportLocation = useMutation({
    mutationFn: (payload: { reason: ReportReason; details?: string }) => moderationApi.reportLocation(id, payload),
    onSuccess: () => {
      setReportOpen(false);
      Alert.alert("Obrigado!", "Recebemos o aviso e nossa equipe vai revisar este local.");
    },
    onError: (error) => {
      // 409 = esta pessoa já denunciou este local (uma denúncia por alvo).
      const already = error instanceof ApiError && error.status === 409;
      setReportOpen(false);
      Alert.alert(
        already ? "Você já avisou sobre este local" : "Não foi possível enviar",
        already ? "Nossa equipe já vai analisar." : getErrorMessage(error, "Tente de novo.")
      );
    },
  });

  const handleReport = () => {
    if (!isSignedIn) {
      router.push("/(auth)/login");
      return;
    }
    setReportOpen(true);
  };

  const [formOpen, setFormOpen] = useState(false);
  const [draftScore, setDraftScore] = useState(0);
  const [draftComment, setDraftComment] = useState("");

  const openRatingForm = () => {
    setDraftScore(myRating.data?.score ?? 0);
    setDraftComment(myRating.data?.comment ?? "");
    setFormOpen(true);
  };

  const handleSubmitRating = () => {
    upsertRating.mutate(
      { score: draftScore, comment: draftComment.trim() || null },
      {
        onSuccess: () => setFormOpen(false),
        onError: (error) => Alert.alert("Não foi possível salvar", getErrorMessage(error, "Tente de novo.")),
      }
    );
  };

  const handleDeleteRating = () => {
    Alert.alert("Remover avaliação", "Tem certeza que quer remover sua avaliação?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: () => deleteRating.mutate(undefined, { onSuccess: () => setFormOpen(false) }),
      },
    ]);
  };

  const handleOpenMap = () => {
    if (!location.data) return;
    const { latitude, longitude } = location.data;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
  };

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: location.data?.name ?? "Local", ...headerOptions }} />

      {location.isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      ) : location.isError || !location.data ? (
        <View style={styles.centerFill}>
          <Text style={{ color: colors.textSecondary, fontFamily: fonts.body }}>
            Não foi possível carregar este local.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Text style={[styles.name, { color: colors.textPrimary, fontFamily: fonts.display }]}>
              {location.data.name}
            </Text>
            <Text style={[styles.city, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              {location.data.localityName ? `${location.data.localityName}, ` : ""}
              {location.data.city}
            </Text>
            <View style={styles.ratingRow}>
              <RatingStars value={Math.round(location.data.avgRating)} />
              <Text style={[styles.ratingValue, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
                {location.data.avgRating.toFixed(1)}
              </Text>
              {location.data.ratingsCount !== undefined ? (
                <Text style={[styles.counts, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  · {location.data.ratingsCount} {location.data.ratingsCount === 1 ? "avaliação" : "avaliações"}
                  {location.data.photosCount !== undefined
                    ? ` · ${location.data.photosCount} ${location.data.photosCount === 1 ? "foto" : "fotos"}`
                    : ""}
                </Text>
              ) : null}
            </View>
            {location.data.category ? (
              <View style={[styles.categoryChip, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.categoryText, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                  {LOCATION_CATEGORY_LABELS[location.data.category] ?? location.data.category}
                </Text>
              </View>
            ) : null}
            {location.data.description ? (
              <Text style={[styles.description, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                {location.data.description}
              </Text>
            ) : null}
          </View>

          {sunset.data && !sunset.isError ? (
            <View style={[styles.card, { backgroundColor: colors.surfaceAlt }]}>
              <View style={styles.sunsetRow}>
                <Ionicons name="sunny" size={22} color={sunIconColor} />
                <Text style={[styles.sunsetTime, { color: colors.textPrimary, fontFamily: fonts.displayBold }]}>
                  Pôr do sol hoje às {formatTime(sunset.data.sunset)}
                </Text>
              </View>
              <Link href="https://sunrise-sunset.org" style={[styles.attribution, { color: colors.textSecondary }]}>
                Horários via sunrise-sunset.org
              </Link>
            </View>
          ) : null}

          <View style={styles.mapSection}>
            <LocationMap
              latitude={location.data.latitude}
              longitude={location.data.longitude}
              name={location.data.name}
            />
            <Pressable style={styles.mapLinkRow} onPress={handleOpenMap} hitSlop={6}>
              <Ionicons name="navigate-outline" size={16} color={colors.accent} />
              <Text style={[styles.mapLinkLabel, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>
                Abrir no app de Mapas
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
              Fotos do local
            </Text>
            {photos.data?.items.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {photos.data.items.map((photo) => (
                  <Pressable key={photo.id} onPress={() => router.push(`/photos/${photo.id}`)}>
                    <Image source={{ uri: photo.imageUrl }} style={styles.photoThumb} />
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Nenhuma foto deste local ainda.
              </Text>
            )}
          </View>

          {nearby.data && nearby.data.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                Locais por perto
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoRow}>
                {nearby.data.map((place) => (
                  <Pressable
                    key={place.id}
                    style={[styles.nearbyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => router.push(`/locations/${place.id}`)}
                  >
                    <Text style={[styles.nearbyName, { color: colors.textPrimary, fontFamily: fonts.display }]} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text style={[styles.nearbyCity, { color: colors.textSecondary, fontFamily: fonts.body }]} numberOfLines={1}>
                      {place.city}
                    </Text>
                    <View style={styles.nearbyMeta}>
                      <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
                      <Text style={[styles.nearbyDistance, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
                        {place.distanceKm != null ? formatDistance(place.distanceKm) : ""}
                      </Text>
                      <Text style={[styles.nearbyDistance, { color: colors.textPrimary, fontFamily: fonts.mono }]}>
                        {"  "}
                        {place.avgRating.toFixed(1)}
                      </Text>
                      <Ionicons name="star" size={11} color={sunIconColor} />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {isSignedIn && (
            <View style={styles.section}>
              {formOpen ? (
                <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
                    Sua avaliação
                  </Text>
                  <RatingStars value={draftScore} onChange={setDraftScore} size={30} />
                  <TextField
                    label="Comentário (opcional)"
                    value={draftComment}
                    onChangeText={setDraftComment}
                    placeholder="O que achou deste local?"
                    multiline
                    numberOfLines={3}
                    maxLength={1000}
                  />
                  <Button
                    label="Salvar avaliação"
                    onPress={handleSubmitRating}
                    loading={upsertRating.isPending}
                    disabled={draftScore === 0}
                  />
                  <Button label="Cancelar" variant="ghost" onPress={() => setFormOpen(false)} />
                  {myRating.data ? (
                    <Pressable onPress={handleDeleteRating} hitSlop={8}>
                      <Text style={[styles.removeLink, { color: colors.danger, fontFamily: fonts.bodyMedium }]}>
                        Remover avaliação
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : (
                <Button label={myRating.data ? "Editar avaliação" : "Avaliar este local"} onPress={openRatingForm} />
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.display }]}>
              Avaliações
            </Text>
            {ratings.data?.items.length ? (
              <View style={styles.ratingsList}>
                {ratings.data.items.map((rating) => (
                  <View key={rating.id} style={styles.ratingItem}>
                    {rating.userAvatarUrl ? (
                      <Image source={{ uri: rating.userAvatarUrl }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}>
                        <Ionicons name="person" size={14} color={colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.ratingItemBody}>
                      <View style={styles.ratingItemHeader}>
                        <Text
                          style={[styles.ratingUserName, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}
                          numberOfLines={1}
                        >
                          {rating.userName}
                        </Text>
                        <Text style={[styles.ratingDate, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
                          {formatDate(rating.createdAt)}
                        </Text>
                      </View>
                      <RatingStars value={rating.score} size={13} />
                      {rating.comment ? (
                        <Text style={[styles.ratingComment, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                          {rating.comment}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                Nenhuma avaliação ainda.
              </Text>
            )}
          </View>

          <Pressable style={styles.reportRow} onPress={handleReport} hitSlop={8}>
            <Ionicons name="flag-outline" size={15} color={colors.textSecondary} />
            <Text style={[styles.reportLabel, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Algo errado neste local? Avisar a equipe
            </Text>
          </Pressable>
        </ScrollView>
      )}

      <ReportModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={(payload) => reportLocation.mutate(payload)}
        loading={reportLocation.isPending}
        reasons={REPORT_REASONS_FOR_LOCATION}
        title="Avisar sobre este local"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, paddingBottom: 40, gap: 24 },
  hero: { gap: 6 },
  name: { fontSize: 26 },
  city: { fontSize: 15 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  ratingValue: { fontSize: 15 },
  counts: { fontSize: 13 },
  categoryChip: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  categoryText: { fontSize: 12 },
  description: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  nearbyCard: { width: 170, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 12, gap: 3 },
  nearbyName: { fontSize: 15 },
  nearbyCity: { fontSize: 12 },
  nearbyMeta: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  nearbyDistance: { fontSize: 12 },
  reportRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 },
  reportLabel: { fontSize: 12 },
  card: { borderRadius: 16, padding: 16, gap: 8 },
  sunsetRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  sunsetTime: { fontSize: 15 },
  attribution: { fontSize: 11 },
  mapSection: { gap: 10 },
  mapLinkRow: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "center" },
  mapLinkLabel: { fontSize: 13 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 19 },
  photoRow: { gap: 10 },
  photoThumb: { width: 100, height: 100, borderRadius: 12 },
  emptyText: { fontSize: 13 },
  removeLink: { fontSize: 13, textAlign: "center", marginTop: 4 },
  ratingsList: { gap: 16 },
  ratingItem: { flexDirection: "row", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  ratingItemBody: { flex: 1, gap: 4 },
  ratingItemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  ratingUserName: { fontSize: 14, flexShrink: 1 },
  ratingDate: { fontSize: 11 },
  ratingComment: { fontSize: 13, lineHeight: 19 },
});
