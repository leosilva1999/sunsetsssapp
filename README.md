# Sunsetsss — App mobile (React Native / Expo)

App mobile (Android/iOS) do Sunsetsss, construído com Expo + Expo Router + TypeScript,
consumindo a mesma `Sunset.API` (.NET 9, repositório `sunsetapi` — nome do backend não mudou)
usada pela aplicação web. A especificação funcional completa está em
[`web_app_docs/mobile-app-spec.md`](./web_app_docs/mobile-app-spec.md) — escrita antes do
rebranding, então ainda se refere ao produto como "Sunset"; vale como referência de
funcionalidades, não de nome.

## Stack

- **Expo (SDK 52)** + **Expo Router** (file-based routing, stacks + tabs)
- **TypeScript**
- **TanStack Query** — cache/estado de servidor, paginação por cursor
- **Zustand** — sessão de auth e preferência de tema
- **expo-secure-store** — tokens e usuário logado (Keychain/Keystore, nunca `AsyncStorage` puro)
- **expo-linear-gradient** + fontes `Fraunces`/`Karla`/`JetBrains Mono` (`@expo-google-fonts/*`)
  — identidade visual replicada da web (seção 2 da spec)

## Como rodar

1. Instalar dependências:

   ```bash
   npm install
   ```

2. Configurar a URL da API — copie `.env.example` para `.env` e ajuste:

   ```bash
   cp .env.example .env
   ```

   - Emulador Android: use `http://10.0.2.2:PORTA` em vez de `localhost`.
   - Dispositivo físico: use o IP da máquina host na rede local.
   - Veja `src/lib/env.ts`.

3. Subir o Metro bundler:

   ```bash
   npx expo start
   ```

### Contas de teste (seed de dev da API)

