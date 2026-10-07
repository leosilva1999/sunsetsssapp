// `EXPO_PUBLIC_*` env vars são embutidas no bundle em build time (convenção do Expo SDK).
// Configure em `.env` (veja `.env.example`) — nunca commitar o `.env` real.
const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!rawBaseUrl && !__DEV__) {
  throw new Error("EXPO_PUBLIC_API_BASE_URL não configurada.");
}

// Fallback de desenvolvimento: `Sunset.API` local via `dotnet run` (docs/API.md diz
// http://localhost:5256 ou https://localhost:7044 — HTTP evita o app ter que confiar no
// certificado dev do ASP.NET). Em dispositivo físico/emulador, `localhost` não aponta pra
// máquina host — ajuste no `.env` (IP da máquina na rede local, ou `10.0.2.2` no emulador
// Android).
export const API_BASE_URL = rawBaseUrl ?? "http://localhost:5256";
export const API_PREFIX = "/api/v1";

// Mapa embutido no Detalhe do local (seção 5.4 / proposal-location-map-embed.md). Reaproveita a
// key do Google Maps já usada pelo `sunsetweb` — se ela estiver restrita por HTTP referrer (pro
// domínio do app web), pode não funcionar numa WebView; nesse caso, criar uma key própria pro
// mobile (restrição por app Android/iOS, não por referrer) é o caminho certo. Opcional: sem
// isso configurado, `LocationMap` simplesmente não renderiza, sem quebrar a tela.
export const GOOGLE_MAPS_EMBED_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_EMBED_KEY ?? null;
