import { useCallback, useState } from "react";
import * as Location from "expo-location";

export interface Coords {
  lat: number;
  lng: number;
}

export const NEARBY_RADIUS_OPTIONS_KM = [10, 25, 50, 100];
export const NEARBY_DEFAULT_RADIUS_KM = 50;

export type NearbyStatus = "idle" | "loading" | "ready" | "denied" | "error";

// "Perto de mim" (docs/API.md, GET /locations?lat=&lng=): só pede permissão e lê a posição
// quando o usuário aciona `activate` — nunca na abertura da tela. A posição é lida uma vez
// (não acompanhamos o movimento): como o nextCursor só vale pra mesma lat/lng, mudar a posição
// reinicia a paginação.
export function useNearbyLocation() {
  const [status, setStatus] = useState<NearbyStatus>("idle");
  const [coords, setCoords] = useState<Coords | null>(null);

  const activate = useCallback(async () => {
    setStatus("loading");
    try {
      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      // Arredonda (~100 m) pra queryKey/cursor não mudarem por ruído de GPS entre leituras.
      setCoords({
        lat: Math.round(position.coords.latitude * 1000) / 1000,
        lng: Math.round(position.coords.longitude * 1000) / 1000,
      });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  const deactivate = useCallback(() => {
    setStatus("idle");
    setCoords(null);
  }, []);

  return { status, coords, activate, deactivate };
}
