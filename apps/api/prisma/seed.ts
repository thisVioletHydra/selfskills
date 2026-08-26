import process from 'node:process';

import { PrismaClient } from '@prisma/client';

import { profileSeed } from './seed-data/profile';

const prisma = new PrismaClient();

async function main() {
  const { slug, ...data } = profileSeed;

  await prisma.profile.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
