/** After this many failed backend hits, block further requests. */
export const REQUEST_FAIL_LIMIT = 10;
/** Block window once the fail limit is hit. */
export const REQUEST_BLOCK_MS = 20_000;

const STORAGE_KEY = 'selfskills:request-gate';

type GateSnapshot = {
  failures: number;
  blockedUntil: number;
};

function readSnapshot(): GateSnapshot {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (raw === null || raw === '') {
      return { failures: 0, blockedUntil: 0 };
    }

    const parsed = JSON.parse(raw) as Partial<GateSnapshot>;
    const failures = typeof parsed.failures === 'number' && parsed.failures > 0 ? parsed.failures : 0;
    const blockedUntil =
      typeof parsed.blockedUntil === 'number' && parsed.blockedUntil > Date.now()
        ? parsed.blockedUntil
        : 0;

    return { failures: blockedUntil > 0 ? 0 : failures, blockedUntil };
  } catch {
    return { failures: 0, blockedUntil: 0 };
  }
}

function writeSnapshot(): void {
  try {
    const payload: GateSnapshot = { failures, blockedUntil };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // private mode / quota — gate still works in memory
  }
}

let { failures, blockedUntil } = readSnapshot();
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeRequestGate(listener: () => void): () => void {
  listeners.add(listener);

  if (!isRequestGateOpen()) {
    listener();
  }

  return () => {
    listeners.delete(listener);
  };
}

export function isRequestGateOpen(): boolean {
  return Date.now() >= blockedUntil;
}

export function remainingRequestGateMs(): number {
  return Math.max(0, blockedUntil - Date.now());
}

export class RequestGateError extends Error {
  constructor() {
    super('Request gate closed');
    this.name = 'RequestGateError';
  }
}

export function assertRequestGateOpen(): void {
  if (!isRequestGateOpen()) {
    throw new RequestGateError();
  }
}

export function recordRequestOk(): void {
  failures = 0;
  blockedUntil = 0;
  writeSnapshot();
}

export function recordRequestFail(): void {
  if (!isRequestGateOpen()) {
    return;
  }

  failures += 1;

  if (failures < REQUEST_FAIL_LIMIT) {
    writeSnapshot();
    return;
  }

  failures = 0;
  blockedUntil = Date.now() + REQUEST_BLOCK_MS;
  writeSnapshot();
  notify();
}
