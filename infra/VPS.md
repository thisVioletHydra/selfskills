# VPS (слабый) — Nest GraphQL + Postgres

Цель: API на VPS, фронт на GitHub Pages → `VITE_GRAPHQL_URL`.

## Железо

Минимум комфортный: **1 GB RAM**. На 512 MB может упереться в OOM при `docker build` —
тогда **собери образ на ноуте**, залей на VPS (`docker save | ssh docker load`).

Лимиты в `docker-compose.prod.yml`: db ~256 MB, api ~384 MB.

## Поднять

```bash
# на VPS, из клона репо
cp infra/.env.prod.example infra/.env.prod
# поставь нормальный POSTGRES_PASSWORD

docker compose -f infra/docker-compose.prod.yml --env-file infra/.env.prod up -d --build
```

Проверка:

```bash
curl -s -X POST http://127.0.0.1:3000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ __typename }"}'
```

Сиды (один раз с ноута через SSH-туннель — в образе нет tsx):

```bash
# терминал 1
ssh -L 5433:db:5432 user@VPS_IP
# если db не резолвится с хоста — пробрось порт db в compose временно, или:
ssh -L 5433:127.0.0.1:5432 user@VPS_IP
# и на VPS: docker compose ... port 5432:5432 только на 127.0.0.1

# терминал 2 (локально, из репо)
DATABASE_URL='postgresql://selfskills:PASS@127.0.0.1:5433/selfskills?schema=public' \
  pnpm --filter api prisma:seed
```

Или один раз добавь в `docker-compose.prod.yml` у `db`:

```yaml
ports:
  - '127.0.0.1:5432:5432'
```

и сиди на `localhost:5432`.

## Снаружи

1. Открой порт **3000** (или 80/443 через nginx → `proxy_pass http://127.0.0.1:3000`).
2. HTTPS — очень желательно (Let's Encrypt + caddy/nginx).
3. CORS на Nest сейчас `origin: true` — ок для Pages.

## Фронт (GitHub Pages)

```bash
# локально проверить
VITE_GRAPHQL_URL=https://api.твой-домен/graphql pnpm --filter web build
```

В Actions: secret `VITE_GRAPHQL_URL`, в workflow:

```yaml
env:
  VITE_GRAPHQL_URL: ${{ secrets.VITE_GRAPHQL_URL }}
  GITHUB_PAGES: 'true'
```

## Если VPS задыхается

1. Собирай образ не на VPS.
2. Не крути GraphiQL в проде (можно выключить позже).
3. Крайний вариант — SQLite вместо Postgres (отдельный рефактор схемы).
