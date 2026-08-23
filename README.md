# selfskills

Личная визитка-приложение: кто я, что умею, чем занимаюсь, как связаться.

Стек: TypeScript, Node.js, NestJS, Prisma, GraphQL, Docker, React (FSD).

Документация пока на русском — в конце зафиналим на английском.

## Статус

Только каркас папок. Код — дальше.

## Структура

```
apps/web   React + FSD (локально через pnpm, не в Docker)
apps/api   NestJS + GraphQL + Prisma (в Docker)
infra      Docker Compose (api + postgres)
```

Подробности — в README внутри каждой папки.

## Запуск (позже)

Dev: API и UI локально. Postgres можно сразу в Docker.

Prod-ish: `docker compose up` — Postgres + Nest. Фронт: `pnpm --filter web build` + start (без контейнера).
