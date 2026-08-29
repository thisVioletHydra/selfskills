import { subscribeWindowEvent } from '#web/shared/lib/subscribe-window-event';

export type CosmosHintState = {
  tapDismissed: boolean;
  throwDismissed: boolean;
  teaseDone: boolean;
};

export const COSMOS_HINT_RESET_EVENT = 'cosmos-hints-reset';

const STORAGE_KEY = 'cosmos-hint-state';
const LEGACY_STORAGE_KEY = 'orbit-hint-state';

const DEFAULT_STATE: CosmosHintState = {
  tapDismissed: false,
  throwDismissed: false,
  teaseDone: false,
};

function readRaw(key: string): CosmosHintState | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined || raw === '') {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<CosmosHintState>;

    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return null;
  }
}

export function readCosmosHintState(): CosmosHintState {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULT_STATE };
  }

  const current = readRaw(STORAGE_KEY);
  if (current !== null) {
    return current;
  }

  const legacy = readRaw(LEGACY_STORAGE_KEY);
  if (legacy !== null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    return legacy;
  }

  return { ...DEFAULT_STATE };
}

export function writeCosmosHintState(patch: Partial<CosmosHintState>) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const next = { ...readCosmosHintState(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function resetCosmosHintState() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }

  window.dispatchEvent(new CustomEvent(COSMOS_HINT_RESET_EVENT));
}

export function subscribeCosmosHintReset(listener: () => void) {
  return subscribeWindowEvent(COSMOS_HINT_RESET_EVENT, listener);
}
