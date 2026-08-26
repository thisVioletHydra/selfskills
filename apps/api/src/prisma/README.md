# prisma

Модуль Prisma: клиент, подключение к Postgres, схема/миграции.

Остальные модули берут БД отсюда, не плодят свои клиенты.

**Шаг 2:** `../../prisma/schema.prisma` → `prisma.service.ts` → `prisma.module.ts`.
