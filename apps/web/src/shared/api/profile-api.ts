import type { ProfileInfo } from '#web/entities/profile/profile';

const PROFILE_QUERY = `
  query Profile {
    profile {
      name
      role
      tag
      blurb
      portrait
      facts {
        label
        value
      }
      goals
      about
    }
  }
`;

type GqlProfileResponse = {
  data?: { profile: ProfileInfo | null };
  errors?: Array<{ message: string }>;
};

let profileInFlight: Promise<ProfileInfo> | null = null;

async function requestProfile(): Promise<ProfileInfo> {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: PROFILE_QUERY }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = (await res.json()) as GqlProfileResponse;

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? 'GraphQL error');
  }

  if (!json.data?.profile) {
    throw new Error('Profile not found');
  }

  return json.data.profile;
}

/** Concurrent callers share one in-flight request (Strict Mode remounts). */
export function fetchProfile(): Promise<ProfileInfo> {
  if (profileInFlight === null) {
    profileInFlight = requestProfile().finally(() => {
      profileInFlight = null;
    });
  }

  return profileInFlight;
}
