import type { ProfileInfo } from '#web/entities/profile/profile';
import type { CSSProperties } from 'react';

import { GatewayPage } from '#web/pages/gateway/GatewayPage';
import { fetchProfile } from '#web/shared/api/profile-api';
import { SiteFooter } from '#web/shared/ui/SiteFooter';
import { SiteHeader } from '#web/shared/ui/SiteHeader';
import { ContactsBar } from '#web/widgets/contacts-bar/ContactsBar';
import { OrbitHero } from '#web/widgets/orbit-hero/OrbitHero';
import { ProjectsGrid } from '#web/widgets/projects-grid/ProjectsGrid';
import { SkillsBlock } from '#web/widgets/skills-block/SkillsBlock';
import { useEffect, useState } from 'react';
import '#web/pages/profile/profile-page.css';

function splitDisplayName(full: string) {
  const space = full.indexOf(' ');

  if (space === -1) {
    return { mark: full, given: '' };
  }

  return {
    mark: full.slice(0, space),
    given: full.slice(space + 1),
  };
}

function ProfileLeadSkeleton() {
  return (
    <div className="lead-head" aria-hidden="true">
      <p className="skel skel-tag" />
      <h2 className="skel skel-name" />
      <p className="skel skel-role" />
      <p className="skel skel-blurb" />
      <p className="skel skel-blurb skel-blurb--short" />
    </div>
  );
}

function ProfileDetailsSkeleton() {
  return (
    <div className="inner" aria-hidden="true">
      <div className="details-grid">
        <div className="details-block">
          <h3 className="skel skel-heading" />
          <div className="skel skel-facts" />
        </div>
        <div className="details-block">
          <h3 className="skel skel-heading" />
          <div className="skel skel-goals" />
        </div>
      </div>
      <div className="details-about">
        <h3 className="skel skel-heading" />
        <p className="skel skel-copy" />
        <p className="skel skel-copy" />
      </div>
    </div>
  );
}

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
  const portraitStyle = profile === null
    ? undefined
    : { '--portrait-url': `url(${profile.portrait})` } as CSSProperties;
  const nameParts = profile === null
    ? null
    : splitDisplayName(profile.name);

  return (
    <>
      <main>
        <OrbitHero />
        <SiteHeader />

        <section
          className={`cosmos-section about${loading ? ' is-loading' : ''}`}
          id="about"
          aria-busy={loading}
        >
          <div className="stars" aria-hidden="true" />
          <div className="persona-stage">
            <div className="persona-photo">
              <div
                className={`shot${loading ? ' shot--pending' : ''}`}
                role="img"
                aria-label={profile === null ? undefined : `Портрет: ${profile.name}`}
                style={portraitStyle}
              />
            </div>

            <div className="lead">
              {loading || nameParts === null
                ? <ProfileLeadSkeleton />
                : (
                    <>
                      <div className="lead-head">
                        <p className="tag">{profile.tag}</p>
                        <h2 className="name">
                          <span className="mark">{nameParts.mark}</span>
                          {nameParts.given === '' ? null : ` ${nameParts.given}`}
                        </h2>
                        <p className="role">{profile.role}</p>
                      </div>
                      <p className="blurb">{profile.blurb}</p>
                    </>
                  )}
            </div>
          </div>
        </section>

        <section
          className={`cosmos-section details${loading ? ' is-loading' : ''}`}
          id="details"
          aria-busy={loading}
        >
          <div className="stars" aria-hidden="true" />
          {loading || profile === null
            ? <ProfileDetailsSkeleton />
            : (
                <div className="inner">
                  <div className="details-grid">
                    <div className="details-block">
                      <h3 className="heading">Факты</h3>
                      <dl className="facts">
                        {profile.facts.map((fact) => (
                          <div key={fact.label} className="fact">
                            <dt>{fact.label}</dt>
                            <dd>{fact.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    <div className="details-block">
                      <h3 className="heading">Куда целился</h3>
                      <ul className="goals">
                        {profile.goals.map((goal) => (
                          <li key={goal.slice(0, 32)}>{goal}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="details-about">
                    <h3 className="heading">О себе</h3>
                    {profile.about.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)} className="copy">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
        </section>

        <SkillsBlock />
        <ProjectsGrid />
        <ContactsBar />
      </main>
      <SiteFooter />
    </>
  );
}
