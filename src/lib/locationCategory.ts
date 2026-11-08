import type { LocationCategory } from "../types/entities";

// A API usa os valores em inglês (docs/API.md); a UI mostra o rótulo em pt-BR.
export const LOCATION_CATEGORY_LABELS: Record<LocationCategory, string> = {
  Beach: "Praia",
  Viewpoint: "Mirante",
  Mountain: "Montanha",
  Lake: "Lago",
  River: "Rio",
  Urban: "Urbano",
  Other: "Outro",
};

export const LOCATION_CATEGORIES = Object.keys(LOCATION_CATEGORY_LABELS) as LocationCategory[];
