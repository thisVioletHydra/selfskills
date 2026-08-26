import type { CometFlight } from '#web/shared/lib/orbit-comet';
import type { OrbitMotionMode } from '#web/shared/lib/orbit-motion-state';
import type { CSSProperties } from 'react';

import {
  cometFlightLifetimeMs,
  createCometWave,
  subscribeOrbitCometTrigger,
} from '#web/shared/lib/orbit-comet';
import { appendCapped } from '#web/shared/lib/orbit-list';
import { prefersReducedMotion } from '#web/shared/lib/orbit-rand';
import { cancel, schedule } from '#web/shared/lib/timer-kit';
import { useOrbitPresence } from '#web/widgets/orbit-hero/useOrbitPresence';
import { useCallback, useEffect, useRef, useState } from 'react';

const SPARK_COUNT = 14;
const AMBIENT_FIRST_MIN_MS = 2_000;
const AMBIENT_FIRST_MAX_MS = 7_000;
const AMBIENT_MIN_MS = 20_000;
const AMBIENT_MAX_MS = 30_000;
const MAX_FLIGHTS = 6;
const COMET_AMBIENT_ID = 'comet-ambient';

const SPARK_TONES = [
  'rgba(255, 255, 255, 0.95)',
  'rgba(210, 230, 255, 0.9)',
  'rgba(255, 248, 230, 0.85)',
  'rgba(190, 215, 255, 0.75)',
  'rgba(255, 255, 255, 0.7)',
];

function cometLifeId(flightId: number) {
  return `comet-life-${flightId}`;
}

type OrbitCometProps = {
  flight: CometFlight;
  onDone: (id: number) => void;
  frozen: boolean;
};

function OrbitComet({ flight, onDone, frozen }: OrbitCometProps) {
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) {
      return;
    }

    doneRef.current = true;
    cancel(cometLifeId(flight.id));
    onDone(flight.id);
  }, [flight.id, onDone]);

  useEffect(() => {
    if (frozen) {
      cancel(cometLifeId(flight.id));

      return;
    }

    schedule({
      id: cometLifeId(flight.id),
      ms: cometFlightLifetimeMs(flight),
      onFire: finish,
    });

    return () => {
      cancel(cometLifeId(flight.id));
    };
  }, [flight, finish, frozen]);

  const style = {
    '--comet-top': `${flight.top}%`,
    '--comet-left': `${flight.left}%`,
    '--comet-rot': `${flight.angle}deg`,
    '--comet-travel': flight.travel,
    '--comet-duration': `${flight.duration}s`,
    '--comet-delay': `${flight.delay}s`,
  } as CSSProperties;

  return (
    <div
      className="comet"
      style={style}
      onAnimationEnd={(event) => {
        if (frozen) {
          return;
        }

        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.animationName === 'comet-fly') {
          finish();
        }
      }}
    >
      <span className="comet-head" />
      {Array.from({ length: SPARK_COUNT }, (_, index) => {
        const side = index % 2 === 0 ? 1 : -1;
        const sparkStyle = {
          '--i': index,
          '--tone': SPARK_TONES[index % SPARK_TONES.length],
          '--drift-y': `${side * (0.4 + (index % 4) * 0.55)}px`,
          '--drift-x': `${22 + index * 4.2}px`,
          '--size': `${1 + (index % 3) * 0.55}px`,
          '--spin': `${side * (35 + index * 14)}deg`,
          '--delay': `${(index * 0.04) % 0.5}s`,
        } as CSSProperties;

        return (
          <span
            key={index}
            className={`spark${index % 3 === 0 ? ' chip' : ''}`}
            style={sparkStyle}
          />
        );
      })}
    </div>
  );
}

type OrbitCometsProps = {
  motionMode: OrbitMotionMode;
};

function OrbitCometsAmbient({ motionMode }: OrbitCometsProps) {
  const { inView, pageVisible } = useOrbitPresence('hero');
  const [flights, setFlights] = useState<CometFlight[]>([]);
  const reduced = prefersReducedMotion();
  const frozen = motionMode === 'paused' || reduced;
  const canSpawn = !frozen && inView && pageVisible;

  const removeFlight = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  }, []);

  const appendWave = useCallback((wave: CometFlight[]) => {
    setFlights((current) => appendCapped(current, wave, MAX_FLIGHTS));
  }, []);

  useEffect(() => {
    return subscribeOrbitCometTrigger(() => {
      appendWave(createCometWave());
    });
  }, [appendWave]);

  useEffect(() => {
    if (!canSpawn) {
      cancel(COMET_AMBIENT_ID);

      return;
    }

    schedule({
      id: COMET_AMBIENT_ID,
      firstMinMs: AMBIENT_FIRST_MIN_MS,
      firstMaxMs: AMBIENT_FIRST_MAX_MS,
      minMs: AMBIENT_MIN_MS,
      maxMs: AMBIENT_MAX_MS,
      onFire: () => {
        appendWave(createCometWave());
      },
    });

    return () => {
      cancel(COMET_AMBIENT_ID);
    };
  }, [appendWave, canSpawn]);

  return (
    <>
      {flights.map((flight) => (
        <OrbitComet key={flight.id} flight={flight} frozen={frozen} onDone={removeFlight} />
      ))}
    </>
  );
}

export function OrbitComets({ motionMode }: OrbitCometsProps) {
  return <OrbitCometsAmbient motionMode={motionMode} />;
}
