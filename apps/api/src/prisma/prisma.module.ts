/**
 * STEP 2 — PrismaModule.
 *
 * Пример:
 *
 *   import { Global, Module } from '@nestjs/common';
 *   import { PrismaService } from './prisma.service';
 *
 *   @Global()
 *   @Module({
 *     providers: [PrismaService],
 *     exports: [PrismaService],
 *   })
 *   export class PrismaModule {}
 *
 * Потом импортни PrismaModule в AppModule.
 */

// TODO(STEP 2): @Global() @Module(...) export class PrismaModule {}

/**
 * NEXT: ../profile/profile.module.ts — шаг 3, ПЕРВЫЙ GraphQL API для связи с проектом.
 */
