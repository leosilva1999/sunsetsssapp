import { useQuery } from "@tanstack/react-query";
import { photosApi } from "../api/photos";
import { locationsApi } from "../api/locations";
import type { PhotoSort } from "../types/api";

export function usePhotoCount() {
  return useQuery({ queryKey: ["photos", "count"], queryFn: photosApi.count });
}

export function useWeeklyRanking() {
  return useQuery({
    queryKey: ["locations", "ranking", "week"],
    queryFn: () => locationsApi.ranking("week"),
  });
}

export function useRecentPhotos(sort: PhotoSort) {
  return useQuery({
    queryKey: ["photos", "list", sort],
    queryFn: () => photosApi.list({ sort }),
  });
}
