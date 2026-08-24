import type { KarmicCount } from "#app/shared/lib/karmic-dice";

import { rollKarmicDice } from "#app/shared/lib/karmic-dice";

export type HazeCount = KarmicCount;
export type OrbitHazeForceDetail = {
  count: HazeCount;
};

export const ORBIT_HAZE_FORCE_EVENT = "orbit-haze-force";

export function forceOrbitHaze(count: HazeCount) {
  window.dispatchEvent(
    new CustomEvent<OrbitHazeForceDetail>(ORBIT_HAZE_FORCE_EVENT, {
      detail: { count },
    }),
  );
}

export function subscribeOrbitHazeForce(listener: (count: HazeCount) => void) {
  const onForce = (event: Event) => {
    const detail = (event as CustomEvent<OrbitHazeForceDetail>).detail;
    if (detail?.count === 1 || detail?.count === 2 || detail?.count === 3 || detail?.count === 4) {
      listener(detail.count);
    }
  };

  window.addEventListener(ORBIT_HAZE_FORCE_EVENT, onForce);

  return () => window.removeEventListener(ORBIT_HAZE_FORCE_EVENT, onForce);
}

export function rollHazeCount(): HazeCount {
  return rollKarmicDice(4);
}
