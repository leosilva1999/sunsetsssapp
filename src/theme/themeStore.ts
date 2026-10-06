import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemePreference = "dark" | "light" | "system";

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

// Preferência de tema não é dado sensível — AsyncStorage simples é adequado aqui
// (diferente da sessão de auth, que fica em expo-secure-store — ver src/lib/secureStorage.ts).
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: "light", // tema claro é o padrão do produto (ajustado — era dark)
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: "sunsetsss.theme",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
