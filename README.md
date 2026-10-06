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
  moderation/           gated por role (Moderator/Admin) via RoleGate
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

Fundação completa (navegação, tema, cliente de API, sessão) + telas de autenticação
(login/cadastro/esqueci-redefinir senha) e Início implementadas de ponta a ponta. As demais
telas existem como rotas navegáveis com um placeholder "em construção", prontas para receber a
implementação real — ver cada arquivo em `app/` para a seção correspondente da spec.

Tipos (`src/types/`) e módulos de API (`src/api/`) já foram conferidos contra
`docs/API.md` do repositório `sunsetapi` (não só o resumo em `web_app_docs/mobile-app-spec.md`)
— payloads, nomes de campo e regras de validação (ex.: senha ≥8 caracteres, `sort=recent|top`,
`PublicUserResponse` sem `followersCount` no objeto de sessão) batem com o que a API realmente
devolve.

**Pendências que dependem de decisão/infra fora deste repo** (não são bugs — ver comentários no
código):

- **Login com Google**: precisa do SDK nativo (`@react-native-google-signin/google-signin` ou
  equivalente) configurado com os client IDs do projeto Google Cloud (iOS/Android) — hoje o
  botão mostra um aviso "em breve".
- **CORS ao testar via `expo start --web`**: a API só libera `http://localhost:3000` e
  `http://localhost:5173` por padrão (`Cors:AllowedOrigins` em `appsettings.Development.json` do
  `sunsetapi`). O Metro web roda em `http://localhost:8081` — adicione essa origem lá se for
  testar pelo navegador. Build nativo (simulador/emulador/dispositivo) não tem esse problema,
  CORS é só do browser.
- **Assets de marca**: logo real em `assets/images/brand-*.png` (fonte: `novo_logo/`), usado no
  ícone do app, splash e cabeçalhos (`src/components/ui/BrandLogo.tsx`). São imagens 160×160/
  400×100 — ok pro estágio atual, mas vale pedir uma versão em maior resolução (1024×1024 pro
  ícone) antes de gerar os ícones finais de loja.
- **Upload de imagens em dev**: a API usa LocalStack pra `POST /photos/upload-url` /
  `POST /users/me/avatar-upload-url` localmente — precisa do `docker compose up` no repo da API
  rodando pra essas chamadas funcionarem (ver `CLAUDE.md`/README do `sunsetapi`).
