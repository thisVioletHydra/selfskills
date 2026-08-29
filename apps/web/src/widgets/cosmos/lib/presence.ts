export type CosmosPresence = {
  inView: boolean;
  pageVisible: boolean;
};

type PresenceListener = (presence: CosmosPresence) => void;

const listeners = new Set<PresenceListener>();

/** Chrome Android URL-bar / IO flaps — require stable leave before inView=false. */
const LEAVE_HYSTERESIS_MS = 450;

let observed: Element | null = null;
let io: IntersectionObserver | null = null;
let leaveTimer = 0;
let presence: CosmosPresence = {
  inView: true,
  pageVisible: true,
};

function notify() {
  for (const listener of listeners) {
    listener(presence);
  }
}

function setInView(next: boolean) {
  if (presence.inView === next) {
    return;
  }

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

function onVisibility() {
  setPageVisible(document.visibilityState === 'visible');
}

/** BFCache / tab resume — force visible without waiting for a flaky visibilitychange. */
function onPageShow() {
  setPageVisible(true);
}

function teardownObserver() {
  if (io !== null && io !== undefined) {
    io.disconnect();
    io = null;
  }

  if (leaveTimer !== 0) {
    window.clearTimeout(leaveTimer);
    leaveTimer = 0;
  }

  document.removeEventListener('visibilitychange', onVisibility);
  window.removeEventListener('pageshow', onPageShow);
  observed = null;
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

  io = new IntersectionObserver(
    ([entry]) => {
      if (entry === undefined) {
        return;
      }

      const visible = entry.isIntersecting && entry.intersectionRatio > 0;

      if (visible) {
        if (leaveTimer !== 0) {
          window.clearTimeout(leaveTimer);
          leaveTimer = 0;
        }

        setInView(true);

        return;
      }

      if (!presence.inView || leaveTimer !== 0) {
        return;
      }

      leaveTimer = window.setTimeout(() => {
        leaveTimer = 0;
        setInView(false);
      }, LEAVE_HYSTERESIS_MS);
    },
    // Tall rootMargin: toolbar show/hide must not flap the hero while still on screen.
    { threshold: [0, 0.01], rootMargin: '40% 0px 40% 0px' },
  );
  io.observe(target);
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
