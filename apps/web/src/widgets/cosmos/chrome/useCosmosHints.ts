import type { CosmosHintState } from '#web/widgets/cosmos/lib/hint-state';

import { readCosmosHintState, writeCosmosHintState } from '#web/widgets/cosmos/lib/hint-state';
import { useCallback, useState } from 'react';

/** Tease-анимация один раз; подписи tap/pull на планетах всегда видны. */
export function useCosmosHints() {
  const [hintState, setHintState] = useState<CosmosHintState>(readCosmosHintState);

  const markTeaseDone = useCallback(() => {
    if (hintState.teaseDone) {
      return;
    }

    writeCosmosHintState({ teaseDone: true });
    setHintState((current) => ({ ...current, teaseDone: true }));
  }, [hintState.teaseDone]);

  return {
    teaseActive: !hintState.teaseDone,
    markTeaseDone,
  };
}
