import { useEffect, useRef, useState } from 'react';
import '#web/shared/ui/site-chrome.css';

type SiteHeaderProps = {
  brandName?: string;
};

export function SiteHeader({ brandName = 'Portfolio' }: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const header = headerRef.current;
    if (header === null || header === undefined) return;

    const update = () => {
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
        {brandName}
      </a>
      <nav className="nav">
        <a href="#hero">hero</a>
        <a href="#portfolio">portfolio</a>
        <a href="#experience">experience</a>
        <a href="#skills">skills</a>
        <a href="#contact">contact</a>
      </nav>
    </header>
  );
}
