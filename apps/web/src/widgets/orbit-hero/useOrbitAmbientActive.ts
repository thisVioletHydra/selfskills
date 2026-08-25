import type { OrbitMotionMode } from "#app/shared/lib/orbit-motion-state";

import { useOrbitPresence } from "#app/widgets/orbit-hero/useOrbitPresence";

/** Hero visible, tab active, user motion = auto */
export function useOrbitAmbientActive(motionMode: OrbitMotionMode) {
  const { inView, pageVisible } = useOrbitPresence("hero");

  return motionMode === "auto" && inView && pageVisible;
}
