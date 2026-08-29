import { clampThrowSpeed, MAX_THROW_SPEED, MIN_THROW_SPEED } from '#web/widgets/cosmos/physics/throw-constants';

export type PointSample = {
  pointX: number;
  pointY: number;
  t: number;
};

const FLICK_LOOKBACK_MS = 100;
const RELEASE_TAIL_MS = 50;
const SAMPLE_KEEP_MS = 150;
const TAP_THRESHOLD_PX = 10;
const TAIL_STILLNESS_PX = 9;
const GENTLE_RELEASE_RAW_SPEED = 42;
const THROW_CURVE = 0.9;
const RAW_SPEED_SOFT = 40;
const RAW_SPEED_HARD = 900;

export { TAP_THRESHOLD_PX };

export function trimSamples(samples: PointSample[], now: number) {
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

function peakSegmentVelocity(samples: PointSample[], windowStart: number) {
  let bestVelocityX = 0;
  let bestVelocityY = 0;
  let bestSpeed = 0;

  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1];
    const next = samples[i];

    if (next.t < windowStart) {
      continue;
    }

    const dt = (next.t - prev.t) / 1000;
    if (dt < 0.001) {
      continue;
    }

    const velocityX = (next.pointX - prev.pointX) / dt;
    const velocityY = (next.pointY - prev.pointY) / dt;
    const speed = Math.hypot(velocityX, velocityY);

    if (speed > bestSpeed) {
      bestSpeed = speed;
      bestVelocityX = velocityX;
      bestVelocityY = velocityY;
    }
  }

  return { velocityX: bestVelocityX, velocityY: bestVelocityY, rawSpeed: bestSpeed };
}

export function computeFlickVelocity(samples: PointSample[]) {
  if (samples.length < 2) {
    return { velocityX: 0, velocityY: 0, rawSpeed: 0 };
  }

  const end = samples[samples.length - 1];
  const windowStart = end.t - FLICK_LOOKBACK_MS;
  const anchor = sampleAtOrBefore(samples, windowStart);
  const lookbackDt = (end.t - anchor.t) / 1000;

  let lookbackVelocityX = 0;
  let lookbackVelocityY = 0;
  let lookbackSpeed = 0;

  if (lookbackDt >= 0.016) {
    lookbackVelocityX = (end.pointX - anchor.pointX) / lookbackDt;
    lookbackVelocityY = (end.pointY - anchor.pointY) / lookbackDt;
    lookbackSpeed = Math.hypot(lookbackVelocityX, lookbackVelocityY);
  }

  const peak = peakSegmentVelocity(samples, windowStart);

  if (lookbackSpeed >= peak.rawSpeed) {
    return { velocityX: lookbackVelocityX, velocityY: lookbackVelocityY, rawSpeed: lookbackSpeed };
  }

  return peak;
}

function mapThrowSpeed(rawSpeed: number) {
  const t = Math.min(
    1,
    Math.max(0, (rawSpeed - RAW_SPEED_SOFT) / (RAW_SPEED_HARD - RAW_SPEED_SOFT)),
  );

  return MIN_THROW_SPEED + Math.pow(t, THROW_CURVE) * (MAX_THROW_SPEED - MIN_THROW_SPEED);
}

export function computeReleaseVelocity(samples: PointSample[], dragStart: { pointX: number; pointY: number }) {
  const flick = computeFlickVelocity(samples);
  const end = samples[samples.length - 1];
  const dragDeltaX = end.pointX - dragStart.pointX;
  const dragDeltaY = end.pointY - dragStart.pointY;
  const dragDist = Math.hypot(dragDeltaX, dragDeltaY);

  if (dragDist <= TAP_THRESHOLD_PX) {
    return { velocityX: 0, velocityY: 0 };
  }

  const tailStart = end.t - RELEASE_TAIL_MS;
  const tailAnchor = samples.find((sample) => sample.t >= tailStart) ?? samples[0];
  const tailDist = Math.hypot(end.pointX - tailAnchor.pointX, end.pointY - tailAnchor.pointY);
  const quietTail = tailDist < TAIL_STILLNESS_PX;
  const lowPeak = flick.rawSpeed < GENTLE_RELEASE_RAW_SPEED;
  const isGentleRelease = quietTail && lowPeak;

  if (isGentleRelease || flick.rawSpeed <= 0) {
    return { velocityX: 0, velocityY: 0 };
  }

  const releaseSpeed = Math.min(MAX_THROW_SPEED, mapThrowSpeed(flick.rawSpeed));
  const dirLen = Math.hypot(flick.velocityX, flick.velocityY);

  if (dirLen <= 0.001) {
    return { velocityX: 0, velocityY: 0 };
  }

  return clampThrowSpeed((flick.velocityX / dirLen) * releaseSpeed, (flick.velocityY / dirLen) * releaseSpeed);
}
