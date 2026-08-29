import type { CosmosHintState } from '#web/widgets/cosmos/lib/hint-state';

import {
  readCosmosHintState,
  subscribeCosmosHintReset,
  writeCosmosHintState,
} from '#web/widgets/cosmos/lib/hint-state';
import { useCallback, useEffect, useState } from 'react';

export type CosmosHintKey = 'tapDismissed' | 'throwDismissed';

type HidingMap = Record<CosmosHintKey, boolean>;

const INITIAL_HIDING: HidingMap = {
  tapDismissed: false,
  throwDismissed: false,
};

/** Planet-local hints only — top bar shows build sha instead of tip chips. */
export function useCosmosHints() {
  const [hintState, setHintState] = useState<CosmosHintState>(readCosmosHintState);
  const [hiding, setHiding] = useState<HidingMap>(INITIAL_HIDING);

  useEffect(() => {
    return subscribeCosmosHintReset(() => {
      setHintState(readCosmosHintState());
      setHiding(INITIAL_HIDING);
    });
  }, []);

  const markTeaseDone = useCallback(() => {
    if (hintState.teaseDone) {
      return;
    }

    writeCosmosHintState({ teaseDone: true });
    setHintState((current) => ({ ...current, teaseDone: true }));
  }, [hintState.teaseDone]);

  const dismiss = useCallback(
    (key: CosmosHintKey) => {
      if (hintState[key] || hiding[key]) {
        return;
      }

      setHiding((current) => ({ ...current, [key]: true }));
      writeCosmosHintState({ [key]: true });
      setHintState((current) => ({ ...current, [key]: true }));
      setHiding((current) => ({ ...current, [key]: false }));
    },
    [hintState, hiding],
  );

  return {
    teaseActive: !hintState.teaseDone,
    showTapPlanetHint: !hintState.tapDismissed,
    showThrowPlanetHint: !hintState.throwDismissed,
    markTeaseDone,
    dismissTapHint: () => dismiss('tapDismissed'),
    dismissThrowHint: () => dismiss('throwDismissed'),
  };
}
