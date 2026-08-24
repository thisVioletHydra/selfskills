import { PROJECTS } from '#app/entities/project/projects';
import '#app/widgets/projects-grid/projects-grid.css';

export function ProjectsGrid() {
  return (
    <section className="cosmos-section" id="projects">
      <div className="stars" aria-hidden="true" />
      <div className="inner">
        <p className="tag">projects</p>
        <h2 className="title">Чем занимаюсь</h2>
        <p className="sub">Короткий срез. Часть ещё в полёте — ссылки подтянутся.</p>

        <ul className="projects">
          {PROJECTS.map((project) => (
            <li key={project.id} className="item">
              <a
                className="link"
                href={project.href}
                target={project.href.startsWith('http') ? '_blank' : undefined}
                rel={project.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <h3 className="title">{project.title}</h3>
                <p className="summary">{project.summary}</p>
                <p className="stack">{project.stack.join(' · ')}</p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
