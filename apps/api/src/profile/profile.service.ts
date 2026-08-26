/**
 * STEP 3 — ProfileService.
 *
 * Зачем: бизнес/данные. Резолвер тонкий → сервис → Prisma.
 *
 * Пример:
 *
 *   import { Injectable } from '@nestjs/common';
 *   import { PrismaService } from '#api/prisma/prisma.service';
 *
 *   @Injectable()
 *   export class ProfileService {
 *     constructor(private readonly prisma: PrismaService) {}
 *
 *     findOne() {
 *       // return this.prisma.profile.findFirst();
 *       // пока нет миграций — можно временно вернуть хардкод как на фронте PROFILE
 *     }
 *   }
 */

// TODO(STEP 3): ProfileService

/**
 * NEXT: ./profile.resolver.ts — GraphQL query.
 */
