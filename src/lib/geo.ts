import * as Location from "expo-location";

export interface LatLng {
  latitude: number;
  longitude: number;
}

// Pede permissão (só quando chamado — sempre a partir de um toque do usuário) e lê a posição
// atual uma vez. Lança Error com mensagem pronta pra exibir.
export async function getCurrentLatLng(): Promise<LatLng> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permissão de localização negada — libere nas configurações do celular.");
  }
  try {
    const position = await Location.getCurrentPositionAsync({});
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    throw new Error("Não foi possível obter sua localização agora. Tente de novo.");
  }
}

// Cidade aproximada de uma coordenada, pra pré-preencher o cadastro de local. Usa o geocoder da
// plataforma (sem chave do Google nossa); qualquer falha vira `null` — o usuário digita à mão.
export async function reverseGeocodeCity(point: LatLng): Promise<string | null> {
  try {
    const [place] = await Location.reverseGeocodeAsync(point);
    return place?.city ?? place?.subregion ?? place?.region ?? null;
  } catch {
    return null;
  }
}
