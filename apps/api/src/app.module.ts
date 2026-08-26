/**
 * STEP 1 — корневой AppModule.
 *
 * Зачем: собрать GraphQL (Apollo) + фичевые модули.
 * Порядок подключения модулей позже: PrismaModule → ProfileModule → Skill → Project.
 *
 * Пример каркаса:
 *
 *   import { Module } from '@nestjs/common';
 *   import { GraphQLModule } from '@nestjs/graphql';
 *   import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
 *   // import { PrismaModule } from '#api/prisma/prisma.module';
 *   // import { ProfileModule } from '#api/profile/profile.module';
 *
 *   @Module({
 *     imports: [
 *       GraphQLModule.forRoot<ApolloDriverConfig>({
 *         driver: ApolloDriver,
 *         autoSchemaFile: true, // или path к schema.gql
 *         playground: true,
 *       }),
 *       // PrismaModule,
 *       // ProfileModule,
 *     ],
 *   })
 *   export class AppModule {}
 */

// TODO(STEP 1): @Module({ imports: [...] }) export class AppModule {}

/**
 * NEXT: открой ../prisma/schema.prisma и ./prisma/prisma.service.ts — шаг 2, БД.
 */
