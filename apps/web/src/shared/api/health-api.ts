import { graphqlUrl } from '#web/shared/api/graphql-url';

export type HealthDbStatus = 'up' | 'down' | 'unknown';

export type HealthSnapshot = {
  api: 'up' | 'down';
  db: HealthDbStatus;
};

const HEALTH_TIMEOUT_MS = 4000;
const POLL_MS = 35_000;

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

export async function fetchHealth(): Promise<HealthSnapshot> {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => {
    controller.abort();
  }, HEALTH_TIMEOUT_MS);

  try {
    const res = await fetch(healthUrl(), {
      method: 'GET',
      signal: controller.signal,
    });

    if (!res.ok) {
      return { api: 'down', db: 'unknown' };
    }

    const json = (await res.json()) as { ok?: boolean; db?: string };
    const db = json.db === 'up' || json.db === 'down' ? json.db : 'unknown';

    return {
      api: json.ok === true ? 'up' : 'down',
      db,
    };
  } catch {
    return { api: 'down', db: 'unknown' };
  } finally {
    globalThis.clearTimeout(timer);
  }
}

export { POLL_MS as HEALTH_POLL_MS };
