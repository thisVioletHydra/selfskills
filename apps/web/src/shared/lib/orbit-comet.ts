import { rollKarmicDice } from '#web/shared/lib/karmic-dice';
import { rand } from '#web/shared/lib/orbit-rand';
import { subscribeWindowEvent } from '#web/shared/lib/subscribe-window-event';

export const ORBIT_COMET_TRIGGER_EVENT = 'orbit-comet-trigger';

export type CometFlight = {
  id: number;
  top: number;
  left: number;
  angle: number;
  travel: string;
  duration: number;
  delay: number;
};

type CometSide = {
  left: [number, number];
  top: [number, number];
  angle: [number, number];
  travelUnit: 'vw' | 'vh';
  travelRange: [number, number];
};

const COMET_SIDES: CometSide[] = [
  {
    left: [-10, -4],
    top: [6, 78],
    angle: [8, 42],
    travelUnit: 'vw',
    travelRange: [125, 155],
  },
  {
    left: [104, 110],
    top: [6, 78],
    angle: [148, 178],
    travelUnit: 'vw',
    travelRange: [125, 155],
  },
  {
    left: [8, 88],
    top: [-12, -4],
    angle: [58, 122],
    travelUnit: 'vh',
    travelRange: [115, 145],
  },
  {
    left: [8, 88],
    top: [104, 112],
    angle: [-122, -58],
    travelUnit: 'vh',
    travelRange: [115, 145],
  },
];

let cometSeq = 0;

export function rollCometCount(): 1 | 2 {
  return rollKarmicDice(2);
}

export function createCometFlight(delay = 0): CometFlight {
  cometSeq += 1;
  const side = COMET_SIDES[Math.floor(Math.random() * COMET_SIDES.length)];
  const duration = rand(2.6, 3.8);
  const [travelMin, travelMax] = side.travelRange;

  return {
    id: cometSeq,
    left: rand(side.left[0], side.left[1]),
    top: rand(side.top[0], side.top[1]),
    angle: rand(side.angle[0], side.angle[1]),
    travel: `${rand(travelMin, travelMax)}${side.travelUnit}`,
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

export function cometFlightLifetimeMs(flight: CometFlight) {
  return (flight.delay + flight.duration) * 1000 + 200;
}

export function triggerOrbitComet() {
  window.dispatchEvent(new CustomEvent(ORBIT_COMET_TRIGGER_EVENT));
}

export function subscribeOrbitCometTrigger(listener: () => void) {
  return subscribeWindowEvent(ORBIT_COMET_TRIGGER_EVENT, listener);
}
