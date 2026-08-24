import { useCallback, useEffect, useState } from 'react';
import {
  readOrbitHintState,
  subscribeOrbitHintReset,
  writeOrbitHintState,
  type OrbitHintState,
} from '#app/shared/lib/orbit-hint-state';

export function useOrbitHints() {
  const [hintState, setHintState] = useState<OrbitHintState>(readOrbitHintState);
  const [tapHiding, setTapHiding] = useState(false);
  const [throwHiding, setThrowHiding] = useState(false);

  useEffect(() => {
    return subscribeOrbitHintReset(() => {
      setHintState(readOrbitHintState());
      setTapHiding(false);
      setThrowHiding(false);
    });
  }, []);

  const markTeaseDone = useCallback(() => {
    if (hintState.teaseDone) {
      return;
    }

    writeOrbitHintState({ teaseDone: true });
    setHintState((current) => ({ ...current, teaseDone: true }));
  }, [hintState.teaseDone]);

  const dismissTapHint = useCallback(() => {
    if (hintState.tapDismissed || tapHiding) {
      return;
    }

    setTapHiding(true);
  }, [hintState.tapDismissed, tapHiding]);

  const dismissThrowHint = useCallback(() => {
    if (hintState.throwDismissed || throwHiding) {
      return;
    }

    setThrowHiding(true);
  }, [hintState.throwDismissed, throwHiding]);

  const finishTapHintHide = useCallback(() => {
    writeOrbitHintState({ tapDismissed: true });
    setHintState((current) => ({ ...current, tapDismissed: true }));
    setTapHiding(false);
  }, []);

  const finishThrowHintHide = useCallback(() => {
    writeOrbitHintState({ throwDismissed: true });
    setHintState((current) => ({ ...current, throwDismissed: true }));
    setThrowHiding(false);
  }, []);

  return {
    showTapHint: !hintState.tapDismissed,
    showThrowHint: !hintState.throwDismissed,
    teaseActive: !hintState.teaseDone,
    tapHiding,
    throwHiding,
    dismissTapHint,
    dismissThrowHint,
    finishTapHintHide,
    finishThrowHintHide,
    markTeaseDone,
  };
}
