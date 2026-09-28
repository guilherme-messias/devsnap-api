# DevSnap API

API REST do **DevSnap** — aplicativo de aprendizado para desenvolvedores baseado em stacks de episódios (erro → solução), revisões, anotações e sessões de foco.

Construída com NestJS 11, Prisma 7 (PostgreSQL), autenticação JWT (RS256) e cache Redis (`CACHE_DRIVER`: TCP local ou Upstash REST).

## Sumário

- [Visão geral](#visão-geral)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Autenticação](#autenticação)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
- [Domínio e recursos](#domínio-e-recursos)
- [Testes](#testes)
- [CI](#ci)
- [Docker](#docker)

## Visão geral

O fluxo principal do produto:

1. O usuário cria **stacks** (coleções por tecnologia/tema).
2. Em cada stack, cadastra **episódios** com `title`, `error` e `solution`.
3. Pode adicionar **anotações** e registrar **revisões** de episódios.
4. Inicia **sessões de foco** que embaralham episódios da stack (revisar / pular / finalizar).
5. Consulta o **dashboard** com progresso (pendentes, revisados, atrasados após 7 dias).

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js 24 |
| Framework | NestJS 11 (Express) |
| Linguagem | TypeScript |
| Banco | PostgreSQL 17 + Prisma 7 (`@prisma/adapter-pg`) |
| Cache | Redis via `CacheRepository` — driver `redis` (TCP) ou `upstash` (REST) |
| Auth | Passport JWT + RS256, senhas com argon2 |
| Validação | Zod + `nestjs-zod` |
| Docs | Swagger UI em `/api` |
| Testes | Vitest (unit + e2e com Supertest) |

## Arquitetura

```
src/
├── modules/           # Domínio (users, stacks, episodes, annotations,
│                      # episode-reviews, focus-sessions, dashboard)
├── infrastructure/    # Prisma, auth/JWT, cache (Redis)
├── shared/            # pipes, schemas HTTP compartilhados
└── main.ts            # bootstrap + Swagger
```

Aliases TypeScript: `@modules/*`, `@infrastructure/*`, `@shared/*`, `@http/*`, `@app`.

Cada módulo de domínio costuma seguir o padrão: `controllers/` (um por ação), `services/`, `schemas/{request,response}/` e `*.module.ts`.

O cache é injetado pela abstração `CacheRepository`. O `RedisModule` escolhe a implementação com `CACHE_DRIVER`:

- `redis` — Redis TCP (`REDIS_URL`), tipicamente o container do Compose
- `upstash` — Upstash REST (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`)

Nos testes e2e o provider é sobrescrito por `InMemoryCacheRepository`.

## Pré-requisitos

- Node.js **24+**
- npm
- Docker e Docker Compose (Postgres + Redis local)
- Par de chaves RSA para JWT (privada + pública)
- Conta [Upstash](https://upstash.com/) apenas em produção (ou quando `CACHE_DRIVER=upstash`)

## Instalação

```bash
# 1. Dependências
npm install

# 2. Ambiente
cp .env.example .env
# Edite .env: DATABASE_URL, JWT e CACHE_DRIVER=redis + REDIS_URL (local)

# 3. Infra local (Postgres :5434 + Redis :6379)
npm run start:infra

# 4. Banco
npx prisma migrate deploy
npx prisma generate

# 5. API em watch mode
npm run start:dev
```

Por padrão a API sobe em `http://localhost:3000`.

Exemplo de `DATABASE_URL` apontando para o Compose:

```env
DATABASE_URL="postgresql://devsnap_user:devsnap_password@localhost:5434/devsnap_db"
CACHE_DRIVER=redis
REDIS_URL=redis://localhost:6379
```

### Gerar chaves JWT (RS256)

As variáveis `JWT_PRIVATE_KEY` e `JWT_PUBLIC_KEY` devem ser o conteúdo PEM **codificado em base64**:

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# Linux
base64 -w 0 private.pem
base64 -w 0 public.pem

# macOS
base64 -i private.pem
base64 -i public.pem
```

Cole os valores resultantes em `.env` (sem quebras de linha).

## Variáveis de ambiente

Veja `.env.example`. Variáveis usadas pela aplicação:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | sim | Connection string do PostgreSQL |
| `TEST_DATABASE_URL` | para e2e | Banco/schema usado nos testes e2e |
| `JWT_PRIVATE_KEY` | sim | Chave privada RSA em base64 |
| `JWT_PUBLIC_KEY` | sim | Chave pública RSA em base64 |
| `CACHE_DRIVER` | sim* | `redis` ou `upstash` (*default no código: `upstash`) |
| `REDIS_URL` | se `CACHE_DRIVER=redis` | URL TCP do Redis (ex.: `redis://localhost:6379`) |
| `UPSTASH_REDIS_REST_URL` | se `CACHE_DRIVER=upstash` | URL REST do Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | se `CACHE_DRIVER=upstash` | Token REST do Upstash |
| `PORT` | não | Porta HTTP (padrão `3000`) |
| `JWT_EXPIRATION` | não | Presente no exemplo/CI; TTL de access token no código é **15m** |

**Local:** `CACHE_DRIVER=redis` + `REDIS_URL`. **Produção (ex.: Render):** `CACHE_DRIVER=upstash` + `UPSTASH_*` (sem `REDIS_URL`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run start:infra` | Sobe Postgres + Redis via Docker Compose |
| `npm run start:dev` | API em modo desenvolvimento (watch) |
| `npm run start:debug` | Mesmo com debugger |
| `npm run start:prod` | Roda `dist/main` (após build) |
| `npm run build` | Compila o projeto |
| `npm run lint` | ESLint com `--fix` |
| `npm run format` | Checa Prettier |
| `npm run prettier` | Formata com Prettier |
| `npm run test` | Testes unitários |
| `npm run test:watch` | Unitários em watch |
| `npm run test:cov` | Coverage |
| `npm run test:e2e` | Testes end-to-end |

## Autenticação

Fluxo:

1. **Register** `POST /auth/register` — cria usuário com senha hasheada (argon2).
2. **Login** `POST /auth/login` — retorna access token (15m) + refresh token (7d).
3. Rotas protegidas enviam `Authorization: Bearer <access_token>`.
4. **Refresh** `POST /auth/refresh` — usa o refresh token; o hash do refresh fica persistido no usuário.
5. **Logout** `POST /auth/logout` — invalida o refresh armazenado.

Rotas públicas: `POST /auth/register`, `POST /auth/login` e `GET /`.

Demais rotas de domínio exigem JWT de acesso (`typ: access`). Refresh/logout usam strategy `jwt-refresh` (`typ: refresh`).

## Documentação da API (Swagger)

Com a API rodando:

```
http://localhost:3000/api
```

O OpenAPI é gerado a partir dos controllers Nest + schemas Zod (`cleanupOpenApiDoc`).

Use o Swagger como fonte de verdade dos payloads, query params e respostas. Este README cobre setup e funcionamento — não duplica o contrato HTTP endpoint a endpoint.

## Domínio e recursos

| Recurso | Prefixo | Papel |
|---------|---------|-------|
| Auth / Users | `/auth/*`, `/users/me` | Conta e perfil |
| Dashboard | `/dashboard` | Métricas de progresso |
| Stacks | `/stacks` | Coleções do usuário |
| Episodes | `/episodes` | Cards erro/solução |
| Annotations | `/episodes/:episodeId/annotations` | Notas por episódio |
| Reviews | `/episodes/:episodeId/reviews` | Histórico de revisão |
| Focus sessions | `/focus-sessions` | Prática cronometrada por stack |

Modelo de dados (Prisma): `User` → `Stack` → `Episode` → `Annotation` / `EpisodeReview`; `FocusSession` + `FocusSessionItem` ligados à stack/episódios.

## Testes

```bash
# Unitários
npm run test

# E2E (requer TEST_DATABASE_URL e chaves JWT no ambiente)
npm run test:e2e
```

Os e2e criam um schema Postgres isolado por execução (`test/setup-e2e.ts`), aplicam migrations e limpam ao final. Specs ficam em `test/<módulo>/*.e2e-spec.ts` e usam cache in-memory (não dependem de Redis/Upstash).

## CI

Workflow em `.github/workflows/ci.yml` (push/PR em `main`), Node 24:

1. `format`
2. `lint` (com `prisma generate`)
3. `test`
4. `test-e2e` (serviço Postgres 17)
5. `build`

## Docker

**Infra local** (`docker-compose.yml`):

- `devsnap-db` — Postgres 17 em `localhost:5434`
- `devsnap-redis` — Redis Alpine em `localhost:6379` (usado com `CACHE_DRIVER=redis`)

**Imagem da API** (`Dockerfile`):

```bash
docker build -t devsnap-api .
docker run --env-file .env -p 3000:3000 devsnap-api
```

A imagem usa Node 24 Alpine, gera o client Prisma, faz build e executa `npm run start:prod` na porta 3000. Postgres e o backend de cache (`REDIS_URL` ou Upstash, conforme `CACHE_DRIVER`) devem estar acessíveis a partir do container.
