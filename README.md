# selfskills

Personal profile as a small app: who I am, what I ship, how to reach me.

Stack: TypeScript, Node.js, NestJS, Prisma, GraphQL, Docker, React (FSD).

## Status

Folder preview only. Code tomorrow.

## Layout

```
apps/web   React + FSD (pnpm, not Docker)
apps/api   NestJS + GraphQL + Prisma (Docker)
infra      Docker Compose (api + postgres)
```

### Web (FSD)

```
apps/web/src/
  app/
  pages/profile/
  widgets/{hero,skills-block,projects-grid,contacts-bar}/
  features/copy-contact/
  entities/{profile,skill,project}/
  shared/{ui,api,lib,config}/
```

See [apps/web/README.md](apps/web/README.md).

### API (Nest modules)

```
apps/api/src/
  profile/
  skill/
  project/
  prisma/
```

See [apps/api/README.md](apps/api/README.md).

## Run

Dev: API and UI locally, poke until it works. Postgres can sit in Docker early.

Prod-ish: `docker compose up` for Postgres + Nest. Frontend: `pnpm --filter web build` + start (no container).
