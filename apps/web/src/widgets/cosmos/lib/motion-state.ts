export type CosmosMotionMode = 'auto' | 'paused';

const STORAGE_KEY = 'cosmos-motion-mode';

const DEFAULT_MODE: CosmosMotionMode = 'auto';

export function readCosmosMotionMode(): CosmosMotionMode {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_MODE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'auto' || raw === 'paused') {
      return raw;
    }

    // migrate old key once
    const legacy = localStorage.getItem('orbit-motion-mode');
    if (legacy === 'auto' || legacy === 'paused') {
      localStorage.setItem(STORAGE_KEY, legacy);
      return legacy;
    }
  } catch {
    /* ignore */
  }

  return DEFAULT_MODE;
}

export function writeCosmosMotionMode(mode: CosmosMotionMode) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, mode);
}
