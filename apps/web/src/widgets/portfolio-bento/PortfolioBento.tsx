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

const SKILL_GROUPS = {
  core: ['TypeScript', 'JavaScript', 'Vue', 'React', 'Node.js'],
  working: [
    'Nuxt.js',
    'Next.js',
    'NestJS',
    'Express',
    'Prisma',
    'GraphQL',
    'Tailwind CSS',
    'Vite',
    'HTML5',
    'CSS3',
    'Git',
    'GitLab CI',
    'REST API',
    'Docker',
    'PostgreSQL',
  ],
  familiar: ['Strapi', 'MongoDB'],
} as const;

type SkillGroupId = keyof typeof SKILL_GROUPS;

const SKILL_GROUP_KEYS: Record<SkillGroupId, 'skillsCore' | 'skillsWorking' | 'skillsFamiliar'> = {
  core: 'skillsCore',
  working: 'skillsWorking',
  familiar: 'skillsFamiliar',
};

type PortfolioBentoProps = {
  profile: ProfileInfo | null;
  resume: ResumeInfo | null;
  loading?: boolean;
};

function groupResumeSkills(skills: string[]) {
  const byName = new Set(skills);
  const used = new Set<string>();

  const groups = (Object.keys(SKILL_GROUPS) as SkillGroupId[])
    .map((id) => {
      const names = SKILL_GROUPS[id].filter((name) => byName.has(name));
      for (const name of names) {
        used.add(name);
      }
      return {
        id,
        labelKey: SKILL_GROUP_KEYS[id],
        names,
      };
    })
    .filter((group) => group.names.length > 0);

  const leftovers = skills.filter((name) => !used.has(name));
  if (leftovers.length === 0) {
    return groups;
  }

  const working = groups.find((group) => group.id === 'working');
  if (working !== undefined) {
    working.names.push(...leftovers);
    return groups;
  }

  return [
    ...groups,
    { id: 'working' as SkillGroupId, labelKey: SKILL_GROUP_KEYS.working, names: leftovers },
  ];
}

function BentoScrollHint({ revealed = false }: { revealed?: boolean }) {
  const { t } = useLocale();

  return (
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
  );
}

function BentoPeekOnly({ busy = false }: { busy?: boolean }) {
  return (
    <section
      className="portfolio-bento is-peek-only"
      id="portfolio"
      aria-busy={busy || undefined}
    >
      <BentoScrollHint />
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
    return <BentoPeekOnly busy />;
  }

  const portraitStyle = {
    '--portrait-url': `url(${imageUrl(profile.portrait)})`,
  } as CSSProperties;

  const sectionClassName = [
    'portfolio-bento',
    revealed ? 'is-revealed' : 'is-awaiting-reveal',
    experienceActive ? 'is-experience-active' : '',
    educationActive ? 'is-education-active' : '',
    aboutActive ? 'is-about-active' : '',
    skillsActive ? 'is-skills-active' : '',
    softwareActive ? 'is-software-active' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const skillGroups = groupResumeSkills(resume.skills);
  let skillTagIndex = 0;

  const softwarePlanets = PLANETS.filter((planet) => planet.isCore !== true).slice(0, 9);
  const phoneMasked = resume.phone.includes('*');

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
      <BentoScrollHint revealed={revealed} />

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
                {resume.phone !== '' ? (
                  <li>
                    {phoneMasked ? (
                      <span>{resume.phone}</span>
                    ) : (
                      <a href={`tel:${resume.phone.replace(/\s/g, '')}`}>{resume.phone}</a>
                    )}
                  </li>
                ) : null}
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
                            {typeof job.productExampleUrl === 'string' && job.productExampleUrl.length > 0 ? (
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
                <div className="bento-skill-groups">
                  {skillGroups.map((group) => (
                    <div key={group.id} className="bento-skill-group">
                      <p className="bento-skill-group-label">{t(group.labelKey)}</p>
                      <ul className="bento-skill-tags">
                        {group.names.map((name) => {
                          const tagIndex = skillTagIndex++;
                          return (
                            <li
                              key={name}
                              className={`bento-skill-tag bento-skill-tag--${group.id}`}
                              style={{ '--skill-i': tagIndex } as CSSProperties}
                            >
                              {name}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
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
