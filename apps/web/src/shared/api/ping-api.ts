import { graphqlUrl } from '#web/shared/api/graphql-url';

const PING_QUERY = '{ __typename }';
const PING_TIMEOUT_MS = 3000;

type PingResponse = {
  data?: { __typename?: string };
};

let pingInFlight: Promise<boolean> | null = null;

async function requestPing(): Promise<boolean> {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => {
    controller.abort();
  }, PING_TIMEOUT_MS);

  try {
    const res = await fetch(graphqlUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: PING_QUERY }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return false;
    }

    const json = (await res.json()) as PingResponse;
    return json.data?.__typename === 'Query';
  } catch {
    return false;
  } finally {
    globalThis.clearTimeout(timer);
  }
}

/** Concurrent callers share one in-flight request (Strict Mode remounts). */
export function pingBackend(): Promise<boolean> {
  if (pingInFlight === null) {
    pingInFlight = requestPing().finally(() => {
      pingInFlight = null;
    });
  }

  return pingInFlight;
}
