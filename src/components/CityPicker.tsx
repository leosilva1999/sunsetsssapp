import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/useTheme";
import { useCitySearch, useNearestCities } from "../hooks/useCities";
import { reverseGeocodeCity, type LatLng } from "../lib/geo";
import { TextField } from "./ui/TextField";
import type { CityParent } from "../types/entities";

/** `id` = cidade do catálogo (vai como `cityId`); `id: null` = texto livre (fallback, vai como `city`). */
export interface CitySelection {
  id: string | null;
  label: string;
}

interface Place {
  id: string;
  kind: "Municipality" | "Locality";
  name: string;
  state: string;
  parent: CityParent | null;
}

// "Praia do Rosa, Imbituba - SC" (localidade) ou "Imbituba - SC" (município).
function placeLabel(place: Place): string {
  return place.kind === "Locality" && place.parent
    ? `${place.name}, ${place.parent.name} - ${place.state}`
    : `${place.name} - ${place.state}`;
}

const selectionOf = (place: Place): CitySelection => ({ id: place.id, label: placeLabel(place) });

interface CityPickerProps {
  /** pino marcado no mapa — com ele sugerimos as cidades mais próximas. */
  point: LatLng | null;
  value: CitySelection | null;
  onChange: (value: CitySelection | null) => void;
}

// Escolha da cidade ao cadastrar um local (docs/API.md, "Cities" e "GET /geo/cities"): sugere as
// mais próximas do pino (a primeira já vem escolhida), deixa trocar por uma busca no catálogo e
// avisa — sem bloquear — se o pino estiver a mais de 150 km do centro da cidade escolhida. Se o
// catálogo não achar nada perto, cai pra texto livre (a API ainda aceita `city`).
export function CityPicker({ point, value, onChange }: CityPickerProps) {
  const { colors, fonts, sunIconColor } = useTheme();
  const nearest = useNearestCities(point, value?.id ?? null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const search = useCitySearch(query);
  // Depois de uma escolha/limpeza manual não sobrescrevemos mais com a sugestão automática.
  const touched = useRef(false);

  const suggestions = useMemo(() => nearest.data?.items ?? [], [nearest.data]);
  const farAway = nearest.data?.chosenCity?.farAway && nearest.data.chosenCity.id === value?.id;
  const catalogEmpty = !!point && (nearest.isError || (nearest.isFetched && suggestions.length === 0));

  useEffect(() => {
    if (!touched.current && !value && suggestions.length > 0) onChange(selectionOf(suggestions[0]));
  }, [suggestions, value, onChange]);

  // Sem nada no catálogo perto, preenche o texto livre com a cidade do geocoder do aparelho.
  useEffect(() => {
    if (!catalogEmpty || !point || touched.current || value) return;
    void reverseGeocodeCity(point).then((city) => {
      if (city && !touched.current) onChange({ id: null, label: city });
    });
  }, [catalogEmpty, point, value, onChange]);

  const choose = (selection: CitySelection | null) => {
    touched.current = true;
    onChange(selection);
    setSearching(false);
    setQuery("");
  };

  const chip = (key: string, label: string, selected: boolean, onPress: () => void, hint?: string) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: selected ? colors.surfaceAlt : colors.surface, borderColor: selected ? colors.accent : colors.border },
      ]}
    >
      {selected && <Ionicons name="checkmark-circle" size={14} color={sunIconColor} />}
      <Text style={[styles.chipText, { color: colors.textPrimary, fontFamily: fonts.body }]} numberOfLines={1}>
        {label}
      </Text>
      {hint ? <Text style={[styles.chipHint, { color: colors.textSecondary, fontFamily: fonts.mono }]}>{hint}</Text> : null}
    </Pressable>
  );

  const chosenIsExtra = !!value?.id && !suggestions.some((place) => place.id === value.id);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Cidade</Text>

      {!point ? (
        <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fonts.body }]}>
          Marque o local no mapa para sugerirmos a cidade.
        </Text>
      ) : (
        <>
          {nearest.isFetching && suggestions.length === 0 ? <ActivityIndicator size="small" color={colors.textSecondary} /> : null}
          <View style={styles.chips}>
            {suggestions.map((place) =>
              chip(place.id, placeLabel(place), value?.id === place.id, () => choose(selectionOf(place)), `${place.distanceKm.toFixed(1)} km`)
            )}
            {chosenIsExtra && value ? chip(value.id!, value.label, true, () => undefined) : null}
          </View>

          {catalogEmpty && !value?.id ? (
            <TextField
              label="Cidade (digite)"
              value={value?.label ?? ""}
              onChangeText={(text) => choose(text ? { id: null, label: text } : null)}
              placeholder="Ex.: Imbituba - SC"
            />
          ) : null}

          {farAway ? (
            <Text style={[styles.warning, { color: colors.danger, fontFamily: fonts.body }]}>
              O pino está a mais de 150 km do centro de {value?.label}. Confira se é a cidade certa.
            </Text>
          ) : null}

          {searching ? (
            <View style={styles.searchBox}>
              <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Ionicons name="search" size={16} color={colors.textSecondary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  autoFocus
                  placeholder="Buscar cidade ou localidade..."
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.body }]}
                />
                {search.isSearching ? <ActivityIndicator size="small" color={colors.textSecondary} /> : null}
              </View>
              {search.cities.map((city) => (
                <Pressable key={city.id} style={styles.resultRow} onPress={() => choose(selectionOf(city))}>
                  <Text style={[styles.resultText, { color: colors.textPrimary, fontFamily: fonts.body }]}>{placeLabel(city)}</Text>
                </Pressable>
              ))}
              {query.trim().length >= 2 && !search.isSearching && search.cities.length === 0 ? (
                <Text style={[styles.hint, { color: colors.textSecondary, fontFamily: fonts.body }]}>
                  {search.isError ? "Não foi possível buscar agora." : "Nenhuma cidade encontrada."}
                </Text>
              ) : null}
            </View>
          ) : (
            <Pressable onPress={() => setSearching(true)} hitSlop={6}>
              <Text style={[styles.link, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>Buscar outra cidade</Text>
            </Pressable>
          )}
        </>
      )}

      <Text
        style={[styles.attribution, { color: colors.textSecondary, fontFamily: fonts.body }]}
        onPress={() => void Linking.openURL("https://www.geonames.org/")}
      >
        Dados geográficos: GeoNames (CC BY 4.0)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  label: { fontSize: 13 },
  hint: { fontSize: 12, lineHeight: 17 },
  chips: { gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  chipText: { flex: 1, fontSize: 13 },
  chipHint: { fontSize: 11 },
  warning: { fontSize: 12, lineHeight: 17 },
  searchBox: { gap: 4 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 14, minHeight: 44 },
  searchInput: { flex: 1, fontSize: 14 },
  resultRow: { paddingVertical: 9 },
  resultText: { fontSize: 14 },
  link: { fontSize: 13 },
  attribution: { fontSize: 11, textDecorationLine: "underline" },
});
