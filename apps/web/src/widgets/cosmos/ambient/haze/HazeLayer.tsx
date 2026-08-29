import type { AmbientContext } from '#web/widgets/cosmos/ambient/types';
import type { HazeGeneration } from '#web/widgets/cosmos/ambient/haze/create-haze';
import type { CSSProperties } from 'react';

import { useAmbientScheduler } from '#web/widgets/cosmos/ambient/useAmbientScheduler';
import { HAZE_CONFIG } from '#web/widgets/cosmos/ambient/haze/haze.config';
import {
  createHazeGeneration,
  hazeLifeId,
  rollHazeCount,
} from '#web/widgets/cosmos/ambient/haze/create-haze';
import { canRunAmbient } from '#web/widgets/cosmos/guards/ambient-gate';
import { isMotionFrozen } from '#web/widgets/cosmos/guards/motion-freeze';
import { appendCapped } from '#web/widgets/cosmos/lib/list';
import { prefersReducedMotion } from '#web/widgets/cosmos/lib/rand';
import { cancel, cancelAll, hasTimer, schedule } from '#web/widgets/cosmos/lib/timer-kit';
import { useCosmosPresence } from '#web/widgets/cosmos/lib/useCosmosPresence';
import { useCallback, useEffect, useRef, useState } from 'react';

export function HazeLayer({ motionMode }: AmbientContext) {
  const { inView, pageVisible } = useCosmosPresence();
  const [generations, setGenerations] = useState<HazeGeneration[]>(() => [
    createHazeGeneration(prefersReducedMotion() ? 1 : rollHazeCount()),
  ]);
  const generationsRef = useRef(generations);
  const frozen = isMotionFrozen(motionMode);
  const enabled = canRunAmbient({ frozen, inView, pageVisible });

  useEffect(() => {
    generationsRef.current = generations;
  }, [generations]);

  const clearLifeTimers = useCallback(() => {
    cancelAll(HAZE_CONFIG.lifePrefix);
  }, []);

  const armRemoveTimer = useCallback((generation: HazeGeneration) => {
    schedule({
      id: hazeLifeId(generation.id),
      ms: generation.lifeMs,
      onFire: () => {
        setGenerations((current) => current.filter((item) => item.id !== generation.id));
      },
    });
  }, []);

  const pushGeneration = useCallback(
    (generation: HazeGeneration, armTimer: boolean) => {
      setGenerations((current) => {
        const next = appendCapped(current, [generation], HAZE_CONFIG.maxGenerations);
        const kept = new Set(next.map((item) => item.id));

        for (const item of current) {
          if (!kept.has(item.id)) {
            cancel(hazeLifeId(item.id));
          }
        }

        return next;
      });

      if (armTimer) {
        armRemoveTimer(generation);
      }
    },
    [armRemoveTimer],
  );

  useEffect(() => {
    if (frozen) {
      clearLifeTimers();

      return;
    }

    for (const generation of generationsRef.current) {
      if (!hasTimer(hazeLifeId(generation.id))) {
        armRemoveTimer(generation);
      }
    }

    return () => clearLifeTimers();
  }, [armRemoveTimer, clearLifeTimers, frozen]);

  useAmbientScheduler({
    enabled,
    timerId: HAZE_CONFIG.spawnId,
    everyMs: HAZE_CONFIG.rollIntervalMs,
    onTick: () => {
      if (generationsRef.current.length === 0) {
        pushGeneration(createHazeGeneration(rollHazeCount()), true);

        return;
      }

      pushGeneration(createHazeGeneration(rollHazeCount()), true);
    },
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (generationsRef.current.length === 0) {
      pushGeneration(createHazeGeneration(rollHazeCount()), true);
    }
  }, [enabled, pushGeneration]);

  useEffect(() => () => clearLifeTimers(), [clearLifeTimers]);

  return (
    <div className="haze-layer" aria-hidden="true">
      {generations.flatMap((generation) =>
        generation.blobs.map((blob) => {
          const style = {
            '--haze-w': `${blob.width}vw`,
            '--haze-h': `${blob.height}vw`,
            '--haze-left': `${blob.left}%`,
            '--haze-top': `${blob.top}%`,
            '--haze-rot': `${blob.rotate}deg`,
            '--haze-opacity': blob.opacity,
            '--haze-color': HAZE_CONFIG.tones[blob.tone],
            '--haze-clip': blob.clip,
            '--haze-duration': `${blob.duration}s`,
          } as CSSProperties;

          return (
            <span key={blob.id} className="haze" style={style}>
              <span className="haze-core" />
              {blob.lobes.map((lobe) => {
                const lobeStyle = {
                  '--lobe-x': `${lobe.offsetX}%`,
                  '--lobe-y': `${lobe.offsetY}%`,
                  '--lobe-sx': lobe.scaleX,
                  '--lobe-sy': lobe.scaleY,
                  '--lobe-radius': lobe.radius,
                  '--lobe-opacity': lobe.opacityScale,
                } as CSSProperties;

                return <span key={lobe.key} className="haze-lobe" style={lobeStyle} />;
              })}
            </span>
          );
        }),
      )}
    </div>
  );
}
