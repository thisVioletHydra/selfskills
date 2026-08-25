import { useEffect, useRef, useState } from 'react';
import '#app/shared/ui/site-chrome.css';

export function SiteHeader() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setStuck(!entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="site-header-sentinel" aria-hidden="true" />
      <header className={stuck ? 'site-header is-stuck' : 'site-header'}>
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
    </>
  );
}
