import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";

import { Screen } from "@/src/components/ui/Screen";
import { Button } from "@/src/components/ui/Button";
import { TextField } from "@/src/components/ui/TextField";
import { useTheme } from "@/src/theme/useTheme";
import { useAuthStore } from "@/src/stores/authStore";
import { useSaveProfile } from "@/src/hooks/useEditProfile";
import { getErrorMessage } from "@/src/lib/errorMessage";

const BIO_MAX_LENGTH = 160;

// Seção 5.9 — nome, avatar (recorte nativo + upload em 2 passos), bio até 160 caracteres.
// `PATCH /users/me` é partial update de verdade: só manda o que realmente mudou.
export default function EditProfileScreen() {
  const { colors, fonts, headerOptions } = useTheme();
  const authUser = useAuthStore((s) => s.user);
  const saveProfile = useSaveProfile();

  const [name, setName] = useState(authUser?.name ?? "");
  const [bio, setBio] = useState(authUser?.bio ?? "");
  const [avatarLocalUri, setAvatarLocalUri] = useState<string | null>(null);
  const [avatarMimeType, setAvatarMimeType] = useState<string | null>(null);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso às suas fotos pra trocar o avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarLocalUri(result.assets[0].uri);
      setAvatarMimeType(result.assets[0].mimeType ?? null);
    }
  };

  const handleSave = () => {
    const payload: {
      name?: string;
      bio?: string | null;
      avatarLocalUri?: string;
      avatarMimeType?: string | null;
    } = {};

    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== authUser?.name) payload.name = trimmedName;

    const trimmedBio = bio.trim();
    if (trimmedBio !== (authUser?.bio ?? "")) payload.bio = trimmedBio || null;

    if (avatarLocalUri) {
      payload.avatarLocalUri = avatarLocalUri;
      payload.avatarMimeType = avatarMimeType;
    }

    if (!payload.name && payload.bio === undefined && !payload.avatarLocalUri) {
      router.back();
      return;
    }

    saveProfile.mutate(payload, {
      onSuccess: () => router.back(),
      onError: (error) => Alert.alert("Não foi possível salvar", getErrorMessage(error, "Tente de novo.")),
    });
  };

  const avatarUri = avatarLocalUri ?? authUser?.avatarUrl ?? null;

  return (
    <Screen edges={["top"]}>
      <Stack.Screen options={{ headerShown: true, title: "Editar perfil", ...headerOptions }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={pickAvatar} style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="person" size={36} color={colors.textSecondary} />
            </View>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: colors.textPrimary }]}>
            <Ionicons name="camera" size={14} color={colors.background} />
          </View>
        </Pressable>

        <TextField label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />

        <View style={styles.bioField}>
          <TextField
            label="Bio"
            value={bio}
            onChangeText={(text) => setBio(text.slice(0, BIO_MAX_LENGTH))}
            placeholder="Fale um pouco sobre você"
            multiline
            numberOfLines={3}
            maxLength={BIO_MAX_LENGTH}
          />
          <Text style={[styles.counter, { color: colors.textSecondary, fontFamily: fonts.mono }]}>
            {bio.length}/{BIO_MAX_LENGTH}
          </Text>
        </View>

        <Button label="Salvar" onPress={handleSave} loading={saveProfile.isPending} disabled={!name.trim()} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 18 },
  avatarWrapper: { alignSelf: "center", marginBottom: 4 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarFallback: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bioField: { gap: 4 },
  counter: { fontSize: 11, textAlign: "right" },
});
