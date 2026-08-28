import type { ProfileInfo } from '#web/entities/profile/profile';
import type { CSSProperties } from 'react';

import { PLANETS } from '#web/entities/planet/planets';
import { DEMO_RESUME } from '#web/entities/resume/resume';
import { GITHUB_URL, TELEGRAM_QR_SRC, TELEGRAM_URL } from '#web/shared/config/contacts';
import '#web/widgets/portfolio-bento/portfolio-bento.css';

const TELEGRAM = TELEGRAM_URL;

const SKILL_LEVELS = [95, 90, 88, 85, 82, 78];

type PortfolioBentoProps = {
  profile: ProfileInfo | null;
  loading?: boolean;
};

function factValue(facts: ProfileInfo['facts'], label: string, fallback: string) {
  return facts.find((fact) => fact.label === label)?.value ?? fallback;
}

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

export function PortfolioBento({ profile, loading = false }: PortfolioBentoProps) {
  if (loading || profile === null) {
    return <BentoSkeleton />;
  }

  const portraitStyle = { '--portrait-url': `url(${profile.portrait})` } as CSSProperties;

  const skillRows = DEMO_RESUME.skills.slice(0, 6).map((name, index) => ({
    name,
    level: SKILL_LEVELS[index] ?? 70,
  }));

  const softwarePlanets = PLANETS.filter((planet) => planet.isCore !== true).slice(0, 9);

  const stats = [
    {
      label: 'Years',
      value: factValue(profile.facts, 'Опыт', DEMO_RESUME.experienceYears).replace(' лет', '+'),
    },
    {
      label: 'Status',
      value: 'Open',
    },
    {
      label: 'City',
      value: factValue(profile.facts, 'Город', 'Москва'),
    },
    {
      label: 'Format',
      value: factValue(profile.facts, 'Формат', 'Remote'),
    },
  ];

  return (
    <section className="portfolio-bento" id="portfolio">
      <div className="bento-shell">
        <div className="bento">
          <aside className="bento-sidebar" id="contact">
            <div className="bento-card bento-card--sidebar">
              <div
                className="bento-portrait"
                role="img"
                aria-label={`Портрет: ${profile.name}`}
                style={portraitStyle}
              />

              <div className="bento-identity">
                <h2 className="bento-name">{profile.name}</h2>
                <p className="bento-role">{profile.role}</p>
              </div>

              <p className="bento-bio">{profile.blurb}</p>

              <ul className="bento-contacts">
                <li>
                  <a href={`tel:${DEMO_RESUME.phone.replace(/\s/g, '')}`}>{DEMO_RESUME.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${DEMO_RESUME.email}`}>{DEMO_RESUME.email}</a>
                </li>
                <li>
                  <span>{factValue(profile.facts, 'Город', 'Москва')} · удалённо</span>
                </li>
              </ul>

              <a
                className="bento-qr"
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram — QR-код для быстрого контакта"
              >
                <img
                  className="bento-qr-image"
                  src={TELEGRAM_QR_SRC}
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
                <a href={`mailto:${DEMO_RESUME.email}`}>Email</a>
              </div>
            </div>
          </aside>

          <div className="bento-main">
            <div className="bento-card bento-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="bento-stat">
                  <p className="bento-stat-value">{stat.value}</p>
                  <p className="bento-stat-label">{stat.label}</p>
                </div>
              ))}
            </div>

            <article className="bento-card" id="experience">
              <header className="bento-card-head">
                <h3 className="bento-heading">Experience</h3>
                <span className="bento-meta">Timeline</span>
              </header>
              <ol className="bento-timeline">
                {DEMO_RESUME.jobs.map((job) => (
                  <li key={job.id} className="bento-timeline-item">
                    <div className="bento-timeline-marker" aria-hidden="true" />
                    <div className="bento-timeline-body">
                      <p className="bento-timeline-date">{job.period}</p>
                      <h4 className="bento-timeline-title">{job.role}</h4>
                      <p className="bento-timeline-company">
                        {job.url ? (
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            {job.company}
                          </a>
                        ) : (
                          job.company
                        )}
                        {job.location ? ` · ${job.location}` : ''}
                      </p>
                      {job.productNote ? (
                        <div className="bento-timeline-note">
                          <p>{job.productNote}</p>
                          {job.productExampleUrl ? (
                            <a
                              className="bento-timeline-example"
                              href={job.productExampleUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Публичный пример: {job.productExampleUrl}
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                      <ul className="bento-timeline-list">
                        {job.highlights.slice(0, 5).map((line) => (
                          <li key={line.slice(0, 48)}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <article className="bento-card">
              <header className="bento-card-head">
                <h3 className="bento-heading">Education</h3>
              </header>
              <ol className="bento-timeline bento-timeline--compact">
                <li className="bento-timeline-item">
                  <div className="bento-timeline-marker" aria-hidden="true" />
                  <div className="bento-timeline-body">
                    <p className="bento-timeline-date">{DEMO_RESUME.education.details}</p>
                    <h4 className="bento-timeline-title">{DEMO_RESUME.education.school}</h4>
                    <p className="bento-timeline-company">{DEMO_RESUME.education.level}</p>
                  </div>
                </li>
              </ol>
            </article>

            <div className="bento-split">
              <article className="bento-card" id="skills">
                <h3 className="bento-heading">Skills</h3>
                <ul className="bento-skill-list">
                  {skillRows.map((skill) => (
                    <li key={skill.name} className="bento-skill">
                      <div className="bento-skill-row">
                        <span className="bento-skill-name">{skill.name}</span>
                        <span className="bento-skill-pct">{skill.level}%</span>
                      </div>
                      <div className="bento-skill-track">
                        <span className="bento-skill-bar" style={{ inlineSize: `${skill.level}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </article>

              <article className="bento-card">
                <h3 className="bento-heading">Software</h3>
                <ul className="bento-software">
                  {softwarePlanets.map((planet) => (
                    <li key={planet.id} className="bento-software-item" title={planet.name}>
                      <img src={planet.icon} alt="" />
                      <span>{planet.name}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <article className="bento-card">
              <h3 className="bento-heading">About</h3>
              <div className="bento-prose">
                {profile.about.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
