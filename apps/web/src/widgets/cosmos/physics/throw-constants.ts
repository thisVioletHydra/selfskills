/** Shared throw ceiling — bounce clamp and flick map use the same cap. */
export const MAX_THROW_SPEED = 520;
export const MIN_THROW_SPEED = 30;

export function clampThrowSpeed(velocityX: number, velocityY: number) {
  const speed = Math.hypot(velocityX, velocityY);
  if (speed <= MAX_THROW_SPEED || speed === 0) {
    return { velocityX, velocityY };
  }

  const scale = MAX_THROW_SPEED / speed;

  return { velocityX: velocityX * scale, velocityY: velocityY * scale };
}
