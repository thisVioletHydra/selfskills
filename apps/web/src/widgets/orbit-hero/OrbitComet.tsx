import type { CometFlight } from "#app/shared/lib/orbit-comet";
import type { OrbitMotionMode } from "#app/shared/lib/orbit-motion-state";
import type { CSSProperties } from "react";

import {
  cometFlightLifetimeMs,
  createCometWave,
  subscribeOrbitCometTrigger,
} from "#app/shared/lib/orbit-comet";
import { useOrbitAmbientActive } from "#app/widgets/orbit-hero/useOrbitAmbientActive";
import { useCallback, useEffect, useRef, useState } from "react";

const SPARK_COUNT = 14;
const AMBIENT_MIN_MS = 48_000;
const AMBIENT_MAX_MS = 78_000;
const MAX_FLIGHTS = 6;

const SPARK_TONES = [
  "rgba(255, 255, 255, 0.95)",
  "rgba(210, 230, 255, 0.9)",
  "rgba(255, 248, 230, 0.85)",
  "rgba(190, 215, 255, 0.75)",
  "rgba(255, 255, 255, 0.7)",
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

type OrbitCometProps = {
  flight: CometFlight;
  onDone: (id: number) => void;
};

function OrbitComet({ flight, onDone }: OrbitCometProps) {
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) {
      return;
    }

    doneRef.current = true;
    onDone(flight.id);
  }, [flight.id, onDone]);

  useEffect(() => {
    const timer = window.setTimeout(finish, cometFlightLifetimeMs(flight));

    return () => {
      window.clearTimeout(timer);
    };
  }, [flight, finish]);

  const style = {
    "--comet-top": `${flight.top}%`,
    "--comet-left": `${flight.left}%`,
    "--comet-rot": `${flight.angle}deg`,
    "--comet-travel": flight.travel,
    "--comet-duration": `${flight.duration}s`,
    "--comet-delay": `${flight.delay}s`,
  } as CSSProperties;

  return (
    <div
      className="comet"
      style={style}
      onAnimationEnd={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.animationName === "comet-fly") {
          finish();
        }
      }}
    >
      <span className="comet-head" />
      {Array.from({ length: SPARK_COUNT }, (_, index) => {
        const side = index % 2 === 0 ? 1 : -1;
        const sparkStyle = {
          "--i": index,
          "--tone": SPARK_TONES[index % SPARK_TONES.length],
          "--drift-y": `${side * (0.4 + (index % 4) * 0.55)}px`,
          "--drift-x": `${22 + index * 4.2}px`,
          "--size": `${1 + (index % 3) * 0.55}px`,
          "--spin": `${side * (35 + index * 14)}deg`,
          "--delay": `${(index * 0.04) % 0.5}s`,
        } as CSSProperties;

        return (
          <span
            key={index}
            className={`spark${index % 3 === 0 ? " chip" : ""}`}
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

export function OrbitComets({ motionMode }: OrbitCometsProps) {
  const ambientActive = useOrbitAmbientActive(motionMode);
  const [flights, setFlights] = useState<CometFlight[]>([]);
  const ambientTimerRef = useRef(0);
  const ambientActiveRef = useRef(ambientActive);

  const removeFlight = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  }, []);

  const appendWave = useCallback((wave: CometFlight[]) => {
    if (!ambientActiveRef.current || wave.length === 0) {
      return;
    }

    setFlights((current) => {
      const next = [...current, ...wave];

      return next.length > MAX_FLIGHTS ? next.slice(-MAX_FLIGHTS) : next;
    });
  }, []);

  useEffect(() => {
    ambientActiveRef.current = ambientActive;

    if (!ambientActive) {
      setFlights([]);
    }
  }, [ambientActive]);

  useEffect(() => {
    return subscribeOrbitCometTrigger(() => {
      appendWave(createCometWave());
    });
  }, [appendWave]);

  useEffect(() => {
    if (!ambientActive || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const scheduleNext = () => {
      ambientTimerRef.current = window.setTimeout(
        () => {
          appendWave(createCometWave());
          scheduleNext();
        },
        rand(AMBIENT_MIN_MS, AMBIENT_MAX_MS),
      );
    };

    scheduleNext();

    return () => {
      window.clearTimeout(ambientTimerRef.current);
    };
  }, [ambientActive, appendWave]);

  return (
    <>
      {flights.map((flight) => (
        <OrbitComet key={flight.id} flight={flight} onDone={removeFlight} />
      ))}
    </>
  );
}
