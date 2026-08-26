import type { HazeCount } from '#web/shared/lib/orbit-haze';
import type { OrbitMotionMode } from '#web/shared/lib/orbit-motion-state';
import type { CSSProperties } from 'react';

import { rollHazeCount, subscribeOrbitHazeForce } from '#web/shared/lib/orbit-haze';
import { appendCapped } from '#web/shared/lib/orbit-list';
import { prefersReducedMotion, rand } from '#web/shared/lib/orbit-rand';
import { cancel, cancelAll, hasTimer, schedule } from '#web/shared/lib/timer-kit';
import { useOrbitPresence } from '#web/widgets/orbit-hero/useOrbitPresence';
import { useCallback, useEffect, useRef, useState } from 'react';

type HazeTone = 'cold' | 'warm' | 'white';

type HazeLobe = {
  key: string;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  radius: string;
  opacityScale: number;
};

type HazeBlob = {
  id: number;
  tone: HazeTone;
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
  clip: string;
  lobes: HazeLobe[];
  duration: number;
  debug: boolean;
};

type HazeGeneration = {
  id: number;
  blobs: HazeBlob[];
  lifeMs: number;
};

const ROLL_INTERVAL_MS = 12_000;
const MAX_GENERATIONS = 2;
const HAZE_SPAWN_ID = 'haze-spawn';
const HAZE_LIFE_PREFIX = 'haze-life-';
const TONE_POOL: HazeTone[] = ['cold', 'warm', 'white'];
const SUN_X = 50;
const SUN_Y = 42;
const CENTER_RADIUS = 22;

const TONES: Record<HazeTone, string> = {
  cold: 'rgba(80, 125, 195, 0.62)',
  warm: 'rgba(155, 105, 58, 0.58)',
  white: 'rgba(230, 236, 255, 0.48)',
};

let hazeSeq = 0;
let generationSeq = 0;

function hazeLifeId(generationId: number) {
  return `${HAZE_LIFE_PREFIX}${generationId}`;
}

function pickTone(): HazeTone {
  return TONE_POOL[Math.floor(Math.random() * TONE_POOL.length)];
}

function pickHazePoint() {
  for (let attempt = 0; attempt < 14; attempt++) {
    const left = rand(-20, 118);
    const top = rand(-8, 92);
    const dx = left - SUN_X;
    const dy = top - SUN_Y;
    const inCenter = dx * dx + dy * dy < CENTER_RADIUS * CENTER_RADIUS;

    if (!inCenter || Math.random() < 1 / 3) {
      return { left, top };
    }
  }

  return {
    left: Math.random() > 0.5 ? rand(-20, 8) : rand(92, 118),
    top: Math.random() > 0.5 ? rand(-8, 18) : rand(72, 92),
  };
}

function makePuddleRadius() {
  return `${rand(18, 88)}% ${rand(12, 82)}% ${rand(20, 90)}% ${rand(15, 85)}% / ${rand(22, 88)}% ${rand(14, 80)}% ${rand(18, 92)}% ${rand(16, 84)}%`;
}

function makePuddleClip() {
  const points: string[] = [];
  const count = 7 + Math.floor(Math.random() * 4);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand(-0.18, 0.18);
    const radius = rand(28, 52);
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius * rand(0.65, 1.35);
    points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }

  return `polygon(${points.join(', ')})`;
}

function makeLobes(blobId: number): HazeLobe[] {
  const count = 2 + Math.floor(Math.random() * 2);

  return Array.from({ length: count }, (_, index) => ({
    key: `${blobId}-${index}`,
    offsetX: rand(-28, 28),
    offsetY: rand(-24, 24),
    scaleX: rand(0.45, 0.95),
    scaleY: rand(0.4, 1.05),
    radius: makePuddleRadius(),
    opacityScale: rand(0.45, 0.85),
  }));
}

function createBlob(duration: number, debug = false): HazeBlob {
  hazeSeq += 1;
  const width = debug ? rand(44, 58) : rand(38, 56);
  const height = width * rand(0.55, 1.45);
  const point = pickHazePoint();

  return {
    id: hazeSeq,
    tone: pickTone(),
    left: point.left,
    top: point.top,
    width,
    height,
    rotate: rand(-40, 40),
    opacity: debug ? rand(0.4, 0.52) : rand(0.26, 0.4),
    clip: makePuddleClip(),
    lobes: makeLobes(hazeSeq),
    duration,
    debug,
  };
}

function createGeneration(count: HazeCount, debug = false): HazeGeneration {
  generationSeq += 1;
  const duration = debug ? 10 : rand(18, 22);

  return {
    id: generationSeq,
    lifeMs: duration * 1000,
    blobs: Array.from({ length: count }, () => createBlob(duration, debug)),
  };
}

type OrbitHazeProps = {
  motionMode: OrbitMotionMode;
};

function OrbitHazeAmbient({ motionMode }: OrbitHazeProps) {
  const { inView, pageVisible } = useOrbitPresence('hero');
  const [generations, setGenerations] = useState<HazeGeneration[]>(() => [
    createGeneration(prefersReducedMotion() ? 1 : rollHazeCount()),
  ]);
  const generationsRef = useRef(generations);
  const reduced = prefersReducedMotion();
  const frozen = motionMode === 'paused' || reduced;
  const canSpawn = !frozen && inView && pageVisible;

  useEffect(() => {
    generationsRef.current = generations;
  }, [generations]);

  const clearLifeTimers = useCallback(() => {
    cancelAll(HAZE_LIFE_PREFIX);
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
        const next = appendCapped(current, [generation], MAX_GENERATIONS);
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
    return subscribeOrbitHazeForce((count) => {
      clearLifeTimers();
      const generation = createGeneration(count, true);
      setGenerations([generation]);
      if (!frozen) {
        armRemoveTimer(generation);
      }
    });
  }, [armRemoveTimer, clearLifeTimers, frozen]);

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

    return () => {
      clearLifeTimers();
    };
  }, [armRemoveTimer, clearLifeTimers, frozen]);

  useEffect(() => {
    if (!canSpawn) {
      cancel(HAZE_SPAWN_ID);

      return;
    }

    if (generationsRef.current.length === 0) {
      pushGeneration(createGeneration(rollHazeCount()), true);
    }

    schedule({
      id: HAZE_SPAWN_ID,
      everyMs: ROLL_INTERVAL_MS,
      onFire: () => {
        pushGeneration(createGeneration(rollHazeCount()), true);
      },
    });

    return () => {
      cancel(HAZE_SPAWN_ID);
    };
  }, [canSpawn, pushGeneration]);

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
            '--haze-color': TONES[blob.tone],
            '--haze-clip': blob.clip,
            '--haze-duration': `${blob.duration}s`,
          } as CSSProperties;

          return (
            <span key={blob.id} className={`haze${blob.debug ? ' debug' : ''}`} style={style}>
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

export function OrbitHaze({ motionMode }: OrbitHazeProps) {
  return <OrbitHazeAmbient motionMode={motionMode} />;
}
