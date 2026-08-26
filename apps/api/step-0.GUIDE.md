# Шаг 0 — package / tsconfig / nest-cli / env

JSON не умеет комментарии — гайд здесь. Файлы рядом уже минимальные stubs: допиши/поправь по списку.

## package.json

Поставь зависимости (pnpm из корня репо):

```bash
cd apps/api
pnpm add @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/graphql @nestjs/apollo @apollo/server graphql reflect-metadata rxjs @prisma/client
pnpm add -D typescript @nestjs/cli @nestjs/schematics @swc/core @types/node prisma tsx
```

Scripts (ориентир):

- `start:dev` — Nest watch (SWC)
- `build` — nest build
- `prisma:generate` / `prisma:migrate` / `prisma:seed`

Имя пакета: `"api"`, чтобы root мог `pnpm --filter api …`.

## tsconfig.json

- `strict`, `experimentalDecorators`, `emitDecoratorMetadata`
- `outDir`: `dist`, `rootDir`: `src` (или как в nest-cli)
- module/moduleResolution под Nest 11 / NodeNext — смотри актуальный Nest scaffold

## nest-cli.json

- `sourceRoot`: `src`
- compilerOptions: `builder: "swc"` (без ts-node)

## .env.example

Скопируй в `.env` (не коммить `.env`):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selfskills?schema=public
PORT=3000
```

В Docker хост БД будет `db`, не `localhost` — см. шаг 5.

---

**NEXT:** открой [`src/main.ts`](src/main.ts) — bootstrap Nest.
