# Sunset — Especificação para o app mobile (React Native)

Este documento descreve a aplicação web do Sunset (Next.js) como referência completa para
construir um app React Native (Android/iOS) com as mesmas funcionalidades, consumindo a mesma
**Sunset.API** (.NET 9). Não é um documento de arquitetura do app mobile em si — é o "o que
construir", baseado no que já existe e está em produção na web.

A referência canônica e sempre atualizada dos endpoints é `docs/API.md` no repositório
`sunsetapi` — o resumo abaixo foi extraído de lá, mas em caso de dúvida/divergência, aquele
arquivo manda.

## 1. O que é o Sunset

Rede social de nicho: usuários pesquisam locais com boas visões de pôr do sol, postam fotos
marcando o local, curtem, comentam, avaliam (1–5 estrelas + comentário opcional) os locais, e
seguem uns aos outros. Um ranking de locais é calculado a partir das avaliações.

## 2. Identidade visual

- **Paleta**: gradiente de pôr do sol — roxo/anil de crepúsculo (`#1e1038`, `#2d1b4e`) até
  laranja/dourado (`#ff8c5a`, `#ffcf6b`), com rosa de entardecer (`#e85d8a`) como acento. Tema
  escuro é o padrão; existe um tema claro (fundo em tons de papel/creme, `#fff9f2`), alternável
  pelo usuário e persistido.
- **Tipografia**: `Fraunces` (serifada, títulos/display), `Karla` (sans, corpo),
  `JetBrains Mono` (coordenadas, contadores, dados numéricos).
- **Elementos de marca**: disco do sol com glow, linha do horizonte, cards de foto com overlay
  gradiente escuro na base para legibilidade de texto sobre imagem.
- Logos: ícone do sol (`#f86f02` fixo nos dois temas) + wordmark (recolorido conforme o tema).

## 3. Modelo de dados (entidades principais)

| Entidade | Campos principais |
|---|---|
| `User` | id, name, email (só em contexto autenticado), avatarUrl, bio, role (`User`\|`Moderator`\|`Admin`), followersCount, followingCount, isFollowedByCurrentUser, createdAt |
| `Location` | id, name, latitude, longitude, city, avgRating, createdAt |
| `Photo` | id, userId, userName, userAvatarUrl, locationId, locationName, city, imageUrl, caption, likesCount, likedByCurrentUser, commentsCount, createdAt |
| `Comment` | id, photoId, userId, userName, userAvatarUrl, content, parentCommentId (1 nível de profundidade só), repliesCount, createdAt |
| `Rating` | id, userId, userName, userAvatarUrl, score (1–5), comment (opcional), createdAt |
| `Report` | id, reporterId, reporterName, targetType (`Photo`\|`Comment`), targetId, reason, details, status (`Pending`\|`Resolved`\|`Dismissed`), resolvedByUserId, resolvedAt |
| `ModerationAction` | id, moderatorId, moderatorName, actionType, targetDescription (texto livre tipo `"Photo:{id}"`), notes, createdAt |
| `Notification` | id, type (`NewFollower`\|`PhotoLiked`\|`PhotoCommented`\|`CommentReplied`), actorUserId, actorName, actorAvatarUrl, targetDescription, readAt, createdAt |
| `LegalDocument` | id, documentType (`TermsOfService`\|`PrivacyPolicy`), content, version, createdAt |

Todas as listagens tipo feed usam **paginação por cursor** (`{ items, nextCursor, hasMore }`),
não por número de página — passe `nextCursor` de volta como `?cursor=`, trate como opaco.

## 4. Autenticação e sessão

- **JWT bearer**: access token de vida curta (15 min) + refresh token opaco de vida longa
  (30 dias), rotacionado a cada uso (`POST /auth/refresh` invalida o refresh token anterior).
