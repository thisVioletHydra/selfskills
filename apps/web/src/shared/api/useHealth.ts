import type { HealthSnapshot } from '#web/shared/api/health-api';

import { getHealthSnapshot, subscribeHealth } from '#web/shared/api/health-api';
import { useEffect, useState } from 'react';

export function useHealth(): HealthSnapshot {
  const [health, setHealth] = useState<HealthSnapshot>(() => getHealthSnapshot());

  useEffect(() => subscribeHealth(setHealth), []);

  return health;
}
