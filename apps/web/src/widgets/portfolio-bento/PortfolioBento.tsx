import type { ProfileInfo } from '#web/entities/profile/profile';
import type { ResumeInfo } from '#web/entities/resume/resume';
import type { CSSProperties } from 'react';

import { useRef } from 'react';
import { PLANETS } from '#web/entities/planet/planets';
import { profileFactValue } from '#web/entities/profile/profileFactValue';
import { GITHUB_URL, TELEGRAM_URL } from '#web/shared/config/contacts';
import { imageUrl } from '#web/generated/asset-urls';
import { useLocale } from '#web/shared/i18n/locale-context';
import { useBentoMotion } from '#web/widgets/portfolio-bento/useBentoMotion';

import '#web/widgets/portfolio-bento/portfolio-bento.css';

const TELEGRAM = TELEGRAM_URL;
const SKILL_LEVELS = [95, 90, 88, 85, 82, 78];

type PortfolioBentoProps = {
  profile: ProfileInfo | null;
  resume: ResumeInfo | null;
  loading?: boolean;
};

function BentoSkeleton() {
  return (
    <section className="portfolio-bento is-loading" id="portfolio" aria-busy="true">
      <div className="bento-shell">
        <div className="bento">
          <aside className="bento-sidebar" aria-hidden="true">
            <div className="bento-card skel skel-portrait" />
            <div className="skel skel-line skel-line--lg" />
            <div className="skel skel-line" />
            <div className="skel skel-copy" />
          </aside>
          <div className="bento-main" aria-hidden="true">
            <div className="bento-card skel skel-stats" />
            <div className="bento-card skel skel-card" />
            <div className="bento-card skel skel-card skel-card--sm" />
            <div className="bento-split">
              <div className="bento-card skel skel-card" />
              <div className="bento-card skel skel-card" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PortfolioBento({ profile, resume, loading = false }: PortfolioBentoProps) {
  const { locale, t } = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const motionEnabled = !loading && profile !== null && resume !== null;
  const {
    revealed,
    experienceActive,
    educationActive,
    aboutActive,
    skillsActive,
    softwareActive
  } = useBentoMotion({
    enabled: motionEnabled,
    sectionRef,
  });

  if (loading || profile === null || resume === null) {
    return <BentoSkeleton />;
  }

  const portraitStyle = {
    '--portrait-url': `url(${imageUrl(profile.portrait)})`,
  } as CSSProperties;

  const sectionClassName = [
    'portfolio-bento',
    revealed ? 'is-revealed' : '',
    experienceActive ? 'is-experience-active' : '',
    educationActive ? 'is-education-active' : '',
    aboutActive ? 'is-about-active' : '',
    skillsActive ? 'is-skills-active' : '',
    softwareActive ? 'is-software-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const skillRows = resume.skills.slice(0, 6).map((name, index) => ({
    name,
    level: SKILL_LEVELS[index] ?? 70,
  }));

  const softwarePlanets = PLANETS.filter((planet) => planet.isCore !== true).slice(0, 9);

  const experienceRaw = profileFactValue(profile.facts, 'experience', locale, resume.experienceYears);
  const experienceYears = experienceRaw.match(/\d+/)?.[0] ?? experienceRaw;

  const stats = [
    {
      label: t('statsYears'),
      value: `${experienceYears}+`
    },
    {
      label: t('statsStatus'),
      value: t('statsJobSearch')
    },
    {
      label: t('statsCity'),
      value: profileFactValue(profile.facts, 'city', locale, locale === 'en' ? 'Moscow' : 'Москва')
    },
    {
      label: t('statsFormat'),
      value: profileFactValue(profile.facts, 'format', locale, locale === 'en' ? 'Remote' : 'Удалённо')
    },
  ];

  return (
    <section ref={sectionRef} className={sectionClassName} id="portfolio">
      <div className="bento-scroll-hint" aria-hidden={revealed}>
        <span className="bento-scroll-hint-label">{t('scroll')}</span>
        <svg className="bento-scroll-hint-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 5v12m0 0 4.5-4.5M12 17l-4.5-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="bento-shell">
        <div className="bento">
          <aside className="bento-sidebar" id="contact">
            <div
              className="bento-card bento-card--sidebar bento-reveal"
              style={{ '--reveal-i': 0 } as CSSProperties}
            >
              <div
                className="bento-portrait"
                role="img"
                aria-label={t('portraitAria', { name: profile.name })}
                style={portraitStyle}
              />

              <h2 className="bento-name">{profile.name}</h2>
              <p className="bento-role">
                <span className="bento-role-title">{t('roleTitle')}</span>
                <span className="bento-role-stack">{t('roleStack')}</span>
              </p>

              <p className="bento-bio">{profile.blurb}</p>

              <ul className="bento-contacts">
                <li>
                  <a href={`tel:${resume.phone.replace(/\s/g, '')}`}>{resume.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${resume.email}`}>{resume.email}</a>
                </li>
                <li>
                  <span>
                    {profileFactValue(profile.facts, 'city', locale, 'Москва')} · {t('remote')}
                  </span>
                </li>
              </ul>

              <a
                className="bento-qr"
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('telegramQrAria')}
              >
                <img
                  className="bento-qr-image"
                  src={imageUrl('telegram-qr')}
                  alt=""
                  width={274}
                  height={274}
                  draggable={false}
                />
                <p className="bento-qr-caption">@RTXROMAN</p>
              </a>

              <div className="bento-socials">
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href={TELEGRAM}>Telegram</a>
                <a href={`mailto:${resume.email}`}>Email</a>
              </div>
            </div>
          </aside>

          <div className="bento-main">
            <div
              className="bento-card bento-stats bento-reveal"
              style={{ '--reveal-i': 1 } as CSSProperties}
            >
              {stats.map((stat) => (
                <div key={stat.label} className="bento-stat">
                  <p className="bento-stat-value">{stat.value}</p>
                  <p className="bento-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>

            <article
              className="bento-card bento-chain-card"
              id="experience"
            >
              <header className="bento-card-head">
                <h3 className="bento-heading">{t('experience')}</h3>
                <span className="bento-meta">{t('timeline')}</span>
              </header>
              <ol className="bento-timeline">
                {resume.jobs.map((job, index) => {
                  let lineIndex = 0;
                  const lineClass = 'bento-timeline-line';
                  const nextLineStyle = () => ({ '--line-i': lineIndex++ } as CSSProperties);

                  return (
                  <li
                    key={job.id}
                    className="bento-timeline-item"
                    style={{ '--job-i': index } as CSSProperties}
                  >
                    <div className="bento-timeline-marker" aria-hidden="true" />
                    <div className="bento-timeline-body">
                      <p className="bento-timeline-date">{job.period}</p>
                      <div className="bento-timeline-detail">
                        <h4
                          className={`bento-timeline-title ${lineClass}`}
                          style={nextLineStyle()}
                        >
                          {job.role}
                        </h4>
                        <p
                          className={`bento-timeline-company ${lineClass}`}
                          style={nextLineStyle()}
                        >
                          {job.url !== undefined && job.url !== '' ? (
                            <a href={job.url} target="_blank" rel="noopener noreferrer">
                              {job.company}
                            </a>
                          ) : (
                            job.company
                          )}
                          {job.location === '' ? '' : ` · ${job.location}`}
                        </p>
                        {job.productNote !== undefined && job.productNote !== '' ? (
                          <div className="bento-timeline-note">
                            <p className={lineClass} style={nextLineStyle()}>
                              {job.productNote}
                            </p>
                            {job.productExampleUrl !== undefined && job.productExampleUrl !== '' ? (
                              <a
                                className={`bento-timeline-example ${lineClass}`}
                                href={job.productExampleUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={nextLineStyle()}
                              >
                                {t('publicExample')} {job.productExampleUrl}
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                        <ul className="bento-timeline-list">
                          {job.highlights.slice(0, 5).map((line) => (
                            <li key={line.slice(0, 48)} className={lineClass} style={nextLineStyle()}>
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ol>
            </article>

            <article className="bento-card bento-chain-card" id="education">
              <header className="bento-card-head">
                <h3 className="bento-heading">{t('education')}</h3>
              </header>
              <ol className="bento-timeline bento-timeline--compact">
                <li className="bento-timeline-item">
                  <div className="bento-timeline-marker" aria-hidden="true" />
                  <div className="bento-timeline-body">
                    <p className="bento-timeline-date">{resume.education.details}</p>
                    <h4 className="bento-timeline-title">{resume.education.school}</h4>
                    <p className="bento-timeline-company">{resume.education.level}</p>
                  </div>
                </li>
              </ol>
            </article>

            <div className="bento-split">
              <article
                className="bento-card bento-chain-card"
                id="skills"
              >
                <h3 className="bento-heading">{t('skills')}</h3>
                <ul className="bento-skill-list">
                  {skillRows.map((skill, index) => (
                    <li key={skill.name} className="bento-skill">
                      <div className="bento-skill-row">
                        <span className="bento-skill-name">{skill.name}</span>
                        <span className="bento-skill-pct">{skill.level}%</span>
                      </div>
                      <div className="bento-skill-track">
                        <span
                          className="bento-skill-bar"
                          style={
                            {
                              '--skill-pct': `${skill.level}%`,
                              '--skill-i': index,
                            } as CSSProperties
                          }
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </article>

              <article
                className="bento-card bento-chain-card"
                id="software"
              >
                <h3 className="bento-heading">{t('software')}</h3>
                <ul className="bento-software">
                  {softwarePlanets.map((planet, index) => (
                    <li
                      key={planet.id}
                      className="bento-software-item"
                      title={planet.name}
                      style={{ '--software-i': index } as CSSProperties}
                    >
                      <img src={planet.icon} alt="" />
                      <span>{planet.name}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <article
              className="bento-card bento-chain-card"
              id="about"
            >
              <h3 className="bento-heading">{t('about')}</h3>
              <ol className="bento-timeline bento-about-track">
                {profile.about.map((paragraph, index) => (
                  <li
                    key={paragraph.slice(0, 48)}
                    className="bento-timeline-item"
                    style={{ '--job-i': index } as CSSProperties}
                  >
                    <div className="bento-timeline-marker" aria-hidden="true" />
                    <div className="bento-timeline-body">
                      <p
                        className="bento-about-paragraph bento-timeline-line"
                        style={{ '--line-i': 0 } as CSSProperties}
                      >
                        {paragraph}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
