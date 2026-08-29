/** After this many failed backend hits, block further requests. */
export const REQUEST_FAIL_LIMIT = 10;
/** Block window once the fail limit is hit. */
export const REQUEST_BLOCK_MS = 20_000;

let failures = 0;
let blockedUntil = 0;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeRequestGate(listener: () => void): () => void {
  listeners.add(listener);
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
}

export function recordRequestFail(): void {
  if (!isRequestGateOpen()) {
    return;
  }

  failures += 1;

  if (failures < REQUEST_FAIL_LIMIT) {
    return;
  }

  failures = 0;
  blockedUntil = Date.now() + REQUEST_BLOCK_MS;
  notify();
}
