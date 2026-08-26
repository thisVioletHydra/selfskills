import type { OrbitMotionMode } from '#app/shared/lib/orbit-motion-state';

/**
 * SHELVED — anamorphic flash. Не монтируется из OrbitHero.
 * Включить: `<OrbitFlash motionMode={motionMode} />` в OrbitHero.
 */
import { subscribeOrbitFlashTrigger } from '#app/shared/lib/orbit-flash';
import { prefersReducedMotion } from '#app/shared/lib/orbit-rand';
import { cancel, schedule } from '#app/shared/lib/timer-kit';
import { useOrbitPresence } from '#app/widgets/orbit-hero/useOrbitPresence';
import { useCallback, useEffect, useState } from 'react';

const FLASH_FIRST_MIN_MS = 45_000;
const FLASH_FIRST_MAX_MS = 90_000;
const FLASH_MIN_MS = 280_000;
const FLASH_MAX_MS = 320_000;
const FLASH_LIFE_MS = 4_000;
const FLASH_AMBIENT_ID = 'orbit-flash-ambient';

let flashSeq = 0;

type FlashBurst = {
  id: number;
};

type OrbitFlashProps = {
  motionMode: OrbitMotionMode;
};

function flashLifeId(id: number) {
  return `orbit-flash-life-${id}`;
}

export function OrbitFlash({ motionMode }: OrbitFlashProps) {
  const { inView, pageVisible } = useOrbitPresence('hero');
  const [bursts, setBursts] = useState<FlashBurst[]>([]);
  const reduced = prefersReducedMotion();
  const frozen = motionMode === 'paused' || reduced;
  const canAmbient = !frozen && inView && pageVisible;

  const removeBurst = useCallback((id: number) => {
    cancel(flashLifeId(id));
    setBursts((current) => current.filter((burst) => burst.id !== id));
  }, []);

  const spawnFlash = useCallback(() => {
    if (reduced) {
      return;
    }

    flashSeq += 1;
    const id = flashSeq;

    setBursts((current) => [...current, { id }]);

    schedule({
      id: flashLifeId(id),
      ms: FLASH_LIFE_MS,
      onFire: () => {
        removeBurst(id);
      },
    });
  }, [reduced, removeBurst]);

  useEffect(() => {
    return subscribeOrbitFlashTrigger(spawnFlash);
  }, [spawnFlash]);

  useEffect(() => {
    if (!canAmbient) {
      cancel(FLASH_AMBIENT_ID);

      return;
    }

    schedule({
      id: FLASH_AMBIENT_ID,
      firstMinMs: FLASH_FIRST_MIN_MS,
      firstMaxMs: FLASH_FIRST_MAX_MS,
      minMs: FLASH_MIN_MS,
      maxMs: FLASH_MAX_MS,
      onFire: spawnFlash,
    });

    return () => {
      cancel(FLASH_AMBIENT_ID);
    };
  }, [canAmbient, spawnFlash]);

  if (bursts.length === 0) {
    return null;
  }

  return (
    <div className="flash-layer" aria-hidden="true">
      {bursts.map((burst) => (
        <span key={burst.id} className="flash">
          <span className="flash-burst" />
          {/* один цельный луч: bloom + core line, растёт из центра */}
          <span className="flash-ray">
            <span className="flash-ray-bloom" />
            <span className="flash-ray-core" />
          </span>
        </span>
      ))}
    </div>
  );
}
