# apps/web

React UI, Feature-Sliced Design.

## Layers

| Layer | Role |
|---|---|
| `app` | Providers, router, entry |
| `pages` | Route screens. One page for now: `profile` |
| `widgets` | Page blocks: hero, skills, projects, contacts |
| `features` | User actions. Keep thin — only `copy-contact` for now |
| `entities` | Domain pieces: profile, skill, project |
| `shared` | UI kit, GraphQL client, helpers, config |

Import rule: upper layers may use lower ones. Never the other way.

```
app → pages → widgets → features → entities → shared
```

## GraphQL

All API calls go through `shared/api`. Widgets and pages do not talk to Nest directly.

## Do not dump into `shared`

- Page-specific layout
- Business rules for one entity
- One-off copy/contact logic — that stays in `features/copy-contact`

## Run (later)

Dev: `pnpm --filter web dev`  
Prod: `pnpm --filter web build` + `pnpm --filter web start`  
Not Docker — API is.
