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
/** Latest IO: enough of the hero is on screen. */
let intersecting = true;
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

/** Arm leave only when off-screen; any scroll resets the idle clock. */
function armLeaveAfterScrollIdle() {
  clearLeaveTimer();
  if (intersecting || !presence.inView) {
    return;
  }

  leaveTimer = window.setTimeout(() => {
    leaveTimer = 0;
    if (!intersecting) {
      setInView(false);
    }
  }, LEAVE_AFTER_SCROLL_IDLE_MS);
}

function onScroll() {
  // Scrolling: never pause. Restart the off-screen idle clock if still away.
  clearLeaveTimer();
  if (!intersecting && presence.inView) {
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

      const visible = entry.isIntersecting && entry.intersectionRatio >= MIN_RATIO;
      intersecting = visible;

      if (visible) {
        clearLeaveTimer();
        clearEnterTimer();

        if (presence.inView) {
          return;
        }

        enterTimer = window.setTimeout(() => {
          enterTimer = 0;
          if (intersecting) {
            setInView(true);
          }
        }, ENTER_HYSTERESIS_MS);

        return;
      }

      clearEnterTimer();

      if (!presence.inView) {
        return;
      }

      // Off-screen: wait until scroll is idle, then pause.
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
