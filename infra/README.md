# infra

Локальный Postgres (`pnpm db`). Prod сейчас **не здесь**: API на Railway, БД на Neon — см. корневой README и `.cursor/rules/hosting.mdc`.

## Локально (Colima / Docker)

```bash
brew install colima docker docker-compose   # один раз
# не делай brew services start colima

pnpm db up        # держит postgres, Ctrl+C = stop
pnpm db down      # если контейнер завис
pnpm db destroy   # снести volume
```

Compose: `infra/docker-compose.yml`  
Переменные API: `apps/api/.env.example`

Дальше из корня: migrate + seed + `pnpm back` / `pnpm front` — см. корневой `README.md`.

## VPS (не используется)

Запасной сценарий: [VPS.md](./VPS.md) + `docker-compose.prod.yml`. Сейчас в проде не крутим.
