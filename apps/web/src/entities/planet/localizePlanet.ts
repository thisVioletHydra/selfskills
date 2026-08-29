import type { Planet } from '#web/entities/planet/planets';
import type { Locale } from '#web/shared/lib/locale-state';

import { planetsLocale } from '#web/entities/planet/planets.locale.en';

export function localizePlanet(planet: Planet, locale: Locale): Planet {
  if (locale === 'ru') {
    return planet;
  }

  const copy = planetsLocale[planet.id];

  if (copy === undefined) {
    return planet;
  }

  return {
    ...planet,
    ...copy,
  };
}
