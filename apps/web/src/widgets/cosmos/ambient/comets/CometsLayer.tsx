import type { AmbientContext } from '#web/widgets/cosmos/ambient/types';
import type { CometFlight } from '#web/widgets/cosmos/ambient/comets/create-comet';
import type { CSSProperties } from 'react';

import { useAmbientScheduler } from '#web/widgets/cosmos/ambient/useAmbientScheduler';
import { COMETS_CONFIG } from '#web/widgets/cosmos/ambient/comets/comets.config';
import {
  cometFlightLifetimeMs,
  createCometWave,
} from '#web/widgets/cosmos/ambient/comets/create-comet';
import { canRunAmbient } from '#web/widgets/cosmos/guards/ambient-gate';
import { isMotionFrozen } from '#web/widgets/cosmos/guards/motion-freeze';
import { createOnceLatch } from '#web/widgets/cosmos/guards/once-latch';
import { appendCapped } from '#web/widgets/cosmos/lib/list';
import { cancel, schedule } from '#web/widgets/cosmos/lib/timer-kit';
import { useCosmosPresence } from '#web/widgets/cosmos/lib/useCosmosPresence';
import { useCallback, useEffect, useRef, useState } from 'react';

function cometLifeId(flightId: number) {
  return `comet-life-${flightId}`;
}

type CometProps = {
  flight: CometFlight;
  onDone: (id: number) => void;
  frozen: boolean;
  sparkCount: number;
};

function Comet({ flight, onDone, frozen, sparkCount }: CometProps) {
  const latchRef = useRef(createOnceLatch());

  const finish = useCallback(() => {
    latchRef.current.run(() => {
      cancel(cometLifeId(flight.id));
      onDone(flight.id);
    });
  }, [flight.id, onDone]);

  useEffect(() => {
    latchRef.current.reset();
  }, [flight.id]);

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
      {Array.from({ length: sparkCount }, (_, index) => {
        const side = index % 2 === 0 ? 1 : -1;
        const sparkStyle = {
          '--i': index,
          '--tone': COMETS_CONFIG.sparkTones[index % COMETS_CONFIG.sparkTones.length],
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

export function CometsLayer({ motionMode }: AmbientContext) {
  const { inView, pageVisible } = useCosmosPresence();
  const [flights, setFlights] = useState<CometFlight[]>([]);
  const [compact, setCompact] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(width < 768px)').matches,
  );
  const frozen = isMotionFrozen(motionMode);
  const enabled = canRunAmbient({ frozen, inView, pageVisible });
  const maxFlights = compact ? COMETS_CONFIG.maxFlightsCompact : COMETS_CONFIG.maxFlights;
  const sparkCount = compact ? COMETS_CONFIG.sparkCountCompact : COMETS_CONFIG.sparkCount;
  const nextDelay = compact ? COMETS_CONFIG.nextDelayCompact : COMETS_CONFIG.nextDelay;

  useEffect(() => {
    const media = window.matchMedia('(width < 768px)');
    const sync = () => {
      setCompact(media.matches);
    };

    sync();
    media.addEventListener('change', sync);

    return () => {
      media.removeEventListener('change', sync);
    };
  }, []);

  const removeFlight = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  }, []);

  const appendWave = useCallback(
    (wave: CometFlight[]) => {
      setFlights((current) => appendCapped(current, wave, maxFlights));
    },
    [maxFlights],
  );

  useAmbientScheduler({
    enabled,
    timerId: COMETS_CONFIG.ambientId,
    firstDelay: COMETS_CONFIG.firstDelay,
    nextDelay,
    onTick: () => {
      appendWave(createCometWave());
    },
  });

  return (
    <>
      {flights.map((flight) => (
        <Comet
          key={flight.id}
          flight={flight}
          frozen={frozen}
          sparkCount={sparkCount}
          onDone={removeFlight}
        />
      ))}
    </>
  );
}
