import type { OrbitPresence } from '#web/shared/lib/orbit-presence';

import { subscribeOrbitPresence } from '#web/shared/lib/orbit-presence';
import { useEffect, useState } from 'react';

const INITIAL: OrbitPresence = {
  inView: true,
  pageVisible: typeof document === 'undefined' ? true : document.visibilityState === 'visible',
};

/** Hero (or any target) in viewport + tab visible. */
export function useOrbitPresence(targetId = 'hero') {
  const [state, setState] = useState<OrbitPresence>(INITIAL);

  useEffect(() => {
    const target = document.getElementById(targetId);

    return target !== null && target !== undefined
      ? subscribeOrbitPresence(target, setState)
      : undefined;
  }, [targetId]);

  return state;
}
