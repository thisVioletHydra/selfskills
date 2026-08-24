import '#app/shared/ui/site-chrome.css';

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="logo" href="#hero">
        selfskills
      </a>
      <nav className="nav">
        <a href="#about">about</a>
        <a href="#skills">skills</a>
        <a href="#projects">projects</a>
        <a href="#contact">contact</a>
      </nav>
    </header>
  );
}
