import type { ProfileInfo } from '#web/entities/profile/profile';

import { GatewayPage } from '#web/pages/gateway/GatewayPage';
import { fetchProfile } from '#web/shared/api/profile-api';
import { SiteFooter } from '#web/shared/ui/SiteFooter';
import { OrbitHero } from '#web/widgets/orbit-hero/OrbitHero';
import { PortfolioBento } from '#web/widgets/portfolio-bento/PortfolioBento';
import { useEffect, useState } from 'react';

export function ProfilePage() {
  const [attempt, setAttempt] = useState(0);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchProfile()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setError(null);
        setProfile(data);
      })
      .catch((caught: unknown) => {
        if (cancelled) {
          return;
        }

        const message = caught instanceof Error ? caught.message : 'Не удалось загрузить профиль';
        setProfile(null);
        setError(message);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    if (profile === null) {
      return;
    }

    document.title = `${profile.name} — ${profile.role.split('·')[0]?.trim() ?? 'Portfolio'}`;
  }, [profile]);

  if (error !== null) {
    return (
      <GatewayPage
        onRetry={() => {
          setAttempt((current) => current + 1);
        }}
      />
    );
  }

  const loading = profile === null;

  return (
    <>
      <main>
        <OrbitHero />
        <PortfolioBento profile={profile} loading={loading} />
      </main>
      <SiteFooter />
    </>
  );
}
