# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Sunsetsss mobile app (Android/iOS): Expo + Expo Router + TypeScript, consuming the `Sunset.API`
(.NET 9) backend. This repo is a sibling of the backend repo on disk — both live under a common
`sunset/` parent:

```
sunset/
  react-native/sunsetsapp/   <- this repo
  dotnet/sunsetapi/          <- backend (separate repo, not committed here)
```

**The canonical API contract lives in the backend repo, not here**:
`../../dotnet/sunsetapi/docs/API.md` (relative to this repo's `sunset/` parent). This repo's own
`web_app_docs/mobile-app-spec.md` is a UX/feature reference handed over from the web app's build
session — useful for screen-by-screen functional behavior, but it predates the rebrand (still
says "Sunset" throughout) and is **not** authoritative on exact request/response payloads. When a
field name, enum value, or endpoint behavior is in question, check the backend's `docs/API.md`,
not the mobile spec. `src/types/` and `src/api/` were last reconciled against it directly.

## Commands

```bash
npm install                        # install deps
cp .env.example .env               # then set EXPO_PUBLIC_API_BASE_URL — see src/lib/env.ts
npx expo start                     # dev server (w = web, or scan QR for device/Expo Go)
npx tsc --noEmit                   # typecheck — run before considering any change done
npx expo export --platform web     # static build smoke test; catches bundler/runtime errors
                                    # across every route without needing a simulator/device
npx expo install <pkg>             # add a package with native code (resolves the SDK-compatible
                                    # version) — use plain `npm install <pkg>` only for pure-JS deps
```

`npm run lint` (`expo lint`) runs ESLint 8 with `eslint-config-expo` (`.eslintrc.js`; SDK 52 needs
the legacy eslintrc format, not flat config) — run it alongside `tsc` before considering a change
done. `npm test` is scaffolded in `package.json` but there are no test files yet.

## Architecture

**Routing**: `app/` is Expo Router routes only — every file is a screen, `_layout.tsx` files are
navigators. Everything else (components, hooks, API client, theme, state) lives in `src/`,
imported via the `@/src/...` path alias. Two guarded route groups under the root stack:
`(auth)` redirects to `(tabs)` if already signed in, `(tabs)` redirects to `(auth)/login` if
signed out — the guard lives in each group's own `_layout.tsx`, reading `useAuthStore().status`.
`app/_layout.tsx` hydrates the persisted session once on boot and holds the splash screen
(`expo-splash-screen`) until fonts + hydration are both ready.

**Auth/session**: `src/stores/authStore.ts` (zustand) holds the in-memory session; it's mirrored
to `expo-secure-store` via `src/lib/secureStorage.ts` (never `AsyncStorage` for tokens — that's
for non-sensitive prefs only, e.g. `src/theme/themeStore.ts`). The API returns **two different
user shapes** — don't conflate them (see `src/types/entities.ts`):
- `AuthUser`: from register/login/refresh/`PATCH /users/me`. Has `email`/`role`, no follower
  counts. This is what `authStore.user` holds.
- `User`: from `GET /users/{id}` and follow listings. Has follower/following counts and
  `isFollowedByCurrentUser`, no `email`/`role`. Fetch this separately (`src/api/users.ts`) when a
  screen needs follow counts for the logged-in user — don't expect them on `authStore.user`.

**API layer**: every `src/api/*.ts` module goes through `src/api/client.ts`'s `apiFetch()`. It
always attaches the bearer token when one exists, even on "public" endpoints — several of them
read the token optionally to resolve fields like `likedByCurrentUser` (see the backend docs'
"Common conventions" section). The `auth` option on `apiFetch` does **not** control whether the
token is sent; it only controls whether a `401` triggers the single-flight refresh-and-retry
flow. Pass `auth: false` for endpoints with no 🔒 in the backend docs, so an unrelated 401 there
doesn't trigger a pointless refresh attempt.

**Theme**: `src/theme/` — `colors.ts` (static light/dark palettes), `typography.ts` (loads
`@expo-google-fonts/*`, exports font-family name constants), `themeStore.ts` (persisted
dark/light/system preference), `useTheme.ts` (combines all of the above into one hook: `colors`,
`fonts`, `scheme`, `sunIconColor`). Always theme through this hook — don't hardcode colors or
font families in a screen.

**Brand assets**: `src/components/ui/BrandLogo.tsx` renders one of three PNGs in
`assets/images/brand-*.png` (`horizontal` / `vertical` / `icon` variants), sourced from
`novo_logo/`. These are low-res placeholders (160–400px) — flag to the user before generating
production app-store icons from them.

**Unimplemented screens**: stubbed routes render `src/components/ui/ComingSoon.tsx` (wrapped in
`src/components/ui/RoleGate.tsx` for Moderator/Admin-only routes, e.g. `/moderation`). When
implementing one, replace the `ComingSoon` call in that route file; the route/navigation wiring
is already in place.

**Pagination**: list endpoints return `CursorPage<T>` (`{ items, nextCursor, hasMore }` —
`src/types/entities.ts`), matching the backend's cursor convention. `GET /locations/ranking` is
the one list endpoint that is **not** paginated (plain array, `?limit=`).

## Known gotchas

- **`<Link asChild>` wrapping a `<Text style={[...]}>` (array style) crashes on web** — React
  Native Web throws `Failed to set an indexed property on 'CSSStyleDeclaration'` during the first
  render. Pass `style` directly to `<Link>` instead of using `asChild` + a styled `Text` child
  (see the footer links in `app/(auth)/login.tsx` for the working pattern).
- **`query-string` must stay on `^7.x`** (pinned in `package.json`). Versions 8 and 9 are
  ESM-only and break `expo-router`'s static export (`npx expo export`) with a Metro/Node CJS
  interop error — it's an undeclared transitive dependency of `expo-router@4.0.22`, so nothing
  stops a bare `npm install query-string` from grabbing a broken version.
- **Testing against the real API from `expo start --web`**: the backend's dev CORS allowlist only
  includes `localhost:3000`/`5173` (the web app's ports), not Metro's `8081` — expect `fetch`
  failures there (react-query will retry a few times, then surface the error) unless the
  backend's `Cors:AllowedOrigins` is updated. Native builds (simulator/device/Expo Go) aren't
  affected — CORS is a browser-only restriction.
- **The Metro dev server's inspector/debugger is unstable on this CLI version** — opening it
  (`j` in the terminal, or the debug menu on-device) has crashed the whole process with an
  unhandled `Error: Runtime.evaluate` from `CdpClient.ts`. Not related to app code; just restart
  (`npx expo start`) if it happens, and avoid opening the inspector otherwise.
- **A phone testing over `exp://<lan-ip>:8081` needs `.env`'s `EXPO_PUBLIC_API_BASE_URL` to use
  that same LAN IP** (not `localhost`) — and the backend's Kestrel needs to listen on
  `0.0.0.0`, not just `localhost` (its `launchSettings.json` default). Both the phone's network
  and the machine's Wi-Fi IP can change between sessions; re-check with `ipconfig`/
  `Get-NetIPConfiguration` if the app suddenly can't reach the API, rather than assuming
  something broke in code.
- **Uploaded photos/avatars render blank on a phone, even though seed photos (external URLs)
  show fine**: the backend's dev photo storage is LocalStack, and its `Storage:ServiceUrl` /
  `Storage:PublicBaseUrl` (`appsettings.Development.json`) default to `http://localhost:4566` —
  that `localhost` is the backend PC, unreachable from the phone, for both the presigned upload
  PUT and the later image GET. Fix lives in the backend repo: `appsettings.Development.local.json`
  (gitignored, loaded by `Program.cs`, see `appsettings.Development.local.json.example`) overrides
  both to the current LAN IP. Needs a full rebuild (not just a process restart) the first time
  it's created, since it's a new content file MSBuild has to pick up and copy to `bin/`. Existing
  photos uploaded before the fix keep their broken `localhost` URL in the DB permanently — only
  new uploads after the fix pick up the corrected URL.
