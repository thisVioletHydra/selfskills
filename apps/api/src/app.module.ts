import type { ApolloDriverConfig } from '@nestjs/apollo';

import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { PrismaModule } from '#api/prisma/prisma.module';
import { ProfileModule } from '#api/profile/profile.module';
import { ResumeModule } from '#api/resume/resume.module';

import process from 'node:process';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      graphiql: process.env.NODE_ENV !== 'production',
    }),
    PrismaModule,
    ProfileModule,
    ResumeModule,
  ],
})
export class AppModule {}
