export type OrbitPresence = {
  inView: boolean;
  pageVisible: boolean;
};

type PresenceListener = (presence: OrbitPresence) => void;

const listeners = new Set<PresenceListener>();

let observed: Element | null = null;
let io: IntersectionObserver | null = null;
let presence: OrbitPresence = {
  inView: true,
  pageVisible: true,
};

function notify() {
  for (const listener of listeners) {
    listener(presence);
  }
}

function onVisibility() {
  presence = {
    ...presence,
    pageVisible: document.visibilityState === 'visible',
  };
  notify();
}

function teardownObserver() {
  if (io != null) {
    io.disconnect();
    io = null;
  }

  document.removeEventListener('visibilitychange', onVisibility);
  observed = null;
}

function ensureAttached(target: Element) {
  if (observed === target && io != null) {
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
      presence = {
        ...presence,
        inView: entry.isIntersecting && entry.intersectionRatio > 0,
      };
      notify();
    },
    { threshold: [0, 0.05], rootMargin: '0px' },
  );
  io.observe(target);
  document.addEventListener('visibilitychange', onVisibility);
}

/** One IO + visibilitychange for every orbit subscriber on the same target. */
export function subscribeOrbitPresence(target: Element, listener: PresenceListener) {
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
