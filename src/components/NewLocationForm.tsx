import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../theme/useTheme";
import { useCreateLocation } from "../hooks/useCreateLocation";
import { ApiError } from "../api/client";
import { getFieldErrors } from "../lib/fieldErrors";
import { getErrorMessage } from "../lib/errorMessage";
import { LOCATION_CATEGORIES, LOCATION_CATEGORY_LABELS } from "../lib/locationCategory";
import type { LatLng } from "../lib/geo";
import type { Location, LocationCategory } from "../types/entities";
import { LocationMapPicker } from "./LocationMapPicker";
import { CityPicker, type CitySelection } from "./CityPicker";
import { DuplicateCandidates } from "./DuplicateCandidates";
import { Button } from "./ui/Button";
import { TextField } from "./ui/TextField";

const DESCRIPTION_MAX_LENGTH = 1000;

interface NewLocationFormProps {
  onCreated: (location: Location) => void;
  onCancel: () => void;
}

// Cadastro de local novo (docs/API.md, `POST /locations`): nome, pino no mapa, cidade do catálogo
// (sugerida pelo pino), categoria e descrição opcionais. Se a API achar um local parecido (409 +
// `candidateLocationIds`), mostra os candidatos antes de criar.
export function NewLocationForm({ onCreated, onCancel }: NewLocationFormProps) {
  const { colors, fonts } = useTheme();
  const createLocation = useCreateLocation();

  const [name, setName] = useState("");
  const [point, setPoint] = useState<LatLng | null>(null);
  const [city, setCity] = useState<CitySelection | null>(null);
  const [category, setCategory] = useState<LocationCategory | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [duplicateIds, setDuplicateIds] = useState<string[] | null>(null);

  const canSubmit = !!name.trim() && !!point && !!city?.label.trim();

  const submit = (confirmDistinct = false) => {
    if (!point || !city) return;
    setError(null);
    createLocation.mutate(
      {
        name: name.trim(),
        latitude: point.latitude,
        longitude: point.longitude,
        // Catálogo → `cityId`; texto livre (fallback) → `city`.
        ...(city.id ? { cityId: city.id } : { city: city.label.trim() }),
        ...(category ? { category } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(confirmDistinct ? { confirmDistinct: true } : {}),
      },
      {
        onSuccess: onCreated,
        onError: (err) => {
          const candidates = err instanceof ApiError && err.status === 409 ? getFieldErrors(err, "candidateLocationIds") : [];
          if (candidates.length > 0) {
            setDuplicateIds(candidates);
            return;
          }
          setError(getErrorMessage(err, "Não foi possível cadastrar o local."));
        },
      }
    );
  };

  if (duplicateIds) {
    return (
      <DuplicateCandidates
        ids={duplicateIds}
        creating={createLocation.isPending}
        onSelect={onCreated}
        onCreateAnyway={() => submit(true)}
        onBack={() => setDuplicateIds(null)}
      />
    );
  }

  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <TextField label="Nome do local" value={name} onChangeText={setName} placeholder="Ex.: Praia do Rosa" />
      <LocationMapPicker value={point} onChange={setPoint} />
      <CityPicker point={point} value={city} onChange={setCity} />

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: fonts.bodyMedium }]}>Categoria (opcional)</Text>
        <View style={styles.categories}>
          {LOCATION_CATEGORIES.map((value) => {
            const selected = category === value;
            return (
              <Pressable
                key={value}
                onPress={() => setCategory(selected ? null : value)}
                style={[
                  styles.categoryChip,
                  { backgroundColor: selected ? colors.textPrimary : colors.surface, borderColor: selected ? colors.textPrimary : colors.border },
                ]}
              >
                <Text style={[styles.categoryText, { color: selected ? colors.background : colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                  {LOCATION_CATEGORY_LABELS[value]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <TextField
          label="Descrição (opcional)"
          value={description}
          onChangeText={(text) => setDescription(text.slice(0, DESCRIPTION_MAX_LENGTH))}
          placeholder="Como é o lugar, como chegar, melhor horário..."
          multiline
          numberOfLines={3}
          maxLength={DESCRIPTION_MAX_LENGTH}
        />
        <Text style={[styles.counter, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
          {description.length}/{DESCRIPTION_MAX_LENGTH}
        </Text>
      </View>

      {error ? <Text style={[styles.error, { color: colors.danger, fontFamily: fonts.body }]}>{error}</Text> : null}
      <Button label="Cadastrar e usar este local" onPress={() => submit()} loading={createLocation.isPending} disabled={!canSubmit} />
      <Button label="Cancelar" variant="ghost" onPress={onCancel} disabled={createLocation.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14 },
  field: { gap: 6 },
  label: { fontSize: 13 },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  categoryText: { fontSize: 12 },
  counter: { fontSize: 11, alignSelf: "flex-end" },
  error: { fontSize: 12 },
});
