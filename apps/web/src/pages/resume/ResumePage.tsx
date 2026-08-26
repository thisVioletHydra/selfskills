import type { ResumeInfo } from '#app/entities/resume/resume';

import '#app/pages/resume/resume-page.css';

type ResumePageProps = {
  resume: ResumeInfo;
  onOpenPortfolio: () => void;
};

export function ResumePage({ resume, onOpenPortfolio }: ResumePageProps) {
  return (
    <div className="resume-page">
      <header className="top">
        <p className="tag">resume</p>
        <button type="button" className="to-portfolio" onClick={onOpenPortfolio}>
          К визитке
        </button>
      </header>

      <section className="hero">
        <h1 className="name">{resume.fullName}</h1>
        <p className="role">{resume.title}</p>
        <p className="meta">
          {resume.ageLine}
          <br />
          {resume.location}
        </p>
        <p className="status">
          {resume.status} · обновлено {resume.updatedAt}
        </p>
        {resume.sourceUrl != null && resume.sourceUrl !== '' && (
          <p className="source">
            Источник: <span>{resume.sourceUrl}</span>
          </p>
        )}
      </section>

      <section className="block">
        <h2 className="heading">Контакты</h2>
        <ul className="list">
          <li>
            <a href={`tel:${resume.phone.replace(/\s/g, '')}`}>{resume.phone}</a>
          </li>
          <li>
            <a href={`mailto:${resume.email}`}>{resume.email}</a>
          </li>
          <li>{resume.preferredContact}</li>
        </ul>
        <p className="meta-line">
          {resume.employment} · {resume.workFormat} · опыт {resume.experienceYears}
        </p>
      </section>

      <section className="block">
        <h2 className="heading">Обо мне</h2>
        {resume.about.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="text">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="block">
        <h2 className="heading">Опыт · {resume.experienceYears}</h2>
        <ol className="jobs">
          {resume.jobs.map((job) => (
            <li key={job.id} className="job">
              <p className="job-period">
                {job.period}
                <span> · {job.duration}</span>
              </p>
              <h3 className="job-role">{job.role}</h3>
              <p className="job-company">
                {job.url != null && job.url !== '' ? (
                  <a href={job.url} target="_blank" rel="noopener noreferrer">
                    {job.company}
                  </a>
                ) : (
                  job.company
                )}
                {job.location != null && job.location !== '' ? ` · ${job.location}` : ''}
              </p>
              {job.productNote != null && job.productNote !== '' && (
                <p className="text">{job.productNote}</p>
              )}
              <p className="stack">{job.stack.join(' · ')}</p>
              <ul className="highlights">
                {job.highlights.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="block">
        <h2 className="heading">Навыки</h2>
        <ul className="chips">
          {resume.skills.map((skill) => (
            <li key={skill} className="chip">
              {skill}
            </li>
          ))}
        </ul>
      </section>

      <section className="block">
        <h2 className="heading">Портфолио</h2>
        <ul className="list">
          {resume.portfolio.map((item) => (
            <li key={item.href}>
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="block">
        <h2 className="heading">Образование</h2>
        <p className="text">
          {resume.education.level}
          <br />
          {resume.education.school}
          <br />
          {resume.education.details}
        </p>
        {resume.courses.map((course) => (
          <p key={course} className="text">
            {course}
          </p>
        ))}
      </section>
    </div>
  );
}
