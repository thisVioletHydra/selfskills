import { PrismaService } from '#api/prisma/prisma.service';
import { TOKEN_PRISMA } from '#api/prisma/prisma.tokens';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: TOKEN_PRISMA, useExisting: PrismaService },
  ],
  exports: [PrismaService, TOKEN_PRISMA],
})
export class PrismaModule {}
