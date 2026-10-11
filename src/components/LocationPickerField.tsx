import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../theme/useTheme";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useLocationsSearch } from "../hooks/useLocationsSearch";
import { useCreateLocation } from "../hooks/useCreateLocation";
import { LocationMapPicker } from "./LocationMapPicker";
import { reverseGeocodeCity, type LatLng } from "../lib/geo";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";
import { getErrorMessage } from "../lib/errorMessage";
import type { Location } from "../types/entities";

interface LocationPickerFieldProps {
  value: Location | null;
  onChange: (location: Location | null) => void;
}

// Busca instantânea (mesma de Explorar) + opção de cadastrar local novo, embutidas no fluxo de
// postar foto (seção 5.8).
export function LocationPickerField({ value, onChange }: LocationPickerFieldProps) {
  const { colors, fonts, sunIconColor } = useTheme();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), 400);
  const results = useLocationsSearch(debouncedSearch);
  const createLocation = useCreateLocation();

  const [creatingOpen, setCreatingOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [newPoint, setNewPoint] = useState<LatLng | null>(null);
  // Se o usuário já digitou a cidade à mão, não sobrescrevemos com a do reverse geocode.
  const cityEdited = useRef(false);

  const handlePointChange = (point: LatLng) => {
    setNewPoint(point);
    if (cityEdited.current) return;
    void reverseGeocodeCity(point).then((city) => {
      if (city && !cityEdited.current) setNewCity(city);
    });
  };

  const items = useMemo(() => results.data?.pages.flatMap((page) => page.items).slice(0, 6) ?? [], [results.data]);

  if (value) {
    return (
      <View style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="location" size={18} color={sunIconColor} />
        <Text style={[styles.chipText, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
          {value.name}, {value.city}
        </Text>
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <Text style={[styles.changeLink, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>Trocar</Text>
        </Pressable>
      </View>
    );
  }

  const handleCreate = () => {
    if (!newPoint) return;
    setCreateError(null);
    createLocation.mutate(
      { name: newName.trim(), city: newCity.trim(), ...newPoint },
      {
        onSuccess: (location) => {
          onChange(location);
          setCreatingOpen(false);
          setNewName("");
          setNewCity("");
          setNewPoint(null);
          cityEdited.current = false;
        },
        onError: (error) => setCreateError(getErrorMessage(error, "Não foi possível cadastrar o local.")),
      }
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por cidade, praia ou mirante..."
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.textPrimary, fontFamily: fonts.body }]}
          autoCapitalize="none"
        />
        {results.isLoading && <ActivityIndicator size="small" color={colors.textSecondary} />}
      </View>

      {debouncedSearch.length > 0 && (
        <View style={styles.results}>
          {items.map((location) => (
            <Pressable key={location.id} onPress={() => onChange(location)} style={styles.resultRow}>
              <Text style={[styles.resultText, { color: colors.textPrimary, fontFamily: fonts.body }]}>
                {location.name}, {location.city}
              </Text>
            </Pressable>
          ))}
          {!results.isLoading && items.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: fonts.body }]}>
              Nenhum local encontrado.
            </Text>
          )}
        </View>
      )}

      {creatingOpen ? (
        <View style={[styles.createCard, { borderColor: colors.border }]}>
          <TextField label="Nome do local" value={newName} onChangeText={setNewName} placeholder="Ex.: Praia do Rosa" />
          <TextField
            label="Cidade"
            value={newCity}
            onChangeText={(text) => {
              cityEdited.current = true;
              setNewCity(text);
            }}
            placeholder="Ex.: Imbituba"
          />
          <LocationMapPicker value={newPoint} onChange={handlePointChange} />
          {createError ? (
            <Text style={[styles.errorText, { color: colors.danger, fontFamily: fonts.body }]}>{createError}</Text>
          ) : null}
          <Button
            label="Cadastrar e usar este local"
            onPress={handleCreate}
            loading={createLocation.isPending}
            disabled={!newName.trim() || !newCity.trim() || !newPoint}
          />
          <Button label="Cancelar" variant="ghost" onPress={() => setCreatingOpen(false)} />
        </View>
      ) : (
        <Pressable onPress={() => setCreatingOpen(true)} hitSlop={6}>
          <Text style={[styles.createLink, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>
            Não encontrou? Cadastrar novo local
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, padding: 14 },
  chipText: { flex: 1, fontSize: 14 },
  changeLink: { fontSize: 13 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  searchInput: { flex: 1, fontSize: 14 },
  results: { gap: 2 },
  resultRow: { paddingVertical: 8 },
  resultText: { fontSize: 14 },
  emptyText: { fontSize: 13, paddingVertical: 4 },
  createLink: { fontSize: 13 },
  createCard: { gap: 12, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14 },
  errorText: { fontSize: 12 },
});
