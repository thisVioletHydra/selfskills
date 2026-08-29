import { clampThrowSpeed, MAX_THROW_SPEED, MIN_THROW_SPEED } from '#web/widgets/cosmos/physics/throw-constants';

export type DragPoint = {
  pointX: number;
  pointY: number;
};

type PointSample = DragPoint & {
  t: number;
};

export type DragRelease = {
  velocityX: number;
  velocityY: number;
  didDrag: boolean;
};

/** Below this drag distance counts as a tap (open modal). */
export const TAP_THRESHOLD_PX = 10;

const FLICK_LOOKBACK_MS = 100;
const RELEASE_TAIL_MS = 60;
const SAMPLE_KEEP_MS = 180;
const TAIL_STILLNESS_PX = 12;
/** Lookback speed at/below this after a drag = place (leave where released). */
const PLACE_RAW_SPEED = 95;
/** Curve: higher = slower ramp in the middle (soft ≠ hard). */
const THROW_CURVE = 1.35;
const RAW_SPEED_SOFT = 95;
const RAW_SPEED_HARD = 1600;

function trimSamples(samples: PointSample[], now: number) {
  const cutoff = now - SAMPLE_KEEP_MS;

  while (samples.length > 0 && samples[0].t < cutoff) {
    samples.shift();
  }
}

function sampleAtOrBefore(samples: PointSample[], targetT: number) {
  let chosen = samples[0];

  for (const sample of samples) {
    if (sample.t > targetT) {
      break;
    }

    chosen = sample;
  }

  return chosen;
}

/** Stable flick signal: displacement / time over lookback — ignores micro-dt spikes. */
function computeLookbackVelocity(samples: PointSample[]) {
  if (samples.length < 2) {
    return { velocityX: 0, velocityY: 0, rawSpeed: 0 };
  }

  const end = samples[samples.length - 1];
  const anchor = sampleAtOrBefore(samples, end.t - FLICK_LOOKBACK_MS);
  const lookbackDt = (end.t - anchor.t) / 1000;

  if (lookbackDt < 0.016) {
    return { velocityX: 0, velocityY: 0, rawSpeed: 0 };
  }

  const velocityX = (end.pointX - anchor.pointX) / lookbackDt;
  const velocityY = (end.pointY - anchor.pointY) / lookbackDt;

  return {
    velocityX,
    velocityY,
    rawSpeed: Math.hypot(velocityX, velocityY),
  };
}

function mapThrowSpeed(rawSpeed: number) {
  const span = RAW_SPEED_HARD - RAW_SPEED_SOFT;
  const t = Math.min(1, Math.max(0, (rawSpeed - RAW_SPEED_SOFT) / span));

  return MIN_THROW_SPEED + Math.pow(t, THROW_CURVE) * (MAX_THROW_SPEED - MIN_THROW_SPEED);
}

function isQuietTail(samples: PointSample[]) {
  if (samples.length === 0) {
    return true;
  }

  const end = samples[samples.length - 1];
  const tailStart = end.t - RELEASE_TAIL_MS;
  const tailAnchor = samples.find((sample) => sample.t >= tailStart) ?? samples[0];
  const tailDist = Math.hypot(end.pointX - tailAnchor.pointX, end.pointY - tailAnchor.pointY);

  return tailDist < TAIL_STILLNESS_PX;
}

function computeReleaseVelocity(samples: PointSample[], dragStart: DragPoint): { velocityX: number; velocityY: number } {
  if (samples.length < 2) {
    return { velocityX: 0, velocityY: 0 };
  }

  const end = samples[samples.length - 1];
  const dragDist = Math.hypot(end.pointX - dragStart.pointX, end.pointY - dragStart.pointY);

  if (dragDist <= TAP_THRESHOLD_PX) {
    return { velocityX: 0, velocityY: 0 };
  }

  const flick = computeLookbackVelocity(samples);

  // Slow drag + soft release, or weak lookback → leave the planet where it is.
  if (isQuietTail(samples) || flick.rawSpeed <= PLACE_RAW_SPEED) {
    return { velocityX: 0, velocityY: 0 };
  }

  const dirLen = Math.hypot(flick.velocityX, flick.velocityY);
  if (dirLen <= 0.001) {
    return { velocityX: 0, velocityY: 0 };
  }

  const releaseSpeed = Math.min(MAX_THROW_SPEED, mapThrowSpeed(flick.rawSpeed));

  return clampThrowSpeed(
    (flick.velocityX / dirLen) * releaseSpeed,
    (flick.velocityY / dirLen) * releaseSpeed,
  );
}

/**
 * Drag-only acceleration tracker. Lives for one pointer session;
 * ambient bounce physics is untouched until `end`/`cancel` writes velocity.
 */
export function createDragAccelerationTracker() {
  let samples: PointSample[] = [];
  let dragStart: DragPoint = { pointX: 0, pointY: 0 };
  let didDrag = false;

  const reset = () => {
    samples = [];
    dragStart = { pointX: 0, pointY: 0 };
    didDrag = false;
  };

  return {
    start(point: DragPoint) {
      didDrag = false;
      dragStart = { pointX: point.pointX, pointY: point.pointY };
      samples = [{ pointX: point.pointX, pointY: point.pointY, t: performance.now() }];
    },

    move(point: DragPoint) {
      const now = performance.now();
      samples.push({ pointX: point.pointX, pointY: point.pointY, t: now });
      trimSamples(samples, now);

      const drift = Math.hypot(point.pointX - dragStart.pointX, point.pointY - dragStart.pointY);
      if (drift > TAP_THRESHOLD_PX) {
        didDrag = true;
      }
    },

    end(): DragRelease {
      const release = didDrag
        ? computeReleaseVelocity(samples, dragStart)
        : { velocityX: 0, velocityY: 0 };
      const result: DragRelease = {
        velocityX: release.velocityX,
        velocityY: release.velocityY,
        didDrag,
      };
      reset();
      return result;
    },

    /** Same as end — apply release if there was a drag (browser scroll cancel, etc.). */
    cancel(): DragRelease {
      return this.end();
    },
  };
}

export type DragAccelerationTracker = ReturnType<typeof createDragAccelerationTracker>;
