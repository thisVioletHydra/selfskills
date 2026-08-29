import type { CosmosHintState } from '#web/widgets/cosmos/lib/hint-state';

import {
  readCosmosHintState,
  subscribeCosmosHintReset,
  writeCosmosHintState,
} from '#web/widgets/cosmos/lib/hint-state';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type CosmosHintKey = 'tapDismissed' | 'throwDismissed';

export type CosmosHintItem = {
  key: CosmosHintKey;
  text: string;
  mark: string;
  markClass: string;
  visible: boolean;
  hiding: boolean;
};

type Translate = (key: 'hintTap' | 'hintThrow') => string;

type HidingMap = Record<CosmosHintKey, boolean>;

const INITIAL_HIDING: HidingMap = {
  tapDismissed: false,
  throwDismissed: false,
};

function buildHintCopy(t: Translate): Omit<CosmosHintItem, 'visible' | 'hiding'>[] {
  return [
    {
      key: 'tapDismissed',
      text: t('hintTap'),
      mark: '◎',
      markClass: 'mark',
    },
    {
      key: 'throwDismissed',
      text: t('hintThrow'),
      mark: '↗',
      markClass: 'mark throw',
    },
  ];
}

export function useCosmosHints(t: Translate) {
  const [hintState, setHintState] = useState<CosmosHintState>(readCosmosHintState);
  const [hiding, setHiding] = useState<HidingMap>(INITIAL_HIDING);
  const hintCopy = useMemo(() => buildHintCopy(t), [t]);

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
    },
    [hintState, hiding],
  );

  const finishHide = useCallback((key: CosmosHintKey) => {
    writeCosmosHintState({ [key]: true });
    setHintState((current) => ({ ...current, [key]: true }));
    setHiding((current) => ({ ...current, [key]: false }));
  }, []);

  const hints: CosmosHintItem[] = hintCopy.map((item) => ({
    ...item,
    visible: !hintState[item.key],
    hiding: hiding[item.key],
  }));

  return {
    hints,
    teaseActive: !hintState.teaseDone,
    dismiss,
    finishHide,
    markTeaseDone,
    dismissTapHint: () => dismiss('tapDismissed'),
    dismissThrowHint: () => dismiss('throwDismissed'),
  };
}
