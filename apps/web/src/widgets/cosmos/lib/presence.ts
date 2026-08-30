export type CosmosPresence = {
  inView: boolean;
  pageVisible: boolean;
};

type PresenceListener = (presence: CosmosPresence) => void;

const listeners = new Set<PresenceListener>();

/**
 * Pause only after hero is off-screen AND scroll has been idle this long.
 * Mid-swipe must not freeze physics (scroll-wake-11 flapped leave→stop while scrolling).
 */
const LEAVE_AFTER_SCROLL_IDLE_MS = 450;
/** Soft enter when coming back into view. */
const ENTER_HYSTERESIS_MS = 150;
const MIN_RATIO = 0.15;
/** Don't freeze on transient visibility flaps during scroll/toolbar. */
const HIDE_HYSTERESIS_MS = 600;

let observed: Element | null = null;
let io: IntersectionObserver | null = null;
let leaveTimer = 0;
let enterTimer = 0;
let hideTimer = 0;
/** IO: hero section has zero intersection with viewport (fully scrolled away). */
let heroFullyOffScreen = false;
let presence: CosmosPresence = {
  inView: true,
  pageVisible: true,
};

function notify() {
  for (const listener of listeners) {
    listener(presence);
  }
}

function syncCosmosInViewDataset(inView: boolean) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.cosmosInView = inView ? 'true' : 'false';
}

function setInView(next: boolean) {
  if (presence.inView === next) {
    return;
  }

  syncCosmosInViewDataset(next);

  presence = {
    ...presence,
    inView: next,
  };
  notify();
}

function setPageVisible(next: boolean) {
  if (presence.pageVisible === next) {
    return;
  }

  presence = {
    ...presence,
    pageVisible: next,
  };
  notify();
}

function clearLeaveTimer() {
  if (leaveTimer !== 0) {
    window.clearTimeout(leaveTimer);
    leaveTimer = 0;
  }
}

function clearEnterTimer() {
  if (enterTimer !== 0) {
    window.clearTimeout(enterTimer);
    enterTimer = 0;
  }
}

function armLeaveAfterScrollIdle() {
  clearLeaveTimer();
  if (presence.inView !== true) {
    return;
  }

  leaveTimer = window.setTimeout(() => {
    leaveTimer = 0;
    setInView(false);
  }, LEAVE_AFTER_SCROLL_IDLE_MS);
}

function onScroll() {
  clearLeaveTimer();
  if (heroFullyOffScreen && presence.inView) {
    armLeaveAfterScrollIdle();
  }
}

function onVisibility() {
  if (document.visibilityState === 'visible') {
    if (hideTimer !== 0) {
      window.clearTimeout(hideTimer);
      hideTimer = 0;
    }
    setPageVisible(true);

    return;
  }

  if (hideTimer !== 0) {
    return;
  }

  hideTimer = window.setTimeout(() => {
    hideTimer = 0;
    if (document.visibilityState !== 'visible') {
      setPageVisible(false);
    }
  }, HIDE_HYSTERESIS_MS);
}

/** BFCache / tab resume — force visible without waiting for a flaky visibilitychange. */
function onPageShow() {
  if (hideTimer !== 0) {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }
  setPageVisible(true);
}

function teardownObserver() {
  if (io !== null && io !== undefined) {
    io.disconnect();
    io = null;
  }

  clearLeaveTimer();
  clearEnterTimer();

  if (hideTimer !== 0) {
    window.clearTimeout(hideTimer);
    hideTimer = 0;
  }

  window.removeEventListener('scroll', onScroll, true);
  document.removeEventListener('visibilitychange', onVisibility);
  window.removeEventListener('pageshow', onPageShow);
  observed = null;
  syncCosmosInViewDataset(true);
}

function ensureAttached(target: Element) {
  if (observed === target && io !== null && io !== undefined) {
    return;
  }

  teardownObserver();
  observed = target;
  presence = {
    ...presence,
    pageVisible: document.visibilityState === 'visible',
  };
  syncCosmosInViewDataset(presence.inView);

  io = new IntersectionObserver(
    ([entry]) => {
      if (entry === undefined) {
        return;
      }

      const onScreenEnough = entry.isIntersecting && entry.intersectionRatio >= MIN_RATIO;
      const fullyOffScreen = !entry.isIntersecting;

      if (onScreenEnough) {
        heroFullyOffScreen = false;
        clearLeaveTimer();
        clearEnterTimer();

        if (presence.inView) {
          return;
        }

        enterTimer = window.setTimeout(() => {
          enterTimer = 0;
          if (entry.isIntersecting && entry.intersectionRatio >= MIN_RATIO) {
            setInView(true);
          }
        }, ENTER_HYSTERESIS_MS);

        return;
      }

      if (!fullyOffScreen) {
        heroFullyOffScreen = false;
        // Hero still peeks into viewport — keep running, don't arm off-screen pause.
        clearLeaveTimer();
        return;
      }

      heroFullyOffScreen = true;
      clearEnterTimer();

      if (!presence.inView) {
        return;
      }

      // Fully off-screen: wait until scroll is idle, then pause.
      armLeaveAfterScrollIdle();
    },
    { threshold: [0, 0.15, 0.25, 0.5, 1], rootMargin: '0px 0px 0px 0px' },
  );
  io.observe(target);
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pageshow', onPageShow);
}

/** One IO + visibilitychange for every cosmos subscriber on the same target. */
export function subscribeCosmosPresence(target: Element, listener: PresenceListener) {
  ensureAttached(target);
  listeners.add(listener);
  listener(presence);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0) {
      teardownObserver();
    }
  };
}
