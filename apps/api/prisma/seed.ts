import { profileSeed } from './seed-data/profile';
import { PrismaClient } from '@prisma/client';
import process from 'node:process';

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
