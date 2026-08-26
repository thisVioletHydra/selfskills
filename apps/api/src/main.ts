/**
 * STEP 1 — входная точка Nest.
 *
 * Зачем: поднять HTTP-сервер и подключить AppModule.
 * Сейчас: допиши bootstrap по примеру ниже (после шага 0 deps).
 *
 * Пример (ориентир, не копируй слепо версии API):
 *
 *   import 'reflect-metadata';
 *   import { NestFactory } from '@nestjs/core';
 *   import { AppModule } from '#api/app.module';
 *
 *   async function bootstrap() {
 *     const app = await NestFactory.create(AppModule);
 *     // CORS для apps/web (localhost Vite)
 *     app.enableCors({ origin: true });
 *     await app.listen(process.env.PORT ?? 3000);
 *   }
 *   void bootstrap();
 *
 * GraphQL path обычно /graphql — настроится в AppModule (Apollo).
 */

// TODO(STEP 1): импорты + bootstrap()

/**
 * NEXT: открой ./app.module.ts — корневой модуль и GraphQLModule.
 */
