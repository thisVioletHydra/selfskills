import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import 'reflect-metadata';
import { AppModule } from '#api/app.module';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({ origin: true });
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}

void bootstrap();
