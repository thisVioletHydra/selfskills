import type { ResumeInfo } from '#app/entities/resume/resume';

import { DEMO_RESUME } from '#app/entities/resume/resume';

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Заглушка под будущий GraphQL/Prisma.
 * Сейчас любой URL (или пусто) → демо-резюме с искусственной задержкой.
 */
export async function fetchResume(sourceUrl: string): Promise<ResumeInfo> {
  await wait(700 + Math.floor(Math.random() * 500));

  return {
    ...DEMO_RESUME,
    sourceUrl: sourceUrl.trim() || undefined,
  };
}
