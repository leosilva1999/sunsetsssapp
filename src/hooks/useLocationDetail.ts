import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { locationsApi } from "../api/locations";
import { ApiError } from "../api/client";
import { useAuthStore } from "../stores/authStore";

export function useLocation(id: string) {
  return useQuery({ queryKey: ["locations", id], queryFn: () => locationsApi.get(id) });
}

// Falha (502) é esperada e não deve derrubar o resto da tela — a tela só omite o bloco quando
// `isError`, sem retry agressivo (serviço externo, sem cache, seção 5.4).
export function useLocationSunset(id: string) {
  return useQuery({
    queryKey: ["locations", id, "sunset"],
    queryFn: () => locationsApi.getSunset(id),
    retry: false,
  });
}

export function useLocationPhotos(id: string) {
  return useQuery({ queryKey: ["locations", id, "photos"], queryFn: () => locationsApi.getPhotos(id) });
}

export function useLocationRatings(id: string) {
  return useQuery({ queryKey: ["locations", id, "ratings"], queryFn: () => locationsApi.getRatings(id) });
}

// `null` = autenticado mas ainda não avaliou (404 da API vira isso, não um erro de verdade).
export function useMyRating(locationId: string) {
  const isSignedIn = useAuthStore((s) => s.status === "signedIn");
  return useQuery({
    queryKey: ["locations", locationId, "ratings", "me"],
    queryFn: async () => {
      try {
        return await locationsApi.getMyRating(locationId);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
    enabled: isSignedIn,
  });
}

// `invalidateQueries` por padrão casa por prefixo — isso já pega `["locations", id]` (pra
// atualizar avgRating), `["locations", id, "ratings"]` e `["locations", id, "ratings", "me"]`
// numa chamada só.
function invalidateRatingQueries(queryClient: ReturnType<typeof useQueryClient>, locationId: string) {
  void queryClient.invalidateQueries({ queryKey: ["locations", locationId] });
}

export function useUpsertRating(locationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { score: number; comment?: string | null }) =>
      locationsApi.upsertRating(locationId, payload),
    onSuccess: () => invalidateRatingQueries(queryClient, locationId),
  });
}

export function useDeleteRating(locationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => locationsApi.deleteRating(locationId),
    onSuccess: () => invalidateRatingQueries(queryClient, locationId),
  });
}
