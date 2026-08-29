# Build from monorepo root:
#   docker build -f apps/api/Dockerfile -t selfskills-api .
#
# Fat build stage → lean runner. Do not build on a 512MB VPS — build on a laptop.

FROM node:24-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/oxlint-rules/package.json packages/oxlint-rules/

RUN pnpm install --filter api... --frozen-lockfile

COPY apps/api apps/api
COPY packages/oxlint-rules packages/oxlint-rules

RUN pnpm --filter api exec prisma generate \
  && pnpm --filter api build \
  && pnpm --filter api deploy --prod /out \
  && cp -R apps/api/prisma /out/prisma \
  && cp -R apps/api/dist /out/dist

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS=--max-old-space-size=192

RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /out ./

USER app
EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
