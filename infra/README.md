# infra

Локальный Postgres и prod-compose для VPS.

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

## VPS

См. [VPS.md](./VPS.md) и `docker-compose.prod.yml`.
