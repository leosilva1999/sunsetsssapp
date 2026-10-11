import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useSaveProfile } from "./useEditProfile";
import { getErrorMessage } from "../lib/errorMessage";

// Troca de avatar direto do perfil (tocar na própria foto): escolhe/tira a foto, recorta em
// quadrado e já envia (upload em 2 passos + PATCH /users/me, via useSaveProfile) — sem passar
// pela tela "Editar perfil". `isUploading` cobre o upload inteiro.
export function useChangeAvatar() {
  const saveProfile = useSaveProfile();

  const upload = (asset: ImagePicker.ImagePickerAsset) => {
    saveProfile.mutate(
      { avatarLocalUri: asset.uri, avatarMimeType: asset.mimeType ?? null },
      { onError: (error) => Alert.alert("Não foi possível atualizar a foto", getErrorMessage(error, "Tente de novo.")) }
    );
  };

  const pickFromLibrary = async () => {
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
    if (!result.canceled && result.assets[0]) upload(result.assets[0]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos da câmera pra tirar a foto do avatar.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (!result.canceled && result.assets[0]) upload(result.assets[0]);
  };

  return { pickFromLibrary, takePhoto, isUploading: saveProfile.isPending };
}
