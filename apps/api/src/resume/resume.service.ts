import type { Resume as ResumeRow } from '@prisma/client';
import type { Locale } from '#api/common/graphql/locale.enum';
import type { PrismaService } from '#api/prisma/prisma.service';
import type { Resume } from '#api/resume/graphql/resume.model';

import { Inject, Injectable } from '@nestjs/common';
import { TOKEN_PRISMA } from '#api/prisma/prisma.tokens';

function mapResume(row: ResumeRow): Resume {
  return {
    phone: row.phone,
    email: row.email,
    experienceYears: row.experienceYears,
    education: row.education as unknown as Resume['education'],
    skills: row.skills as unknown as string[],
    jobs: row.jobs as unknown as Resume['jobs'],
  };
}

@Injectable()
export class ResumeService {
  constructor(@Inject(TOKEN_PRISMA) private readonly prisma: PrismaService) {}

  async findOne(locale: Locale): Promise<Resume | null> {
    const row = await this.prisma.resume.findUnique({
      where: { locale },
    });

    return row ? mapResume(row) : null;
  }
}
