import { Ionicons } from "@expo/vector-icons";
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  Karla_400Regular,
  Karla_500Medium,
  Karla_600SemiBold,
  Karla_700Bold,
} from "@expo-google-fonts/karla";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";

// Mapa pra `useFonts()` na raiz do app. `Ionicons.font` entra aqui de propósito: sem isso a fonte
// dos ícones só carrega preguiçosamente no primeiro render de cada ícone — em dev/release builds
// nativos isso deixou os ícones em branco, ao contrário do Expo Go. Segurando a splash até ela
// carregar, os ícones já existem no primeiro frame.
export const fontsToLoad = {
  ...Ionicons.font,
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  Karla_400Regular,
  Karla_500Medium,
  Karla_600SemiBold,
  Karla_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
};

// Serifada (Fraunces): títulos/display. Sans (Karla): corpo. Mono (JetBrains Mono):
// coordenadas, contadores, dados numéricos — seção 2.
export const fonts = {
  display: "Fraunces_600SemiBold",
  displayBold: "Fraunces_700Bold",
  body: "Karla_400Regular",
  bodyMedium: "Karla_500Medium",
  bodyBold: "Karla_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
};
