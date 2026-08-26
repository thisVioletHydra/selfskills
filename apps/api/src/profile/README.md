# profile

`query profile` → ProfileResolver → ProfileService → Prisma → Postgres.

DI через tokens (`TOKEN_PROFILE_SERVICE`, `TOKEN_PRISMA`): в resolver/service — `import type`, в module — wiring.

Без seed в БД query вернёт 404.
