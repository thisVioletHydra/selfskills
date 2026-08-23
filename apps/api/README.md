# apps/api

Бэкенд: NestJS + GraphQL + Prisma.

## Модули

| Модуль | За что |
|---|---|
| `profile` | Кто я — тип GraphQL + резолвер |
| `skill` | Навыки |
| `project` | Проекты |
| `prisma` | Клиент Prisma, доступ к БД |

Паттерн: модуль = резолвер + сервис → Prisma. FSD на бэке нет.

## Поток

```
GraphQL-запрос → резолвер → сервис → Prisma → Postgres
```

## Docker

В compose (`infra/`) только **api + postgres**. Фронт снаружи на pnpm.
