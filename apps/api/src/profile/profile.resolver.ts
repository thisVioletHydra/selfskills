/**
 * STEP 3 — ProfileResolver + ObjectType (можно вынести в profile.model.ts).
 *
 * Зачем: ПЕРВЫЙ API для связи с визиткой. Проверь playground: http://localhost:PORT/graphql
 *
 * Пример:
 *
 *   import { Query, Resolver, ObjectType, Field } from '@nestjs/graphql';
 *   import { ProfileService } from '#api/profile/profile.service';
 *
 *   @ObjectType()
 *   export class Profile {
 *     @Field()
 *     name: string;
 *
 *     @Field()
 *     role: string;
 *
 *     @Field({ nullable: true })
 *     blurb?: string;
 *   }
 *
 *   @Resolver(() => Profile)
 *   export class ProfileResolver {
 *     constructor(private readonly profileService: ProfileService) {}
 *
 *     @Query(() => Profile, { name: 'profile' })
 *     profile() {
 *       return this.profileService.findOne();
 *     }
 *   }
 *
 * Query в playground:
 *   query { profile { name role blurb } }
 */

// TODO(STEP 3): Profile ObjectType + ProfileResolver

/**
 * NEXT: ../skill/skill.module.ts — шаг 4 (тот же шаблон: module / service / resolver).
 */
