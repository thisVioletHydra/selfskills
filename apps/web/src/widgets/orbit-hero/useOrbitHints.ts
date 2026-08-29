import type { OrbitHintState } from '#web/shared/lib/orbit-hint-state';

import {
  readOrbitHintState,
  subscribeOrbitHintReset,
  writeOrbitHintState,
} from '#web/shared/lib/orbit-hint-state';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type OrbitHintKey = 'tapDismissed' | 'throwDismissed';

export type OrbitHintItem = {
  key: OrbitHintKey;
  text: string;
  mark: string;
  markClass: string;
  visible: boolean;
  hiding: boolean;
};

type Translate = (key: 'hintTap' | 'hintThrow') => string;

type HidingMap = Record<OrbitHintKey, boolean>;

const INITIAL_HIDING: HidingMap = {
  tapDismissed: false,
  throwDismissed: false,
};

function buildHintCopy(t: Translate): Omit<OrbitHintItem, 'visible' | 'hiding'>[] {
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

export function useOrbitHints(t: Translate) {
  const [hintState, setHintState] = useState<OrbitHintState>(readOrbitHintState);
  const [hiding, setHiding] = useState<HidingMap>(INITIAL_HIDING);
  const hintCopy = useMemo(() => buildHintCopy(t), [t]);

  useEffect(() => {
    return subscribeOrbitHintReset(() => {
      setHintState(readOrbitHintState());
      setHiding(INITIAL_HIDING);
    });
  }, []);

  const markTeaseDone = useCallback(() => {
    if (hintState.teaseDone) {
      return;
    }

    writeOrbitHintState({ teaseDone: true });
    setHintState((current) => ({ ...current, teaseDone: true }));
  }, [hintState.teaseDone]);

  const dismiss = useCallback(
    (key: OrbitHintKey) => {
      if (hintState[key] || hiding[key]) {
        return;
      }

      setHiding((current) => ({ ...current, [key]: true }));
    },
    [hintState, hiding],
  );

  const finishHide = useCallback((key: OrbitHintKey) => {
    writeOrbitHintState({ [key]: true });
    setHintState((current) => ({ ...current, [key]: true }));
    setHiding((current) => ({ ...current, [key]: false }));
  }, []);

  const hints: OrbitHintItem[] = hintCopy.map((item) => ({
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
