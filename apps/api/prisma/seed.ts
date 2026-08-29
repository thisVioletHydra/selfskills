import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import { profileLocaleSeed } from './seed-data/profile.locale.en';
import { profileSeed } from './seed-data/profile';
import { resumeLocaleSeed as resumeEnSeed } from './seed-data/resume.locale.en';
import { resumeLocaleSeed as resumeRuSeed } from './seed-data/resume.locale.ru';

const prisma = new PrismaClient();

async function main() {
  const { slug, ...data } = profileSeed;

  await prisma.profile.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data },
  });

  const { locale: profileLocale, ...profileLocaleData } = profileLocaleSeed;

  await prisma.profileLocale.upsert({
    where: { locale: profileLocale },
    update: profileLocaleData,
    create: { locale: profileLocale, ...profileLocaleData },
  });

  for (const resumeSeed of [resumeRuSeed, resumeEnSeed]) {
    const { locale, ...resumeData } = resumeSeed;

    await prisma.resume.upsert({
      where: { locale },
      update: resumeData,
      create: { locale, ...resumeData },
    });
  }
}

void main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
