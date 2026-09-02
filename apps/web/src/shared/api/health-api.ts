import { graphqlUrl } from '#web/shared/api/graphql-url';

export type HealthDbStatus = 'up' | 'down' | 'unknown';
export type HealthApiStatus = 'up' | 'down' | 'unknown';

export type HealthSnapshot = {
  api: HealthApiStatus;
  db: HealthDbStatus;
  /** Last /health round-trip in ms */
  latencyMs: number | null;
  /** Rolling average of recent successful/failed probes */
  latencyAvgMs: number | null;
};

const HEALTH_TIMEOUT_MS = 30_000;
const HEALTH_POLL_MS = 35_000;
const HEALTH_FAST_POLL_MS = 4_000;
const LATENCY_WINDOW = 8;

const INITIAL_SNAPSHOT: HealthSnapshot = {
  api: 'unknown',
  db: 'unknown',
  latencyMs: null,
  latencyAvgMs: null,
};

type HealthListener = (snapshot: HealthSnapshot) => void;

const listeners = new Set<HealthListener>();
const latencySamples: number[] = [];
let snapshot: HealthSnapshot = INITIAL_SNAPSHOT;
let pollTimer = 0;
let pollInFlight = false;

/** Derive `/health` from GraphQL origin (`/graphql` → `/health`). */
export function healthUrl(): string {
  const gql = graphqlUrl();

  if (gql.startsWith('/')) {
    return '/health';
  }

  try {
    return new URL('/health', gql).toString();
  } catch {
    return '/health';
  }
}

function pushLatency(ms: number): number {
  latencySamples.push(ms);

  if (latencySamples.length > LATENCY_WINDOW) {
    latencySamples.shift();
  }

  const sum = latencySamples.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / latencySamples.length);
}

export async function fetchHealth(): Promise<HealthSnapshot> {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => {
    controller.abort();
  }, HEALTH_TIMEOUT_MS);
  const started = performance.now();

  try {
    const res = await fetch(healthUrl(), {
      method: 'GET',
      signal: controller.signal,
    });
    const latencyMs = Math.round(performance.now() - started);
    const latencyAvgMs = pushLatency(latencyMs);

    if (!res.ok) {
      return { api: 'down', db: 'unknown', latencyMs, latencyAvgMs };
    }

    const json = (await res.json()) as { ok?: boolean; db?: string };
    const db = json.db === 'up' || json.db === 'down' ? json.db : 'unknown';

    return {
      api: json.ok === true ? 'up' : 'down',
      db,
      latencyMs,
      latencyAvgMs,
    };
  } catch {
    const latencyMs = Math.round(performance.now() - started);
    const latencyAvgMs = pushLatency(latencyMs);

    return { api: 'down', db: 'unknown', latencyMs, latencyAvgMs };
  } finally {
    globalThis.clearTimeout(timer);
  }
}

function notify() {
  for (const listener of listeners) {
    listener(snapshot);
  }
}

function clearPollTimer() {
  if (pollTimer !== 0) {
    globalThis.clearTimeout(pollTimer);
    pollTimer = 0;
  }
}

function nextPollDelay(next: HealthSnapshot) {
  return next.api === 'up' ? HEALTH_POLL_MS : HEALTH_FAST_POLL_MS;
}

async function runPoll() {
  if (pollInFlight) {
    return;
  }

  pollInFlight = true;

  try {
    const next = await fetchHealth();
    snapshot = next;
    notify();
  } finally {
    pollInFlight = false;
  }

  if (listeners.size === 0) {
    return;
  }

  clearPollTimer();
  pollTimer = globalThis.setTimeout(() => {
    pollTimer = 0;
    void runPoll();
  }, nextPollDelay(snapshot));
}

export function getHealthSnapshot(): HealthSnapshot {
  return snapshot;
}

/** Shared health poll — fast while API is down, slow when up. */
export function subscribeHealth(listener: HealthListener): () => void {
  listeners.add(listener);
  listener(snapshot);

  if (listeners.size === 1) {
    void runPoll();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      clearPollTimer();
    }
  };
}

export { HEALTH_POLL_MS, HEALTH_FAST_POLL_MS };
