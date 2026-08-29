import type { CosmosPresence } from '#web/widgets/cosmos/lib/presence';

import { subscribeCosmosPresence } from '#web/widgets/cosmos/lib/presence';
import { useEffect, useState } from 'react';

const INITIAL: CosmosPresence = {
  inView: true,
  pageVisible: typeof document === 'undefined' ? true : document.visibilityState === 'visible',
};

/** Cosmos stage (or any target) in viewport + tab visible. */
export function useCosmosPresence(targetId = 'cosmos') {
  const [state, setState] = useState<CosmosPresence>(INITIAL);

  useEffect(() => {
    const target = document.getElementById(targetId);

    return target !== null && target !== undefined
      ? subscribeCosmosPresence(target, setState)
      : undefined;
  }, [targetId]);

  return state;
}
