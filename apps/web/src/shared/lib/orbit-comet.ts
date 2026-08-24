import { rollKarmicDice } from "#app/shared/lib/karmic-dice";

export const ORBIT_COMET_TRIGGER_EVENT = "orbit-comet-trigger";

export type CometFlight = {
  id: number;
  top: number;
  left: number;
  angle: number;
  travel: string;
  duration: number;
  delay: number;
};

let cometSeq = 0;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function rollCometCount(): 1 | 2 {
  return rollKarmicDice(2);
}

export function createCometFlight(delay = 0): CometFlight {
  cometSeq += 1;
  const side = Math.floor(Math.random() * 4);
  const duration = rand(2.6, 3.8);
  const travel = `${rand(125, 155)}vw`;

  if (side === 0) {
    return {
      id: cometSeq,
      left: rand(-10, -4),
      top: rand(6, 78),
      angle: rand(8, 42),
      travel,
      duration,
      delay,
    };
  }

  if (side === 1) {
    return {
      id: cometSeq,
      left: rand(104, 110),
      top: rand(6, 78),
      angle: rand(148, 178),
      travel,
      duration,
      delay,
    };
  }

  if (side === 2) {
    return {
      id: cometSeq,
      left: rand(8, 88),
      top: rand(-12, -4),
      angle: rand(58, 122),
      travel: `${rand(115, 145)}vh`,
      duration,
      delay,
    };
  }

  return {
    id: cometSeq,
    left: rand(8, 88),
    top: rand(104, 112),
    angle: rand(-122, -58),
    travel: `${rand(115, 145)}vh`,
    duration,
    delay,
  };
}

export function createCometWave(forcedCount?: 1 | 2): CometFlight[] {
  const count = forcedCount ?? rollCometCount();

  return Array.from({ length: count }, (_, index) =>
    createCometFlight(index === 0 ? 0 : rand(0.35, 1.1)),
  );
}

export function triggerOrbitComet() {
  window.dispatchEvent(new CustomEvent(ORBIT_COMET_TRIGGER_EVENT));
}

export function subscribeOrbitCometTrigger(listener: () => void) {
  window.addEventListener(ORBIT_COMET_TRIGGER_EVENT, listener);

  return () => window.removeEventListener(ORBIT_COMET_TRIGGER_EVENT, listener);
}
