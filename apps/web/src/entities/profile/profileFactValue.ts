import type { ProfileInfo } from '#web/entities/profile/profile';
import type { Locale } from '#web/shared/lib/locale-state';

import { profileFactLabels } from '#web/entities/profile/profile.facts.locale';

export function profileFactValue(
  facts: ProfileInfo['facts'],
  key: keyof typeof profileFactLabels,
  locale: Locale,
  fallback: string,
) {
  const primaryLabel = profileFactLabels[key][locale];
  const ruLabel = profileFactLabels[key].ru;

  return (
    facts.find((fact) => fact.label === primaryLabel)?.value
    ?? facts.find((fact) => fact.label === ruLabel)?.value
    ?? fallback
  );
}
