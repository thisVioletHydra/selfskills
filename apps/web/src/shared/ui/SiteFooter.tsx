import '#web/shared/ui/site-chrome.css';

export function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <p className="stack-credits">
        <span>Фронтенд собран на React через Vite (TypeScript)</span>
        <span className="stack-credits-sep" aria-hidden="true">
          ·
        </span>
        <span>Бэкенд — NestJS, GraphQL, Prisma, PostgreSQL</span>
        <span className="stack-credits-sep" aria-hidden="true">
          ·
        </span>
        <span>Инфра — Docker Compose, PostgreSQL в контейнере</span>
      </p>
    </footer>
  );
}
