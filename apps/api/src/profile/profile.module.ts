/**
 * STEP 3 — ProfileModule (первый живой GraphQL).
 *
 * Зачем: фронт потом ткнётся в query profile. Не весь CRUD сразу — чтение ок.
 *
 * Пример:
 *
 *   import { Module } from '@nestjs/common';
 *   import { ProfileResolver } from './profile.resolver';
 *   import { ProfileService } from './profile.service';
 *
 *   @Module({
 *     providers: [ProfileResolver, ProfileService],
 *   })
 *   export class ProfileModule {}
 *
 * Не забудь ProfileModule в AppModule.imports.
 */

// TODO(STEP 3): ProfileModule

/**
 * NEXT: ./profile.service.ts → потом ./profile.resolver.ts
 */
