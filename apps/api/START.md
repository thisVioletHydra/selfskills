# START HERE — бейби-шаги бэка

Ты пишешь код. В каждом stub-файле сверху гайд + пример в комментах, внизу `NEXT:`.

Стек: Nest + Apollo GraphQL + Prisma + Postgres. Docker: только `api` + `db`.

## Цепочка

| Шаг | Открой | Что делаешь |
|-----|--------|-------------|
| **0** | [`package.json`](package.json), [`tsconfig.json`](tsconfig.json), [`nest-cli.json`](nest-cli.json), [`.env.example`](.env.example) | зависимости и конфиги (гайд в [`step-0.GUIDE.md`](step-0.GUIDE.md)) |
| **1** | [`src/main.ts`](src/main.ts), [`src/app.module.ts`](src/app.module.ts) | bootstrap Nest |
| **2** | [`prisma/schema.prisma`](prisma/schema.prisma), [`src/prisma/`](src/prisma/) | БД + PrismaService |
| **3** | [`src/profile/`](src/profile/) | **первый GraphQL** (связь с визиткой) |
| **4** | [`src/skill/`](src/skill/), [`src/project/`](src/project/) | по шаблону profile |
| **5** | [`../../infra/docker-compose.yml`](../../infra/docker-compose.yml), [`prisma/seed.ts`](prisma/seed.ts) | db + seed |

Застрял — кидай файл/ошибку в чат. Готовый Nest за тебя не дописываю.
