import { resetOrbitHintState } from '#app/shared/lib/orbit-hint-state';
import '#app/shared/ui/site-chrome.css';

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-header__logo" href="#">selfskills</a>
      <nav className="site-header__nav">
        <a href="#hero">hero</a>
        <a href="#about">about</a>
        <a href="#footer">contact</a>
        <button
          type="button"
          className="site-header__hint-reset"
          onClick={() => resetOrbitHintState()}
        >
          reset hints
        </button>
      </nav>
    </header>
  );
}
