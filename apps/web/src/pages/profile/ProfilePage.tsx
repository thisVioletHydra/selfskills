import type { ProfileInfo } from '#web/entities/profile/profile';
import type { ResumeInfo } from '#web/entities/resume/resume';

import { GatewayPage } from '#web/pages/gateway/GatewayPage';
import { fetchProfile } from '#web/shared/api/profile-api';
import { fetchResume } from '#web/shared/api/resume-api';
import { messages } from '#web/shared/i18n/messages';
import { useLocale } from '#web/shared/i18n/locale-context';
import { LocaleToggle } from '#web/shared/ui/LocaleToggle';
import { SiteFooter } from '#web/shared/ui/SiteFooter';
import { StatusChips } from '#web/widgets/cosmos/chrome/StatusChips';
import { CosmosStage } from '#web/widgets/cosmos/CosmosStage';
import { PortfolioBento } from '#web/widgets/portfolio-bento/PortfolioBento';
import { useEffect, useState } from 'react';

type PortfolioData = {
  profile: ProfileInfo;
  resume: ResumeInfo;
};

export function ProfilePage() {
  const { locale } = useLocale();
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<PortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchProfile(locale), fetchResume(locale)])
      .then(([profile, resume]) => {
        if (cancelled) {
          return;
        }

        setError(null);
        setData({ profile, resume });
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }

        const message = caught instanceof Error ? caught.message : messages[locale].profileLoadError;
        setData(null);
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, locale]);

  useEffect(() => {
    if (data === null) {
      return;
    }

    document.title = `${data.profile.name} — ${data.profile.role.split('·')[0]?.trim() ?? 'Portfolio'}`;
  }, [data]);

  if (error !== null) {
    return (
      <GatewayPage
        onRetry={() => {
          setAttempt((current) => current + 1);
        }}
        onHome={() => {
          setAttempt((current) => current + 1);
        }}
      />
    );
  }

  const loading = data === null;

  return (
    <>
      <main>
        <CosmosStage />
        <PortfolioBento profile={loading ? null : data.profile} resume={loading ? null : data.resume} loading={loading} />
      </main>
      <SiteFooter />
      <StatusChips />
      <LocaleToggle />
    </>
  );
}
