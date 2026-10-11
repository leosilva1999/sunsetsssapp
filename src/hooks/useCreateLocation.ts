import { useMutation, useQueryClient } from "@tanstack/react-query";
import { locationsApi } from "../api/locations";

// Cadastro de local novo direto do fluxo de postar foto (seção 5.8). As coordenadas vêm do
// seletor de mapa (LocationMapPicker) — marcadas no mapa ou a localização atual do aparelho.
export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; city: string; latitude: number; longitude: number }) =>
      locationsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
}
