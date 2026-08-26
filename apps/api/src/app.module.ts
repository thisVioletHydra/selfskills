import type { ApolloDriverConfig } from '@nestjs/apollo';

import { PrismaModule } from '#api/prisma/prisma.module';
import { ProfileModule } from '#api/profile/profile.module';
import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      graphiql: true,
    }),
    PrismaModule,
    ProfileModule,
  ],
})
export class AppModule {}
