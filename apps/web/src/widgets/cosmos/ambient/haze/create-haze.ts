import type { KarmicCount } from '#web/widgets/cosmos/lib/karmic-dice';

import { HAZE_CONFIG, type HazeTone } from '#web/widgets/cosmos/ambient/haze/haze.config';
import { rollKarmicDice } from '#web/widgets/cosmos/lib/karmic-dice';
import { rand } from '#web/widgets/cosmos/lib/rand';

export type HazeCount = KarmicCount;

export type HazeLobe = {
  key: string;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  radius: string;
  opacityScale: number;
};

export type HazeBlob = {
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
};

export type HazeGeneration = {
  id: number;
  blobs: HazeBlob[];
  lifeMs: number;
};

const TONE_POOL = Object.keys(HAZE_CONFIG.tones) as HazeTone[];

let hazeSeq = 0;
let generationSeq = 0;

export function hazeLifeId(generationId: number) {
  return `${HAZE_CONFIG.lifePrefix}${generationId}`;
}

export function rollHazeCount(): HazeCount {
  return rollKarmicDice(4);
}

function pickTone(): HazeTone {
  return TONE_POOL[Math.floor(Math.random() * TONE_POOL.length)];
}

function pickHazePoint() {
  const { sunX, sunY, centerRadius } = HAZE_CONFIG;

  for (let attempt = 0; attempt < 14; attempt++) {
    const left = rand(-20, 118);
    const top = rand(-8, 92);
    const dx = left - sunX;
    const dy = top - sunY;
    const inCenter = dx * dx + dy * dy < centerRadius * centerRadius;

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

function createBlob(duration: number): HazeBlob {
  hazeSeq += 1;
  const width = rand(38, 56);
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
    opacity: rand(0.26, 0.4),
    clip: makePuddleClip(),
    lobes: makeLobes(hazeSeq),
    duration,
  };
}

export function createHazeGeneration(count: HazeCount): HazeGeneration {
  generationSeq += 1;
  const duration = rand(18, 22);

  return {
    id: generationSeq,
    lifeMs: duration * 1000,
    blobs: Array.from({ length: count }, () => createBlob(duration)),
  };
}
