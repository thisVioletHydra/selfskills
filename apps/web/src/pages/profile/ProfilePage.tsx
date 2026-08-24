import { AccentBar } from '#app/shared/ui/AccentBar';
import { SiteFooter } from '#app/shared/ui/SiteFooter';
import { SiteHeader } from '#app/shared/ui/SiteHeader';
import { OrbitHero } from '#app/widgets/orbit-hero/OrbitHero';
import '#app/pages/profile/profile-page.css';

export function ProfilePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <OrbitHero />
        <AccentBar />
        <section className="content-block" id="about">
          <div className="content-block__inner">
            <h2>Лорем на чёрном</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              TypeScript, Node, React, Vue, Angular, Svelte — общий фундамент. Дальше сюда подтянем данные
              с GraphQL и Nest, когда заведём бэкенд.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
