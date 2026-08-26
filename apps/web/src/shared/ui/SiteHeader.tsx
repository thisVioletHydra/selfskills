import { useEffect, useRef, useState } from 'react';
import '#web/shared/ui/site-chrome.css';

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (header === null || header === undefined) return;

    const update = () => {
      // sticky pinned only when the bar is flush with the viewport top
      setStuck(header.getBoundingClientRect().top <= 0.5);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <header ref={headerRef} className={stuck ? 'site-header is-stuck' : 'site-header'}>
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
