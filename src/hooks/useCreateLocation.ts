import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { locationsApi } from "../api/locations";

// Cadastro de local novo direto do fluxo de postar foto (seção 5.8) — sem mapa/picker de
// coordenadas no app ainda, então usamos a localização atual do dispositivo (faz sentido: quem
// está postando a foto presumivelmente está no local agora).
export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; city: string }) => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permissão de localização negada — não dá pra cadastrar o local sem as coordenadas.");
      }
      const position = await Location.getCurrentPositionAsync({});
      return locationsApi.create({
        name: payload.name,
        city: payload.city,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
