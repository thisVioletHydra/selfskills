import { subscribeWindowEvent } from '#app/shared/lib/subscribe-window-event';

export type OrbitHintState = {
  tapDismissed: boolean;
  throwDismissed: boolean;
  teaseDone: boolean;
};

export const ORBIT_HINT_RESET_EVENT = 'orbit-hints-reset';

const STORAGE_KEY = 'orbit-hint-state';

const DEFAULT_STATE: OrbitHintState = {
  tapDismissed: false,
  throwDismissed: false,
  teaseDone: false,
};

export function readOrbitHintState(): OrbitHintState {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULT_STATE };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined || raw === '') {
      return { ...DEFAULT_STATE };
    }

    const parsed = JSON.parse(raw) as Partial<OrbitHintState>;

    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function writeOrbitHintState(patch: Partial<OrbitHintState>) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const next = { ...readOrbitHintState(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function resetOrbitHintState() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }

  window.dispatchEvent(new CustomEvent(ORBIT_HINT_RESET_EVENT));
}

export function subscribeOrbitHintReset(listener: () => void) {
  return subscribeWindowEvent(ORBIT_HINT_RESET_EVENT, listener);
}
