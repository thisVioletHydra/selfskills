import type { CSSProperties } from 'react';

import { PROFILE } from '#app/entities/profile/profile';
import { SiteFooter } from '#app/shared/ui/SiteFooter';
import { SiteHeader } from '#app/shared/ui/SiteHeader';
import { ContactsBar } from '#app/widgets/contacts-bar/ContactsBar';
import { OrbitHero } from '#app/widgets/orbit-hero/OrbitHero';
import { ProjectsGrid } from '#app/widgets/projects-grid/ProjectsGrid';
import { SkillsBlock } from '#app/widgets/skills-block/SkillsBlock';
import '#app/pages/profile/profile-page.css';

export function ProfilePage() {
  const portraitStyle = {
    '--portrait-url': `url(${PROFILE.portrait})`,
  } as CSSProperties;

  return (
    <>
      <main>
        <OrbitHero />
        <SiteHeader />

        <section className="cosmos-section about" id="about">
          <div className="stars" aria-hidden="true" />
          <div className="persona-stage">
            <div className="persona-photo">
              <div
                className="shot"
                role="img"
                aria-label={`Портрет: ${PROFILE.name}`}
                style={portraitStyle}
              />
            </div>

            <div className="lead">
              <div className="lead-head">
                <p className="tag">{PROFILE.tag}</p>
                <h2 className="name">
                  <span className="mark">Рыбчин</span> Роман
                </h2>
                <p className="role">{PROFILE.role}</p>
              </div>
              <p className="blurb">{PROFILE.blurb}</p>
            </div>
          </div>
        </section>

        <section className="cosmos-section details" id="details">
          <div className="stars" aria-hidden="true" />
          <div className="inner">
            <div className="details-grid">
              <div className="details-block">
                <h3 className="heading">Факты</h3>
                <dl className="facts">
                  {PROFILE.facts.map((fact) => (
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
                  {PROFILE.goals.map((goal) => (
                    <li key={goal.slice(0, 32)}>{goal}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="details-about">
              <h3 className="heading">О себе</h3>
              {PROFILE.about.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="copy">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <SkillsBlock />
        <ProjectsGrid />
        <ContactsBar />
      </main>
      <SiteFooter />
    </>
  );
}
