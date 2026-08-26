/**
 * STEP 2 — PrismaService.
 *
 * Зачем: один PrismaClient на Nest (onModuleInit / onModuleDestroy).
 * Остальные модули инжектят его, свои клиенты не плодят.
 *
 * Пример:
 *
 *   import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
 *   import { PrismaClient } from '@prisma/client';
 *
 *   @Injectable()
 *   export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
 *     async onModuleInit() {
 *       await this.$connect();
 *     }
 *
 *     async onModuleDestroy() {
 *       await this.$disconnect();
 *     }
 *   }
 */

// TODO(STEP 2): class PrismaService ...

/**
 * NEXT: ./prisma.module.ts — @Global() Module с PrismaService.
 */
