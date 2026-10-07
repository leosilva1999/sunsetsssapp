import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { Button } from "@/src/components/ui/Button";
import { TextField } from "@/src/components/ui/TextField";
import { LocationPickerField } from "@/src/components/LocationPickerField";
import { useTheme } from "@/src/theme/useTheme";
import { useCreatePhoto } from "@/src/hooks/useCreatePhoto";
import { getErrorMessage } from "@/src/lib/errorMessage";
import type { Location } from "@/src/types/entities";

type PickedImage = { uri: string; mimeType?: string | null };

// Seção 5.8: escolher foto → recortar (crop nativo do picker) → local → legenda → publicar.
export default function PostPhotoScreen() {
  const { colors, fonts } = useTheme();
  const [image, setImage] = useState<PickedImage | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [caption, setCaption] = useState("");

  const createPhoto = useCreatePhoto();

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos pra continuar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImage({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à câmera pra continuar.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImage({ uri: result.assets[0].uri, mimeType: result.assets[0].mimeType });
    }
  };

  const canPublish = !!image && !!location && !createPhoto.isPending;

  const handlePublish = () => {
    if (!image || !location) return;
    createPhoto.mutate(
      { localUri: image.uri, mimeType: image.mimeType, locationId: location.id, caption: caption.trim() || null },
      {
        onSuccess: (photo) => router.replace(`/photos/${photo.id}`),
        onError: (error) => Alert.alert("Não foi possível publicar", getErrorMessage(error, "Tente de novo.")),
      }
    );
  };

  return (
    <Screen edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary, fontFamily: fonts.display }]}>Postar foto</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>Foto</Text>
          {image ? (
            <View>
              <Image source={{ uri: image.uri }} style={styles.preview} />
              <Pressable onPress={pickFromLibrary} hitSlop={6}>
                <Text style={[styles.changeLink, { color: colors.accent, fontFamily: fonts.bodyMedium }]}>
                  Trocar foto
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.imageButtons}>
              <Pressable
                style={[styles.imageButton, { backgroundColor: colors.surfaceAlt }]}
                onPress={takePhoto}
              >
                <Ionicons name="camera-outline" size={26} color={colors.textPrimary} />
                <Text style={[styles.imageButtonLabel, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                  Tirar foto
                </Text>
              </Pressable>
              <Pressable
                style={[styles.imageButton, { backgroundColor: colors.surfaceAlt }]}
                onPress={pickFromLibrary}
              >
                <Ionicons name="images-outline" size={26} color={colors.textPrimary} />
                <Text style={[styles.imageButtonLabel, { color: colors.textPrimary, fontFamily: fonts.bodyMedium }]}>
                  Escolher da galeria
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontFamily: fonts.bodyBold }]}>Local</Text>
          <LocationPickerField value={location} onChange={setLocation} />
        </View>

        <View style={styles.section}>
          <TextField
            label="Legenda (opcional)"
            value={caption}
            onChangeText={setCaption}
            placeholder="Conte sobre esse pôr do sol..."
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        <Button label="Publicar" onPress={handlePublish} loading={createPhoto.isPending} disabled={!canPublish} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40, gap: 24 },
  title: { fontSize: 26 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 14 },
  imageButtons: { flexDirection: "row", gap: 12 },
  imageButton: { flex: 1, borderRadius: 16, padding: 20, alignItems: "center", gap: 8 },
  imageButtonLabel: { fontSize: 13, textAlign: "center" },
  preview: { width: "100%", aspectRatio: 1, borderRadius: 16, marginBottom: 8 },
  changeLink: { fontSize: 13, textAlign: "center" },
});