- Enviar `Authorization: Bearer <accessToken>` em toda chamada autenticada.
- **No app mobile, troque `localStorage` (usado na web) por armazenamento seguro** —
  `expo-secure-store` ou `react-native-keychain` — para os tokens. Essa é uma diferença
  deliberada da web, não uma escolha a replicar: o item de débito técnico anotado na web ("migrar
  JWT de localStorage pra cookie httpOnly") não se aplica a mobile, mas guardar o token em
  `AsyncStorage` puro (sem criptografia) tampouco é seguro o bastante.
- Métodos de entrada:
  - E-mail/senha (`POST /auth/register`, `POST /auth/login`).
  - **Google Sign-In** (`POST /auth/google`) — a web usa Google Identity Services (script de
    navegador); no mobile, use o SDK nativo de Google Sign-In e envie o `idToken` resultante pro
    mesmo endpoint. Cria conta automaticamente se o e-mail ainda não existe (senha aleatória
    inutilizável — essa conta só loga via Google dali pra frente); se já existe uma conta por
    senha com aquele e-mail, loga nela em vez de duplicar.
  - **Esqueci minha senha**: `POST /auth/forgot-password` (sempre `204`, não revela se o e-mail
    existe — não trate erro diferente disso na UI) → e-mail com link de redefinição de uso único
    (30 min) → `POST /auth/reset-password`. Ambos rate-limited (5/15min por IP).
- `POST /auth/logout` revoga o refresh token (passa o refresh token, não o access token).
- Não existe "/me" — decodifique o `sub` do JWT ou guarde o objeto `user` devolvido por
  register/login/refresh; para dados atualizados, `GET /users/{id}`.
- **Vantagem do mobile sobre a web aqui**: a web tem uma limitação conhecida onde campos como
  `likedByCurrentUser`/`isFollowedByCurrentUser` vêm sempre `false` no primeiro carregamento de
  uma página (ela usa Server-Side Rendering sem acesso ao token guardado no browser). Um app
  mobile sempre tem o token disponível antes de qualquer chamada — não precisa replicar essa
  limitação nem o padrão de "UI otimista que corrige no primeiro toque" que a web usa para
  contornar isso. Pode (e deve) resolver esses campos corretamente desde a primeira renderização.

## 5. Telas e funcionalidades

### 5.1 Onboarding / Autenticação
- **Login**: e-mail/senha, botão "Continuar com Google", link "Esqueci minha senha".
- **Cadastro**: nome, e-mail, senha, checkbox obrigatório de aceite dos Termos de Uso e Política
  de Privacidade (com link pras páginas), botão "Continuar com Google".
- **Esqueci minha senha**: campo de e-mail, mensagem de sucesso sempre igual (independente de o
  e-mail existir ou não — não differenciar na UI).
- **Redefinir senha**: acessada via link recebido por e-mail (`?token=...`), campos de nova
  senha + confirmação.

### 5.2 Home
- Hero com busca de locais, contador real de "X pôr do sol catalogados" (`GET /photos/count`).
- Ranking da semana (top locais por nota média nos últimos 7 dias).
- Galeria "Fotos recentes" com abas Recentes/Mais curtidas/Perto de mim (geolocalização — a web
  ainda não implementou o filtro geográfico real, é um ponto em aberto também pro mobile).
- CTA "Tirou uma foto boa hoje?" abrindo o fluxo de postar foto.

### 5.3 Explorar locais (`/locations`)
- Busca instantânea por nome/cidade (`GET /locations?q=`), debounced no client. **Atenção ao
  comportamento do backend**: com 3+ caracteres é busca FULLTEXT por prefixo de palavra (não é
  substring — `"osa"` não casa com "Rosa"); com menos de 3 caracteres cai pra substring simples.
  Rate limited (40 req/10s por IP) — debounce no client é obrigatório, o rate limit é só uma rede
  de segurança.
- Grid/lista de cards (nome, cidade, nota média).

### 5.4 Detalhe do local (`/locations/{id}`)
- Nome, cidade, nota média.
- Horário do pôr do sol de hoje (`GET /locations/{id}/sunset`, serviço externo
  sunrise-sunset.org — **exibir atribuição visível obrigatória pro provedor**, a API não injeta
  isso sozinha; se esse endpoint falhar, não deve derrubar o resto da tela, só omitir esse bloco).
- Mapa (lat/lng).
- Grid de fotos do local.
- Lista de avaliações (nome, avatar, nota em estrelas, comentário opcional, data).
- Se autenticado: avaliar o local (upsert — avaliar de novo substitui nota e comentário
  anteriores por completo, não é partial update) ou editar/remover a própria avaliação
  (`GET .../ratings/me` retorna `404` se ainda não avaliou — use isso pra decidir entre "Avaliar"
  e "Editar avaliação").

### 5.5 Ranking (`/ranking`)
- Abas de período: Semana / Mês / Todos.
- Lista ordenada por nota média no período.

### 5.6 Feed de fotos (`/photos`)
- Abas Recentes / Mais curtidas.
- Grid de cards: avatar+nome do autor (clicável → perfil), "{nome} em {local}, {cidade}", prévia
  da legenda, contagem de curtidas/comentários. Curtir é um toque direto no card (otimista).
- Paginação "carregar mais" (cursor).
- (Web-only, não precisa replicar: um slot de anúncio in-feed do Google AdSense a cada 6 itens,
  condicionado a consentimento de cookies — é infraestrutura de monetização web-específica, sem
  equivalente direto em app mobile sem revisar a estratégia de ads pra mobile separadamente.)

### 5.7 Detalhe da foto (`/photos/{id}`)
- Imagem grande + botão de curtir.
- Autor: avatar + nome (clicável → perfil) + botão "Seguir"/"Seguindo" ao lado (some se for a
  própria foto do usuário).
- Local (nome, cidade) + legenda.
- Se autor ou moderador/admin: botão excluir foto (com confirmação).
- Se não for o autor: botão denunciar (motivo: Spam/Inadequado/Assédio/Outro + detalhes
  opcionais; rate limited 10/60s por IP).
- Comentários: lista paginada (mais recentes primeiro), cada um com avatar+nome clicável (→
  perfil), conteúdo, data. Responder (1 nível só — não permitir "responder a uma resposta";
  respostas aparecem em ordem cronológica, mais antigas primeiro, diferente da lista principal).
  Autor do comentário ou moderador pode excluir (excluir um comentário raiz também exclui suas
  respostas em cascata — avisar o usuário antes se `repliesCount > 0`). Denunciar comentário
  (mesmo fluxo de denúncia de foto).

### 5.8 Postar foto
- Acessível a partir do perfil do próprio usuário (não existe mais um atalho global no header da
  web — foi deliberadamente centralizado no perfil; decida se faz sentido manter esse mesmo
  recorte no mobile ou expor em mais lugares, é uma escolha de produto, não uma restrição
  técnica).
- Fluxo: escolher foto (JPG/PNG) → recortar/ajustar enquadramento → buscar local (mesma busca
  instantânea de `/locations`, com opção de cadastrar um local novo se não encontrar) →
  legenda opcional (até 500 caracteres) → publicar.
- **Upload é sempre em 2 passos, nunca manda o binário pra API**:
  1. `POST /photos/upload-url` → recebe `{ uploadUrl, imageUrl }` (URL pré-assinada, expira em
     5 min).
  2. `PUT` os bytes da imagem direto em `uploadUrl` (sem header de auth, `Content-Type` tem que
     bater com o que foi pedido no passo 1).
  3. `POST /photos` com `{ locationId, imageUrl, caption }` usando o `imageUrl` do passo 1.
- Mesmo padrão de upload em 2 passos pra avatar (`POST /users/me/avatar-upload-url` +
  `PATCH /users/me`).

### 5.9 Perfil (`/profile/{id}`)
- Avatar, nome, data de entrada, bio.
- Contadores "X seguidores · Y seguindo" (linkam pras listas correspondentes).
- Grid de fotos do usuário.
- **Próprio perfil**: botão postar foto, editar perfil (nome, avatar com recorte, bio até 160
  caracteres — `PATCH /users/me` é partial update de verdade: omitir um campo mantém o valor
  atual, mandar `null` limpa, mandar valor substitui), menu com "Baixar meus dados" (exporta
  perfil + fotos como JSON — a API não tem endpoint de "minhas curtidas/comentários", só fotos) e
  "Excluir minha conta" (LGPD, ver seção 6).
- **Perfil de outra pessoa**: botão Seguir/Seguindo (idempotente — seguir de novo ou deixar de
  seguir quem não segue é no-op silencioso; seguir a si mesmo → erro).

### 5.10 Seguidores / Seguindo (`/profile/{id}/followers`, `/profile/{id}/following`)
- Lista paginada de usuários (avatar, nome, bio), cada um clicável → perfil dele.
- **Sem botão de seguir nessas listas** — a API documenta que `isFollowedByCurrentUser` vem
  sempre `false` nesses dois endpoints (não resolvido pro caller), então mostrar um botão ali
  mentiria o estado real pra quem você já segue.

### 5.11 Notificações
- Sino/ícone com badge de não-lidas.
- **Não existe push em tempo real (sem WebSocket/SignalR)** — é _polling_:
  `GET /notifications/unread-count` periodicamente (a web usa 45s). *Para o mobile, vale
  considerar substituir isso por push de verdade (FCM/APNs) em vez de só replicar o polling —
  isso vai além de "mesma funcionalidade" mas é uma melhoria natural de plataforma; decidir com o
  time.*
- Lista (`GET /notifications`, mais recentes primeiro) ao abrir o sino.
- 4 tipos, cada um com uma mensagem e um alvo pra navegar ao tocar:
  - `NewFollower` → "{nome} começou a seguir você" → perfil de quem seguiu.
  - `PhotoLiked` → "{nome} curtiu sua foto" → a foto.
  - `PhotoCommented` → "{nome} comentou na sua foto" → a foto.
  - `CommentReplied` → "{nome} respondeu seu comentário" → a foto onde está o comentário (o
    `targetDescription` só dá o id do *comentário*, não da foto — é preciso buscar
    `GET /comments/{id}` pra achar o `photoId` antes de navegar).
- Tocar numa notificação marca como lida e navega. Botão "marcar todas como lidas".

### 5.12 Moderação (visível só pra `Moderator`/`Admin`, ver `user.role`)
- Fila de denúncias pendentes (filtro por status), resolver ou descartar cada uma.
- Histórico de ações de moderação (log auditável, só leitura).
- **Admin apenas**: editor de Termos de Uso / Política de Privacidade (cada edição cria uma nova
  versão, não há edição in-loco — histórico de versões antigas não é recuperável via API, mas
  também não é perdido, só não exposto), busca de usuários + mudança de papel (`User`/
  `Moderator`/`Admin`).

### 5.13 Termos de Uso / Política de Privacidade
- Páginas públicas, somente leitura, mostrando o conteúdo + número da versão + data de
  publicação vigente.

## 6. Regras de negócio importantes (não óbvias pela UI)

- **Exclusão de conta é LGPD-compliant por anonimização, não cascata**: nome vira "Usuário
  excluído", e-mail e senha ficam inutilizáveis, avatar/bio são limpos — mas fotos, comentários e
  avaliações da pessoa **permanecem visíveis**, só que atribuídas a "Usuário excluído", pra não
  quebrar respostas/curtidas de terceiros que dependem desse conteúdo. Todos os refresh tokens
  são revogados.
- **Curtir, seguir e denunciar são idempotentes** onde faz sentido (curtir/seguir: repetir a
  ação é no-op silencioso, `204`; denunciar: reportar o mesmo alvo duas vezes → `409`).
- **Soft delete em fotos e comentários**: excluir não remove de verdade, só marca como excluído
  (quem excluiu, quando) — sem diferença visível pro client, mas é por isso que replicar
  (comentário raiz excluído "leva junto" as respostas, não quebra o fluxo de outros usuários).
- **Avaliações são upsert, não partial update**: avaliar de novo substitui nota *e* comentário
  por inteiro, mesmo que você só queira trocar a nota.
- **Respostas a comentário têm só 1 nível**: a API rejeita (`409`) tentativa de responder a uma
  resposta. A UI não deve nem oferecer "Responder" em itens que já são resposta.
- **`401` vs `403` não são intercambiáveis**: checagens antigas de "não é o dono" (excluir
  foto/comentário de outra pessoa sem ser moderador) retornam `401`, não `403` — um `401` num
  delete não necessariamente significa sessão expirada. Checagens de papel (endpoints
  `/moderation/*`, editar termos/privacidade) retornam `403` de verdade quando autenticado mas
  sem permissão.
- **Rate limits a respeitar** (veja `docs/API.md` do backend pros números exatos): busca de
  locais, denúncias, forgot/reset-password. Debounce no client é obrigatório independente do rate
  limit do servidor — o rate limit é rede de segurança, não estratégia de UX.

## 7. O que é específico da web e não deve ser replicado 1:1

- **Banner de consentimento de cookies** e **slot de anúncio in-feed do AdSense** — infraestrutura
  de monetização/compliance web-específica (cookies de terceiro, LGPD de cookies). Um app mobile
  monetizado por ads usaria um SDK de ads mobile nativo (AdMob etc.) com seu próprio fluxo de
  consentimento (Google UMP), não esse mecanismo.
- **Token em `localStorage`** — trocar por armazenamento seguro nativo (ver seção 4).
- **Google Sign-In via script de navegador (GIS)** — trocar pelo SDK nativo equivalente.
- **Upload de imagem via `<input type="file">` + biblioteca de recorte web** — trocar por
  image picker nativo (câmera/galeria) + biblioteca de crop nativa; o contrato com a API (upload
  em 2 passos via URL pré-assinada) continua idêntico.
- **Menu hambúrguer / dropdown de usuário no header** — são padrões de navegação desktop/web
  responsiva; no mobile o equivalente natural é uma tab bar nativa + stack navigation, não uma
  cópia literal desses componentes.

## 8. Referência resumida de endpoints

Prefixo `/api/v1` em todos. 🔒 = exige `Authorization: Bearer`. 🛡️ = exige papel
Moderator/Admin. 🐌 = rate limited (ver seção 6). Payloads exatos e casos de borda:
`docs/API.md` no repositório `sunsetapi`.

**Auth**
`POST /auth/register` · `POST /auth/login` · `POST /auth/google` · `POST /auth/refresh` ·
`POST /auth/logout` · 🐌`POST /auth/forgot-password` · 🐌`POST /auth/reset-password`

**Users**
`GET /users/{id}` · 🔒`POST`/`DELETE /users/{id}/follow` · `GET /users/{id}/followers` ·
`GET /users/{id}/following` · 🔒`PATCH /users/me` · 🔒`POST /users/me/avatar-upload-url` ·
🔒`DELETE /users/me` · `GET /users/{id}/photos`

**Locations**
🐌`GET /locations?q=&lat=&lng=&radius=` · `GET /locations/ranking?period=` ·
`GET /locations/{id}` · 🔒`POST /locations` · `GET /locations/{id}/photos` ·
`GET /locations/{id}/sunset?date=` · `GET /locations/{id}/ratings` ·
🔒`GET /locations/{id}/ratings/me` · 🔒`POST /locations/{id}/ratings` ·
🔒`DELETE /locations/{id}/ratings`

**Photos**
`GET /photos?sort=&cursor=` · `GET /photos/count` · 🔒`POST /photos/upload-url` ·
🔒`POST /photos` · `GET /photos/{id}` · 🔒`DELETE /photos/{id}` ·
🔒`POST`/`DELETE /photos/{id}/likes` · `GET /photos/{id}/comments` · `GET /comments/{id}` ·
🔒`POST /photos/{id}/comments` · `GET /comments/{id}/replies` · 🔒`DELETE /comments/{id}`

**Moderation**
🔒🐌`POST /photos/{id}/reports` · 🔒🐌`POST /comments/{id}/reports` ·
🔒🛡️`GET /moderation/reports?status=` · 🔒🛡️`PATCH /moderation/reports/{id}` ·
🔒🛡️`PATCH /moderation/users/{id}/role` (Admin) ·
🔒🛡️`GET /moderation/users?q=` (Admin) · 🔒🛡️`GET /moderation/actions` ·
`GET /terms` · `GET /privacy` · 🔒🛡️`PUT /terms` (Admin) · 🔒🛡️`PUT /privacy` (Admin)

**Notifications**
🔒`GET /notifications` · 🔒`GET /notifications/unread-count` ·
🔒`POST /notifications/{id}/read` · 🔒`POST /notifications/read-all`
