import type { CosmosMotionMode } from '#web/widgets/cosmos/lib/motion-state';

import { prefersReducedMotion } from '#web/widgets/cosmos/lib/rand';

/**
 * Функция отвечает: космос сейчас заморожен или можно анимировать.
 * Пауза юзера и prefers-reduced-motion считаются одним «стоп» —
 * ambient и лишние таймеры не должны крутиться вхолостую.
 *
 * @param motionMode — режим сцены: auto или paused
 */
export function isMotionFrozen(motionMode: CosmosMotionMode) {
  return motionMode === 'paused' || prefersReducedMotion();
}
