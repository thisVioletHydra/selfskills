import type { ResumeInfo } from '#web/entities/resume/resume';

import { DEMO_RESUME } from '#web/entities/resume/resume';
import { sleep } from '#web/shared/lib/sleep';

/**
 * Заглушка под будущий GraphQL/Prisma.
 * Сейчас любой URL (или пусто) → демо-резюме с искусственной задержкой.
 */
export async function fetchResume(sourceUrl: string): Promise<ResumeInfo> {
  await sleep(700 + Math.floor(Math.random() * 500));

  const trimmed = sourceUrl.trim();

  return {
    ...DEMO_RESUME,
    sourceUrl: trimmed === '' ? undefined : trimmed,
  };
}
