import type { RefObject } from 'react';

import { useEffect, useLayoutEffect, useState } from 'react';

type UseBentoMotionOptions = {
  enabled: boolean;
  sectionRef: RefObject<HTMLElement | null>;
};

const SOFTWARE_AFTER_SKILLS_MS = 380;
/** Soft icons flip first; only then we may unlock about. */
const ABOUT_AFTER_SOFTWARE_MS = 680;

const BLOCK_IO: IntersectionObserverInit = {
  threshold: 0.18,
  rootMargin: '0px 0px -12% 0px',
};

const ABOUT_IO: IntersectionObserverInit = {
  threshold: 0.28,
  rootMargin: '0px 0px -18% 0px',
};

/** Real scroll into bento — not the peek strip under cosmos (that killed «листай»). */
const MAIN_IO: IntersectionObserverInit = {
  threshold: [0, 0.1, 0.18, 0.28],
  rootMargin: '0px 0px -14% 0px',
};

const MAIN_REVEAL_RATIO = 0.12;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True only when enough of the node sits in the viewport — peek strip alone is not enough. */
function isMainReadyToReveal(node: Element) {
  const rect = node.getBoundingClientRect();
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;

  return rect.top < viewHeight * 0.7 && rect.bottom > viewHeight * 0.22;
}

function observeOnce(
  node: Element,
  onEnter: () => void,
  options: IntersectionObserverInit,
  minRatio = 0,
): IntersectionObserver {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting !== true) {
      return;
    }

    if (minRatio > 0 && entry.intersectionRatio < minRatio) {
      return;
    }

    onEnter();
    observer.disconnect();
  }, options);

  observer.observe(node);
  return observer;
}

export function useBentoMotion({ enabled, sectionRef }: UseBentoMotionOptions) {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [revealed, setRevealed] = useState(false);
  const [experienceActive, setExperienceActive] = useState(false);
  const [educationActive, setEducationActive] = useState(false);
  const [aboutActive, setAboutActive] = useState(false);
  const [skillsActive, setSkillsActive] = useState(false);
  const [softwareActive, setSoftwareActive] = useState(false);
  const [aboutUnlocked, setAboutUnlocked] = useState(false);

  useLayoutEffect(() => {
    if (!enabled || reducedMotion || revealed) {
      return;
    }

    const section = sectionRef.current;
    if (section === null || section === undefined) {
      return;
    }

    const mainNode = section.querySelector('.bento-main');
    if (mainNode !== null && isMainReadyToReveal(mainNode)) {
      setRevealed(true);
    }
  }, [enabled, reducedMotion, revealed, sectionRef]);

  useEffect(() => {
    if (!enabled || reducedMotion) {
      return;
    }

    const section = sectionRef.current;
    if (section === null || section === undefined) {
      return;
    }

    const observers: IntersectionObserver[] = [];

    const mainNode = section.querySelector('.bento-main');
    if (mainNode !== null && !revealed) {
      observers.push(
        observeOnce(
          mainNode,
          () => {
            setRevealed(true);
          },
          MAIN_IO,
          MAIN_REVEAL_RATIO,
        ),
      );
    }

    const blocks: Array<[string, () => void]> = [
      ['#experience', () => setExperienceActive(true)],
      ['#education', () => setEducationActive(true)],
      ['#skills', () => setSkillsActive(true)],
    ];

    for (const [selector, activate] of blocks) {
      const node = section.querySelector(selector);
      if (node === null) {
        continue;
      }

      observers.push(observeOnce(node, activate, BLOCK_IO));
    }

    return () => {
      for (const observer of observers) {
        observer.disconnect();
      }
    };
  }, [enabled, reducedMotion, revealed, sectionRef]);

  useEffect(() => {
    if (!enabled || reducedMotion || !skillsActive || softwareActive) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSoftwareActive(true);
    }, SOFTWARE_AFTER_SKILLS_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [enabled, reducedMotion, skillsActive, softwareActive]);

  useEffect(() => {
    if (!enabled || reducedMotion || !softwareActive || aboutUnlocked) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setAboutUnlocked(true);
    }, ABOUT_AFTER_SOFTWARE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [aboutUnlocked, enabled, reducedMotion, softwareActive]);

  useEffect(() => {
    if (!enabled || reducedMotion || !aboutUnlocked || aboutActive) {
      return;
    }

    const section = sectionRef.current;
    if (section === null || section === undefined) {
      return;
    }

    const aboutNode = section.querySelector('#about');
    if (aboutNode === null) {
      return;
    }

    const observer = observeOnce(
      aboutNode,
      () => setAboutActive(true),
      ABOUT_IO,
    );

    return () => observer.disconnect();
  }, [aboutActive, aboutUnlocked, enabled, reducedMotion, sectionRef]);

  if (reducedMotion) {
    return {
      revealed: true,
      experienceActive: true,
      educationActive: true,
      aboutActive: true,
      skillsActive: true,
      softwareActive: true,
    };
  }

  return { revealed, experienceActive, educationActive, aboutActive, skillsActive, softwareActive };
}
