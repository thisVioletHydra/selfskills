# selfskills

Портфолио / визитка: NestJS GraphQL API + React (Vite), данные в Postgres через Prisma.

## Структура

```
apps/
  api/          NestJS + Apollo GraphQL + Prisma + Fastify
  web/          React + Vite (FSD: app / pages / widgets / features / entities / shared)
infra/          Docker Compose (локальный Postgres + prod/VPS)
packages/
  oxlint-rules/ Кастомные правила oxlint для монорепы
```

### `apps/api`

```
src/
  main.ts           Точка входа
  app.module.ts
  common/           Общие GraphQL-типы (Locale)
  prisma/           PrismaModule / PrismaService
  profile/          Query profile(locale)
  resume/           Query resume(locale)
prisma/
  schema.prisma
  migrations/
  seed-data/        Сиды профиля и резюме (*.locale.ru.ts / *.locale.en.ts)
```

GraphQL: `http://localhost:3000/graphql`

### `apps/web`

```
src/
  app/              Bootstrap, стили
  pages/            HomeGate, ProfilePage, gateway (404/502)
  widgets/          CosmosStage, PortfolioBento
  features/         PlanetModal
  entities/         profile, resume, planet
  shared/           api (GraphQL), i18n, ui
public/
  icons/            SVG (имя файла = id)
  images/           webp (portrait, qr, …)
vite/
  asset-manifest-plugin.ts   Hash URL для public-ассетов
```

Dev: Vite проксирует `/graphql` → `localhost:3000`.  
Prod/Pages: `VITE_GRAPHQL_URL` (см. `apps/web/.env.example`).

## Требования

- Node **24**
- pnpm **11** (`packageManager` в корневом `package.json`)
- Docker / Colima — для Postgres (`pnpm db`)

## Первый запуск

```bash
pnpm install

# 1) Postgres
pnpm db up

# 2) Миграции + сиды (другой терминал)
pnpm --filter api exec prisma migrate deploy
pnpm --filter api prisma:seed

# 3) API
pnpm back

# 4) Web
pnpm front
```

Открыть: [http://localhost:5173](http://localhost:5173)  
GraphQL playground: [http://localhost:3000/graphql](http://localhost:3000/graphql)

### Env

```bash
cp apps/api/.env.example apps/api/.env
# DATABASE_URL и PORT — как в example, если Postgres из infra/
```

## Скрипты (корень)

| Команда | Что делает |
|--------|------------|
| `pnpm front` | Vite dev (web) |
| `pnpm back` | Nest watch (api) |
| `pnpm db up` | Postgres в Docker |
| `pnpm db down` | Остановить контейнер |
| `pnpm db destroy` | Убить volume БД |
| `pnpm build` | prisma generate + api build + web build |

## Локаль (EN/RU)

- UI-строки: `apps/web/src/shared/i18n/messages.locale.*.ts`
- Контент профиля/резюме: БД + сиды `*.locale.*.ts`
- Планеты: `planets.ts` (ru) + `planets.locale.en.ts`

## Деплой

- **GitHub Pages** — только статика web (workflow `.github/workflows/pages.yml`). Нужен remote GraphQL: secret `VITE_GRAPHQL_URL`.
- **VPS** — `infra/docker-compose.prod.yml` + `infra/VPS.md` (слабый VPS: образ лучше собирать на ноуте).

## Стек

TypeScript · Node · NestJS · GraphQL · Prisma · PostgreSQL · React · Vite · pnpm monorepo
