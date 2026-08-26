# apps/api

Бэкенд: NestJS + Apollo GraphQL + Prisma.

**Начни здесь:** [START.md](START.md) — бейби-шаги 0→5. В stub-файлах гайды в комментах и `NEXT:`.

## Модули

| Модуль | За что | Шаг |
|---|---|---|
| `prisma` | Клиент Prisma, доступ к БД | 2 |
| `profile` | Кто я — тип GraphQL + резолвер (первый API) | 3 |
| `skill` | Навыки | 4 |
| `project` | Проекты | 4 |

Паттерн: модуль = резолвер + сервис → Prisma. FSD на бэке нет.

## Поток

```
GraphQL-запрос → резолвер → сервис → Prisma → Postgres
```

## Docker

В compose (`infra/`) только **api + postgres**. Фронт снаружи на pnpm. См. шаг 5.
