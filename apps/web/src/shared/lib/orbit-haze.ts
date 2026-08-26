import type { KarmicCount } from '#app/shared/lib/karmic-dice';

import { rollKarmicDice } from '#app/shared/lib/karmic-dice';
import { subscribeWindowEvent } from '#app/shared/lib/subscribe-window-event';

export type HazeCount = KarmicCount;
export type OrbitHazeForceDetail = {
  count: HazeCount;
};

export const ORBIT_HAZE_FORCE_EVENT = 'orbit-haze-force';

function isHazeCount(value: unknown): value is HazeCount {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

export function forceOrbitHaze(count: HazeCount) {
  window.dispatchEvent(
    new CustomEvent<OrbitHazeForceDetail>(ORBIT_HAZE_FORCE_EVENT, {
      detail: { count },
    }),
  );
}

export function subscribeOrbitHazeForce(listener: (count: HazeCount) => void) {
  return subscribeWindowEvent(ORBIT_HAZE_FORCE_EVENT, (event) => {
    const detail = (event as CustomEvent<OrbitHazeForceDetail>).detail;
    if (isHazeCount(detail?.count)) {
      listener(detail.count);
    }
  });
}

export function rollHazeCount(): HazeCount {
  return rollKarmicDice(4);
}