Em Development, a API semeia 8 usuários fictícios automaticamente (senha **`Password123!`** pra
todos): `beatriz@sunsetapp.dev` (Moderator), `thiago@sunsetapp.dev` (Admin),
`rafael/camila/lucas/juliana/pedro/mariana@sunsetapp.dev` (User). Use uma dessas em vez de
cadastrar conta nova a cada teste. Mais detalhes em `docs/API.md` do `sunsetapi`.

   No output, escolha abrir num [development build](https://docs.expo.dev/develop/development-builds/introduction/),
   emulador Android, simulador iOS, ou [Expo Go](https://expo.dev/go).

## Estrutura

```
app/                  # rotas (Expo Router) — cada arquivo é uma tela
  (auth)/              login, cadastro, esqueci/redefinir senha
  (tabs)/               Início, Explorar, Fotos, Ranking, Perfil (tab bar nativa)
  locations/[id]        detalhe do local
  photos/[id], photos/new
  profile/[id], profile/edit
  notifications/
  moderation/           fila de denúncias, histórico, termos/usuários (Admin) — gated por
                       role via RoleGate
  legal/                Termos de Uso / Política de Privacidade

src/
  api/                 um módulo por domínio (auth, locations, photos, legal...),
                       todos passando por src/api/client.ts (injeção de token + refresh
                       automático em 401)
  types/               entidades e DTOs espelhando a seção 3 da spec
  stores/              authStore (zustand) — sessão
  theme/                 paleta, tipografia, hook useTheme(), preferência persistida
  components/           componentes compartilhados (ui/ = primitivos, resto = específicos
                       de domínio)
  hooks/                 hooks de dados (TanStack Query) e mutations
  lib/                   cliente de storage seguro, env, query client, helpers
```

## Estado desta entrega

Todas as telas da seção 5 da spec estão implementadas de ponta a ponta contra a API real:
autenticação completa, Início, Explorar, Ranking, Fotos (feed + detalhe + postar), Local
(detalhe + avaliar), Perfil (próprio + de terceiros + seguidores/seguindo + editar),
Notificações (polling) e Moderação (fila de denúncias, histórico, termos/privacidade e
papéis de usuário, Admin-only onde a spec pede).

**Deixado de fora de propósito**, não por falta de tempo — ver comentários no código:
- **"Baixar meus dados" e "Excluir minha conta"** (LGPD, seção 5.9) — ações de conta sensíveis/
  irreversíveis, melhor numa entrega própria dedicada a elas.
- **Login com Google** — ver pendência abaixo (já investigado a fundo, não é só "faltou tempo").
- ~~Mapa embutido~~ feito — `src/components/LocationMap.tsx` (WebView + Google Maps Embed API,
  adaptando `proposal-location-map-embed.md` do web pra mobile). Reaproveita a key do `sunsetweb`
  (`EXPO_PUBLIC_GOOGLE_MAPS_EMBED_KEY` no `.env`) — se ela estiver restrita por HTTP referrer pro
  domínio web, o mapa pode não carregar na WebView; nesse caso crie uma key própria pro mobile
  (restrição por app Android/iOS, não por referrer) no Google Cloud Console. Sem a env var
  configurada, o componente simplesmente não renderiza nada, não quebra a tela — e o botão
  "Abrir no app de Mapas" continua ali como alternativa sempre disponível.

Tipos (`src/types/`) e módulos de API (`src/api/`) foram conferidos contra
`docs/API.md` do repositório `sunsetapi` (não só o resumo em `web_app_docs/mobile-app-spec.md`)
— payloads, nomes de campo e regras de validação (ex.: senha ≥8 caracteres, `sort=recent|top`,
`PublicUserResponse` sem `followersCount` no objeto de sessão) batem com o que a API realmente
devolve.

**Pendências que dependem de decisão/infra fora deste repo** (não são bugs — ver comentários no
código):

- **Login com Google**: já existe um projeto Google Cloud funcionando (`GoogleAuth:ClientId` no
  `appsettings.Development.json` do `sunsetapi`, mesmo Client ID em `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  do `sunsetweb`) — não precisa criar nada do zero, só adicionar credenciais mobile a ele. O
  bloqueio real: `auth.expo.io` (o proxy que permitia OAuth dentro do Expo Go) está
  descontinuado, e o Google bloqueia OAuth via WebView genérica por política de segurança — não
  tem caminho funcional sem sair do Expo Go. A forma certa é um dev client (via EAS Build, não
  precisa de Android Studio/Xcode local) + `@react-native-google-signin/google-signin`. Decisão
  consciente de adiar até fazer sentido investir nisso — hoje o botão mostra "em breve".
- **CORS ao testar via `expo start --web`**: a API só libera `http://localhost:3000` e
  `http://localhost:5173` por padrão (`Cors:AllowedOrigins` em `appsettings.Development.json` do
  `sunsetapi`). O Metro web roda em `http://localhost:8081` — adicione essa origem lá se for
  testar pelo navegador. Build nativo (simulador/emulador/dispositivo) não tem esse problema,
  CORS é só do browser.
- **Assets de marca**: logo real em `assets/images/brand-*.png` (fonte: `novo_logo/`), usado no
  ícone do app, splash e cabeçalhos (`src/components/ui/BrandLogo.tsx`). São imagens 160×160/
  400×100 — ok pro estágio atual, mas vale pedir uma versão em maior resolução (1024×1024 pro
  ícone) antes de gerar os ícones finais de loja.
- **Upload de imagens em dev**: postar foto e trocar avatar passam pela API usando LocalStack
  localmente — precisa do `docker compose up` no repo da API rodando pra essas chamadas
  funcionarem (ver `CLAUDE.md`/README do `sunsetapi`).
- **Debugger do Metro é instável nesta versão**: abrir o DevTools/inspector (`j` no terminal,
  ou o menu de debug no celular) já derrubou o servidor com um `Error: Runtime.evaluate` não
  tratado. Evite abrir o inspector; se o Metro cair, só reiniciar (`npx expo start`).
