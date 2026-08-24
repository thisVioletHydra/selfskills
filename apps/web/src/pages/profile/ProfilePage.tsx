import { PROFILE } from '#app/entities/profile/profile';
import { SiteFooter } from '#app/shared/ui/SiteFooter';
import { SiteHeader } from '#app/shared/ui/SiteHeader';
import { ContactsBar } from '#app/widgets/contacts-bar/ContactsBar';
import { OrbitHero } from '#app/widgets/orbit-hero/OrbitHero';
import { ProjectsGrid } from '#app/widgets/projects-grid/ProjectsGrid';
import { SkillsBlock } from '#app/widgets/skills-block/SkillsBlock';
import '#app/pages/profile/profile-page.css';

export function ProfilePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <OrbitHero />

        <section className="cosmos-section about" id="about">
          <div className="stars" aria-hidden="true" />
          <div className="persona">
            <div className="shot">
              <img
                className="portrait"
                src={PROFILE.portrait}
                alt={`Портрет: ${PROFILE.name}`}
                width={640}
                height={960}
              />
            </div>

            <div className="sheet">
              <p className="tag">{PROFILE.tag}</p>
              <h2 className="name">{PROFILE.name}</h2>
              <p className="role">{PROFILE.role}</p>
              <p className="blurb">{PROFILE.blurb}</p>

              <div className="cols">
                <div className="col">
                  <h3 className="heading">Факты</h3>
                  <dl className="facts">
                    {PROFILE.facts.map((fact) => (
                      <div key={fact.label} className="fact">
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <h3 className="heading">Куда целился</h3>
                  <ul className="goals">
                    {PROFILE.goals.map((goal) => (
                      <li key={goal.slice(0, 32)}>{goal}</li>
                    ))}
                  </ul>
                </div>

                <div className="col">
                  <h3 className="heading">О себе</h3>
                  {PROFILE.about.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="copy">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
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
