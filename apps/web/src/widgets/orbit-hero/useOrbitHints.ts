import type { OrbitHintState } from '#app/shared/lib/orbit-hint-state';

import {
  readOrbitHintState,
  subscribeOrbitHintReset,
  writeOrbitHintState,
} from '#app/shared/lib/orbit-hint-state';
import { useCallback, useEffect, useState } from 'react';

export type OrbitHintKey = 'tapDismissed' | 'throwDismissed';

export type OrbitHintItem = {
  key: OrbitHintKey;
  text: string;
  mark: string;
  markClass: string;
  visible: boolean;
  hiding: boolean;
};

const HINT_COPY: Omit<OrbitHintItem, 'visible' | 'hiding'>[] = [
  {
    key: 'tapDismissed',
    text: 'Тап — карточка',
    mark: '◎',
    markClass: 'mark',
  },
  {
    key: 'throwDismissed',
    text: 'Зажми и швырни',
    mark: '↗',
    markClass: 'mark throw',
  },
];

type HidingMap = Record<OrbitHintKey, boolean>;

const INITIAL_HIDING: HidingMap = {
  tapDismissed: false,
  throwDismissed: false,
};

export function useOrbitHints() {
  const [hintState, setHintState] = useState<OrbitHintState>(readOrbitHintState);
  const [hiding, setHiding] = useState<HidingMap>(INITIAL_HIDING);

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

  const hints: OrbitHintItem[] = HINT_COPY.map((item) => ({
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
