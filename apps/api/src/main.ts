import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { AppModule } from '#api/app.module';
import { PrismaService } from '#api/prisma/prisma.service';

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

  const prisma = app.get(PrismaService);

  // Uptime / status chips — Nest alive + Neon probe
  const http = app.getHttpAdapter().getInstance();
  http.get('/health', async () => {
    let db: 'up' | 'down' = 'down';

    try {
      await prisma.$queryRaw`SELECT 1`;
      db = 'up';
    } catch {
      db = 'down';
    }

    return { ok: true as const, db };
  });

  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
}
void bootstrap();
