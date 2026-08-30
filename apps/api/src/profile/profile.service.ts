import type { Profile as ProfileRow } from '@prisma/client';
import type { PrismaService } from '#api/prisma/prisma.service';
import type { Profile } from '#api/profile/graphql/profile.model';

import { Inject, Injectable } from '@nestjs/common';
import { Locale } from '#api/common/graphql/locale.enum';
import { TOKEN_PRISMA } from '#api/prisma/prisma.tokens';
import { PROFILE_SLUG } from '#api/profile/profile.constants';

function normalizePortraitKey(portrait: string): string {
  if (!portrait.includes('/')) {
    return portrait;
  }

  return portrait.replace(/^.*\//, '').replace(/\.[^.]+$/, '');
}

function mapProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    role: row.role,
    tag: row.tag,
    blurb: row.blurb,
    portrait: normalizePortraitKey(row.portrait),
    facts: row.facts as unknown as Profile['facts'],
    about: row.about as unknown as string[],
  };
}

@Injectable()
export class ProfileService {
  constructor(@Inject(TOKEN_PRISMA) private readonly prisma: PrismaService) {}

  async findOne(locale: Locale): Promise<Profile | null> {
    const row = await this.prisma.profile.findUnique({
      where: { slug: PROFILE_SLUG },
    });

    if (row === null) {
      return null;
    }

    if (locale === Locale.ru) {
      return mapProfile(row);
    }

    const localeRow = await this.prisma.profileLocale.findUnique({
      where: { locale },
    });

    if (localeRow === null) {
      return mapProfile(row);
    }

    const base = mapProfile(row);

    return {
      name: localeRow.name,
      role: base.role,
      tag: base.tag,
      blurb: localeRow.blurb,
      portrait: base.portrait,
      facts: localeRow.facts as unknown as Profile['facts'],
      about: localeRow.about as unknown as string[],
    };
  }
}
