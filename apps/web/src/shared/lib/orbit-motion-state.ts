export type OrbitMotionMode = 'auto' | 'paused';

const STORAGE_KEY = 'orbit-motion-mode';
const DEFAULT_MODE: OrbitMotionMode = 'auto';

export function readOrbitMotionMode(): OrbitMotionMode {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_MODE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'auto' || raw === 'paused') {
      return raw;
    }
  } catch {
    /* ignore */
  }

  return DEFAULT_MODE;
}

export function writeOrbitMotionMode(mode: OrbitMotionMode) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, mode);
}
