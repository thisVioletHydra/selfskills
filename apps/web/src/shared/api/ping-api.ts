import { graphqlUrl } from '#web/shared/api/graphql-url';
import {
  assertRequestGateOpen,
  isRequestGateOpen,
  recordRequestFail,
  recordRequestOk,
  RequestGateError,
} from '#web/shared/api/request-gate';

const PING_QUERY = '{ __typename }';
const PING_TIMEOUT_MS = 3000;

type PingResponse = {
  data?: { __typename?: string };
};

let pingInFlight: Promise<boolean> | null = null;

async function requestPing(): Promise<boolean> {
  if (!isRequestGateOpen()) {
    return false;
  }

  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => {
    controller.abort();
  }, PING_TIMEOUT_MS);

  try {
    assertRequestGateOpen();

    const res = await fetch(graphqlUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: PING_QUERY }),
      signal: controller.signal,
    });

    if (!res.ok) {
      recordRequestFail();
      return false;
    }

    const json = (await res.json()) as PingResponse;
    const ok = json.data?.__typename === 'Query';

    if (ok) {
      recordRequestOk();
      return true;
    }

    recordRequestFail();
    return false;
  } catch (caught) {
    if (!(caught instanceof RequestGateError)) {
      recordRequestFail();
    }

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
