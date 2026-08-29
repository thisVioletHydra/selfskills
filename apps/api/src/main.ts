import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from '#api/app.module';

import process from 'node:process';

import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // CORS_ORIGIN="https://user.github.io,https://example.com"; без переменной — любой origin (dev)
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({ origin: corsOrigin === undefined || corsOrigin === '' ? true : corsOrigin.split(',') });

  // Render / uptime probes — простой GET без GraphQL
  const http = app.getHttpAdapter().getInstance();
  http.get('/health', async () => ({ ok: true }));

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}
void bootstrap();
