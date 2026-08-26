import { Inject, Injectable } from '@nestjs/common';
import type { Profile as ProfileRow } from '@prisma/client';

import type { PrismaService } from '#api/prisma/prisma.service';
import { TOKEN_PRISMA } from '#api/prisma/prisma.tokens';
import { PROFILE_SLUG } from '#api/profile/profile.constants';
import type { Profile } from '#api/profile/graphql/profile.model';

function mapProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    role: row.role,
    tag: row.tag,
    blurb: row.blurb,
    portrait: row.portrait,
    facts: row.facts as unknown as Profile['facts'],
    goals: row.goals as unknown as string[],
    about: row.about as unknown as string[],
  };
}

@Injectable()
export class ProfileService {
  constructor(@Inject(TOKEN_PRISMA) private readonly prisma: PrismaService) {}

  async findOne(): Promise<Profile | null> {
    const row = await this.prisma.profile.findUnique({
      where: { slug: PROFILE_SLUG },
    });

    return row ? mapProfile(row) : null;
  }
}
