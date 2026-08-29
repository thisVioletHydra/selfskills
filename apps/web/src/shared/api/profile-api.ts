import type { ProfileInfo } from '#web/entities/profile/profile';
import type { Locale } from '#web/shared/lib/locale-state';

import { graphqlUrl } from '#web/shared/api/graphql-url';

const PROFILE_QUERY = `
  query Profile($locale: Locale!) {
    profile(locale: $locale) {
      name
      role
      tag
      blurb
      portrait
      facts {
        label
        value
      }
      about
    }
  }
`;

type GqlProfileResponse = {
  data?: { profile: ProfileInfo | null };
  errors?: Array<{ message: string }>;
};

const profileInFlight = new Map<Locale, Promise<ProfileInfo>>();

async function requestProfile(locale: Locale): Promise<ProfileInfo> {
  const res = await fetch(graphqlUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: PROFILE_QUERY,
      variables: { locale },
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as GqlProfileResponse;

  if ((json.errors?.length ?? 0) > 0) {
    throw new Error(json.errors?.[0]?.message ?? 'GraphQL error');
  }

  if (json.data?.profile === undefined || json.data?.profile === null) {
    throw new Error('Profile not found');
  }

  return json.data.profile;
}

/** Concurrent callers per locale share one in-flight request (Strict Mode remounts). */
export function fetchProfile(locale: Locale): Promise<ProfileInfo> {
  const cached = profileInFlight.get(locale);

  if (cached !== undefined) {
    return cached;
  }

  const request = requestProfile(locale).finally(() => {
    profileInFlight.delete(locale);
  });

  profileInFlight.set(locale, request);
  return request;
}
