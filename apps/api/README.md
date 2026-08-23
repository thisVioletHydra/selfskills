# apps/api

NestJS + GraphQL + Prisma.

## Modules

One Nest module per domain slice:

| Module | Owns |
|---|---|
| `profile` | Who I am — GraphQL type + resolver |
| `skill` | Skills list |
| `project` | Projects / work samples |
| `prisma` | Prisma client, DB access for the rest |

Pattern: module = GraphQL resolver + service that talks to Prisma for that entity. No FSD here.

## Data flow

```
GraphQL request → resolver → service → Prisma → Postgres
```

## Docker

Compose (in `infra/`) runs **api + postgres** only.  
Frontend stays on the host via pnpm.

## Run (later)

Dev: Nest watch locally, Postgres in Docker (or local).  
Prod-ish: `docker compose up` for api + db.
