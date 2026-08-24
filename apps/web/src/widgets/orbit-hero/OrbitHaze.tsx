import type { HazeCount } from "#app/shared/lib/orbit-haze";
import type { OrbitMotionMode } from "#app/shared/lib/orbit-motion-state";
import type { CSSProperties } from "react";

import { rollHazeCount, subscribeOrbitHazeForce } from "#app/shared/lib/orbit-haze";
import { useOrbitAmbientActive } from "#app/widgets/orbit-hero/useOrbitAmbientActive";
import { useCallback, useEffect, useRef, useState } from "react";

type HazeTone = "cold" | "warm" | "white";

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

const ROLL_INTERVAL_MS = 14_000;
const MAX_GENERATIONS = 2;
const TONE_POOL: HazeTone[] = ["cold", "warm", "white"];
const SUN_X = 50;
const SUN_Y = 42;
const CENTER_RADIUS = 22;

const TONES: Record<HazeTone, string> = {
  cold: "rgba(80, 125, 195, 0.62)",
  warm: "rgba(155, 105, 58, 0.58)",
  white: "rgba(230, 236, 255, 0.48)",
};

let hazeSeq = 0;
let generationSeq = 0;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickTone(): HazeTone {
  return TONE_POOL[Math.floor(Math.random() * TONE_POOL.length)];
}

function pickHazePoint() {
  for (let attempt = 0; attempt < 14; attempt++) {
    const left = rand(-20, 118);
    const top = rand(-18, 116);
    const dx = left - SUN_X;
    const dy = top - SUN_Y;
    const inCenter = dx * dx + dy * dy < CENTER_RADIUS * CENTER_RADIUS;

    if (!inCenter || Math.random() < 1 / 3) {
      return { left, top };
    }
  }

  return {
    left: Math.random() > 0.5 ? rand(-20, 8) : rand(92, 118),
    top: Math.random() > 0.5 ? rand(-18, 12) : rand(88, 116),
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

  return `polygon(${points.join(", ")})`;
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
  const duration = debug ? 10 : rand(24, 28);

  return {
    id: generationSeq,
    lifeMs: duration * 1000,
    blobs: Array.from({ length: count }, () => createBlob(duration, debug)),
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type OrbitHazeProps = {
  motionMode: OrbitMotionMode;
};

export function OrbitHaze({ motionMode }: OrbitHazeProps) {
  const ambientActive = useOrbitAmbientActive(motionMode);
  const ambientActiveRef = useRef(ambientActive);
  const [seed] = useState(() => createGeneration(prefersReducedMotion() ? 1 : rollHazeCount()));
  const [generations, setGenerations] = useState<HazeGeneration[]>(() => [seed]);
  const removeTimersRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    ambientActiveRef.current = ambientActive;
  }, [ambientActive]);

  const clearTimers = useCallback(() => {
    for (const timer of removeTimersRef.current.values()) {
      window.clearTimeout(timer);
    }
    removeTimersRef.current.clear();
  }, []);

  const pushGeneration = useCallback((generation: HazeGeneration) => {
    if (!ambientActiveRef.current) {
      return;
    }

    setGenerations((current) => {
      const next = [...current, generation];

      return next.length > MAX_GENERATIONS ? next.slice(-MAX_GENERATIONS) : next;
    });

    const timer = window.setTimeout(() => {
      setGenerations((current) => current.filter((item) => item.id !== generation.id));
      removeTimersRef.current.delete(generation.id);
    }, generation.lifeMs);

    removeTimersRef.current.set(generation.id, timer);
  }, []);

  const clearGenerations = useCallback(() => {
    clearTimers();
    setGenerations([]);
  }, [clearTimers]);

  useEffect(() => {
    if (!ambientActive) {
      clearGenerations();

      return;
    }

    setGenerations((current) => (current.length > 0 ? current : [seed]));
  }, [ambientActive, clearGenerations, seed]);

  useEffect(() => {
    return subscribeOrbitHazeForce((count) => {
      clearGenerations();
      pushGeneration(createGeneration(count, true));
    });
  }, [clearGenerations, pushGeneration]);

  useEffect(() => {
    if (!ambientActive || prefersReducedMotion()) {
      return;
    }

    const timers = removeTimersRef.current;

    const seedTimer = window.setTimeout(() => {
      setGenerations((current) => current.filter((item) => item.id !== seed.id));
      timers.delete(seed.id);
    }, seed.lifeMs);
    timers.set(seed.id, seedTimer);

    const interval = window.setInterval(() => {
      pushGeneration(createGeneration(rollHazeCount()));
    }, ROLL_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(seedTimer);
      timers.delete(seed.id);
    };
  }, [ambientActive, pushGeneration, seed]);

  return (
    <div className="haze-layer" aria-hidden="true">
      {generations.flatMap((generation) =>
        generation.blobs.map((blob) => {
          const style = {
            "--haze-w": `${blob.width}vw`,
            "--haze-h": `${blob.height}vw`,
            "--haze-left": `${blob.left}%`,
            "--haze-top": `${blob.top}%`,
            "--haze-rot": `${blob.rotate}deg`,
            "--haze-opacity": blob.opacity,
            "--haze-color": TONES[blob.tone],
            "--haze-clip": blob.clip,
            "--haze-duration": `${blob.duration}s`,
          } as CSSProperties;

          return (
            <span
              key={blob.id}
              className={`haze${blob.debug ? " debug" : ""}`}
              style={style}
            >
              <span className="haze-core" />
              {blob.lobes.map((lobe) => {
                const lobeStyle = {
                  "--lobe-x": `${lobe.offsetX}%`,
                  "--lobe-y": `${lobe.offsetY}%`,
                  "--lobe-sx": lobe.scaleX,
                  "--lobe-sy": lobe.scaleY,
                  "--lobe-radius": lobe.radius,
                  "--lobe-opacity": lobe.opacityScale,
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
