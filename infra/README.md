# infra

Postgres через **Colima** (без Docker Desktop, без автозапуска при логине).

## Первый раз

```bash
brew install colima docker docker-compose
```

Не делай `brew services start colima`.

## Три терминала

```bash
pnpm db up       # терминал 1 — держит postgres, Ctrl+C = stop
pnpm back        # терминал 2
pnpm front       # терминал 3
```

`pnpm db down` — если контейнер остался висеть после краша терминала.

`pnpm db destroy` — убить БД под ноль (volume).

Первый clone — migrate + seed:

```bash
cd apps/api
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

Colima выключить: `colima stop`
