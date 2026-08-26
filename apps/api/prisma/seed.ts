/**
 * STEP 5 — seed.
 *
 * Зачем: те же данные, что на визитке, иначе UI «поедет».
 *
 * Ориентир констант фронта:
 *   - apps/web/src/entities/profile/profile.ts → PROFILE
 *   - apps/web/src/entities/skill/tech-stack.ts → TECH_STACK
 *   - apps/web/src/entities/project/projects.ts → PROJECTS
 *
 * Пример каркаса:
 *
 *   import { PrismaClient } from '@prisma/client';
 *   const prisma = new PrismaClient();
 *
 *   async function main() {
 *     // await prisma.profile.create({ data: { ... } });
 *     // skills / projects upsert
 *   }
 *
 *   main()
 *     .then(() => prisma.$disconnect())
 *     .catch(async (e) => {
 *       console.error(e);
 *       await prisma.$disconnect();
 *       process.exit(1);
 *     });
 *
 * В package.json:
 *   "prisma": { "seed": "tsx prisma/seed.ts" }
 */

// TODO(STEP 5): seed main()

/**
 * NEXT: ../../infra/docker-compose.yml — Postgres + api.
 * Когда api отвечает — отдельно подключим apps/web к GraphQL.
 */
