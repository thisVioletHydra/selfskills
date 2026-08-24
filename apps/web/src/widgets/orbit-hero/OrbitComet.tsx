import type { CometFlight } from "#app/shared/lib/orbit-comet";
import type { CSSProperties } from "react";

import { createCometWave, subscribeOrbitCometTrigger } from "#app/shared/lib/orbit-comet";
import { useEffect, useRef, useState } from "react";

const SPARK_COUNT = 14;
const AMBIENT_MIN_MS = 48_000;
const AMBIENT_MAX_MS = 78_000;

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
        if (event.animationName === "comet-fly") {
          onDone(flight.id);
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

export function OrbitComets() {
  const [flights, setFlights] = useState<CometFlight[]>([]);
  const ambientTimerRef = useRef(0);

  const spawnWave = () => {
    const wave = createCometWave();
    setFlights((current) => [...current, ...wave]);
  };

  const removeFlight = (id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  };

  useEffect(() => {
    return subscribeOrbitCometTrigger(() => {
      const wave = createCometWave();
      setFlights((current) => [...current, ...wave]);
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const scheduleNext = () => {
      ambientTimerRef.current = window.setTimeout(
        () => {
          spawnWave();
          scheduleNext();
        },
        rand(AMBIENT_MIN_MS, AMBIENT_MAX_MS),
      );
    };

    scheduleNext();

    return () => {
      window.clearTimeout(ambientTimerRef.current);
    };
  }, []);

  return (
    <>
      {flights.map((flight) => (
        <OrbitComet key={flight.id} flight={flight} onDone={removeFlight} />
      ))}
    </>
  );
}
