import type { ResumeInfo } from '#web/entities/resume/resume';
import type { Locale } from '#web/shared/lib/locale-state';

import { graphqlUrl } from '#web/shared/api/graphql-url';
import {
  assertRequestGateOpen,
  recordRequestFail,
  recordRequestOk,
  RequestGateError,
} from '#web/shared/api/request-gate';

const RESUME_QUERY = `
  query Resume($locale: Locale!) {
    resume(locale: $locale) {
      phone
      email
      experienceYears
      education {
        level
        school
        details
      }
      skills
      jobs {
        id
        period
        duration
        company
        location
        url
        industry
        role
        productNote
        productExampleUrl
        stack
        highlights
      }
    }
  }
`;

type GqlResumeResponse = {
  data?: { resume: ResumeInfo | null };
  errors?: Array<{ message: string }>;
};

const resumeInFlight = new Map<Locale, Promise<ResumeInfo>>();

async function requestResume(locale: Locale): Promise<ResumeInfo> {
  assertRequestGateOpen();
  let counted = false;

  try {
    const res = await fetch(graphqlUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: RESUME_QUERY,
        variables: { locale },
      }),
    });

    if (!res.ok) {
      recordRequestFail();
      counted = true;
      throw new Error(`HTTP ${res.status}`);
    }

    const json = (await res.json()) as GqlResumeResponse;

    if ((json.errors?.length ?? 0) > 0) {
      recordRequestFail();
      counted = true;
      throw new Error(json.errors?.[0]?.message ?? 'GraphQL error');
    }

    if (json.data?.resume === undefined || json.data?.resume === null) {
      recordRequestFail();
      counted = true;
      throw new Error('Resume not found');
    }

    recordRequestOk();
    return json.data.resume;
  } catch (caught) {
    if (caught instanceof RequestGateError) {
      throw caught;
    }

    if (!counted) {
      recordRequestFail();
    }

    throw caught;
  }
}

export function fetchResume(locale: Locale): Promise<ResumeInfo> {
  const cached = resumeInFlight.get(locale);

  if (cached !== undefined) {
    return cached;
  }

  const request = requestResume(locale).finally(() => {
    resumeInFlight.delete(locale);
  });

  resumeInFlight.set(locale, request);
  return request;
}
