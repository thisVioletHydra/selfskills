import type { RefObject } from "react";

import { ORBIT_TECH } from "#app/entities/skill/tech-stack";
import { useEffect, useLayoutEffect, useRef } from "react";

export type BounceBody = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  stuckAnchorX: number;
  stuckAnchorY: number;
  stuckSeconds: number;
};

const MAX_SPEED = 52;
const MAX_THROW_SPEED = 320;
const WALL_PADDING = 16;
const WALL_DAMPING = 0.9;
const RESTITUTION = 0.78;
const NUCLEUS_Y_RATIO = 0.42;
const SUBSTEPS = 3;
const POSITION_ITERS = 2;
const BALL_SCALE = 1.08;
const SUN_COLLISION_SCALE = 1.15;
const STUCK_SPEED_THRESHOLD = 10;
const STUCK_DRIFT_PX = 20;
const STUCK_SECONDS = 10;
const NUDGE_SPEED = 38;
const MIN_BOUNCE_SPEED = 24;

function ballRadius(size: number) {
  return (size / 2) * BALL_SCALE;
}

function sunCollisionRadius(nucleusSize: number) {
  return (nucleusSize / 2) * SUN_COLLISION_SCALE;
}

function clampSpeed(vx: number, vy: number, maxSpeed = MAX_SPEED) {
  const speed = Math.hypot(vx, vy);
  if (speed <= maxSpeed || speed === 0) {
    return { vx, vy };
  }

  const scale = maxSpeed / speed;

  return { vx: vx * scale, vy: vy * scale };
}

export function clampThrowSpeed(vx: number, vy: number) {
  return clampSpeed(vx, vy, MAX_THROW_SPEED);
}

export function satelliteTransform(x: number, y: number) {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
}

export function paintSatellites(bodies: BounceBody[], elements: Map<string, HTMLElement | null>) {
  for (const body of bodies) {
    const el = elements.get(body.id);
    if (!el) {
      continue;
    }

    el.style.transform = satelliteTransform(body.x, body.y);
  }
}

function ensureMinSpeed(body: BounceBody, minSpeed: number) {
  const speed = Math.hypot(body.vx, body.vy);
  if (speed >= minSpeed) {
    return;
  }

  if (speed > 0.01) {
    const scale = minSpeed / speed;
    body.vx *= scale;
    body.vy *= scale;

    return;
  }

  const angle = Math.random() * Math.PI * 2;
  body.vx = Math.cos(angle) * minSpeed;
  body.vy = Math.sin(angle) * minSpeed;
}

function createBodies(width: number, height: number, sunRadius: number): BounceBody[] {
  const cx = width / 2;
  const cy = height * NUCLEUS_Y_RATIO;

  return ORBIT_TECH.map((tech, index) => {
    const radius = ballRadius(tech.size);
    const angle = (index / ORBIT_TECH.length) * Math.PI * 2 + 0.4;
    const dist = sunRadius + radius + 48 + (index % 5) * 38 + Math.floor(index / 5) * 28;

    let vx = (Math.random() - 0.5) * 65;
    let vy = (Math.random() - 0.5) * 65;
    const clamped = clampSpeed(vx, vy);
    vx = clamped.vx;
    vy = clamped.vy;

    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;

    return {
      id: tech.id,
      x,
      y,
      vx,
      vy,
      radius,
      stuckAnchorX: x,
      stuckAnchorY: y,
      stuckSeconds: 0,
    };
  });
}

function nudgeUnstuck(body: BounceBody, sunX: number, sunY: number, sunRadius: number) {
  const dx = body.x - sunX;
  const dy = body.y - sunY;
  const dist = Math.hypot(dx, dy);
  const safeOrbit = sunRadius + body.radius + 48;

  if (dist < safeOrbit) {
    const nx = dist > 1 ? dx / dist : Math.cos(Math.random() * Math.PI * 2);
    const ny = dist > 1 ? dy / dist : Math.sin(Math.random() * Math.PI * 2);
    body.vx = nx * NUDGE_SPEED;
    body.vy = ny * NUDGE_SPEED;
  } else {
    const nx = dist > 1 ? dx / dist : 0;
    const ny = dist > 1 ? dy / dist : 0;
    const tangentX = -ny;
    const tangentY = nx;
    const side = Math.random() > 0.5 ? 1 : -1;
    body.vx = tangentX * side * NUDGE_SPEED;
    body.vy = tangentY * side * NUDGE_SPEED;
  }

  const speed = clampSpeed(body.vx, body.vy);
  body.vx = speed.vx;
  body.vy = speed.vy;
}

function updateStuckState(
  body: BounceBody,
  sunX: number,
  sunY: number,
  sunRadius: number,
  dt: number,
  pausedId: string | null,
) {
  if (body.id === pausedId) {
    body.stuckSeconds = 0;
    body.stuckAnchorX = body.x;
    body.stuckAnchorY = body.y;

    return;
  }

  const speed = Math.hypot(body.vx, body.vy);
  const drift = Math.hypot(body.x - body.stuckAnchorX, body.y - body.stuckAnchorY);

  if (speed < STUCK_SPEED_THRESHOLD && drift < STUCK_DRIFT_PX) {
    body.stuckSeconds += dt;
  } else {
    body.stuckSeconds = 0;
    body.stuckAnchorX = body.x;
    body.stuckAnchorY = body.y;
  }

  if (body.stuckSeconds >= STUCK_SECONDS) {
    nudgeUnstuck(body, sunX, sunY, sunRadius);
    body.stuckSeconds = 0;
    body.stuckAnchorX = body.x;
    body.stuckAnchorY = body.y;
  }
}

function bounceWalls(body: BounceBody, width: number, height: number) {
  const minX = WALL_PADDING + body.radius;
  const maxX = width - WALL_PADDING - body.radius;
  const minY = WALL_PADDING + body.radius;
  const maxY = height - WALL_PADDING - body.radius;

  if (body.x < minX) {
    body.x = minX;
    body.vx = Math.abs(body.vx) * WALL_DAMPING;
    ensureMinSpeed(body, MIN_BOUNCE_SPEED * 0.7);
  } else if (body.x > maxX) {
    body.x = maxX;
    body.vx = -Math.abs(body.vx) * WALL_DAMPING;
    ensureMinSpeed(body, MIN_BOUNCE_SPEED * 0.7);
  }

  if (body.y < minY) {
    body.y = minY;
    body.vy = Math.abs(body.vy) * WALL_DAMPING;
    ensureMinSpeed(body, MIN_BOUNCE_SPEED * 0.7);
  } else if (body.y > maxY) {
    body.y = maxY;
    body.vy = -Math.abs(body.vy) * WALL_DAMPING;
    ensureMinSpeed(body, MIN_BOUNCE_SPEED * 0.7);
  }
}

type CircleBody = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

function separateCircles(
  a: CircleBody,
  b: CircleBody,
  aStatic: boolean,
  bStatic: boolean,
  nx: number,
  ny: number,
  overlap: number,
) {
  if (aStatic && bStatic) {
    return;
  }

  if (aStatic) {
    b.x = a.x + nx * (a.radius + b.radius);
    b.y = a.y + ny * (a.radius + b.radius);

    return;
  }

  if (bStatic) {
    a.x = b.x - nx * (a.radius + b.radius);
    a.y = b.y - ny * (a.radius + b.radius);

    return;
  }

  a.x -= nx * overlap * 0.5;
  a.y -= ny * overlap * 0.5;
  b.x += nx * overlap * 0.5;
  b.y += ny * overlap * 0.5;
}

function applyImpulse(
  a: CircleBody,
  b: CircleBody,
  nx: number,
  ny: number,
  aStatic: boolean,
  bStatic: boolean,
) {
  if (aStatic && bStatic) {
    return;
  }

  if (aStatic) {
    const dot = b.vx * nx + b.vy * ny;
    if (dot < 0) {
      b.vx -= (1 + RESTITUTION) * dot * nx;
      b.vy -= (1 + RESTITUTION) * dot * ny;
      ensureMinSpeed(b as BounceBody, MIN_BOUNCE_SPEED);
    }

    return;
  }

  if (bStatic) {
    const dot = a.vx * nx + a.vy * ny;
    if (dot > 0) {
      a.vx -= (1 + RESTITUTION) * dot * nx;
      a.vy -= (1 + RESTITUTION) * dot * ny;
      ensureMinSpeed(a as BounceBody, MIN_BOUNCE_SPEED);
    }

    return;
  }

  const relVelNormal = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;

  if (relVelNormal >= 0) {
    return;
  }

  const impulse = -(1 + RESTITUTION) * relVelNormal * 0.5;
  a.vx -= impulse * nx;
  a.vy -= impulse * ny;
  b.vx += impulse * nx;
  b.vy += impulse * ny;

  ensureMinSpeed(a as BounceBody, MIN_BOUNCE_SPEED * 0.85);
  ensureMinSpeed(b as BounceBody, MIN_BOUNCE_SPEED * 0.85);
}

function resolveCircles(a: CircleBody, b: CircleBody, aStatic: boolean, bStatic: boolean) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;

  if (dist === 0) {
    const angle = Math.random() * Math.PI * 2;
    dx = Math.cos(angle);
    dy = Math.sin(angle);
    dist = 1;
  }

  if (dist >= minDist) {
    return;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minDist - dist + 0.35;

  separateCircles(a, b, aStatic, bStatic, nx, ny, overlap);
  applyImpulse(a, b, nx, ny, aStatic, bStatic);
}

function solveCollisions(
  bodies: BounceBody[],
  width: number,
  height: number,
  sunX: number,
  sunY: number,
  sunRadius: number,
  pausedId: string | null,
) {
  const sun: CircleBody = {
    x: sunX,
    y: sunY,
    vx: 0,
    vy: 0,
    radius: sunRadius,
  };

  for (let iter = 0; iter < POSITION_ITERS; iter++) {
    for (const body of bodies) {
      const bodyStatic = body.id === pausedId;
      if (!bodyStatic) {
        bounceWalls(body, width, height);
      }
      resolveCircles(body, sun, bodyStatic, true);
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        resolveCircles(a, b, a.id === pausedId, b.id === pausedId);
      }
    }
  }

  for (const body of bodies) {
    if (body.id === pausedId) {
      continue;
    }
    const speed = clampSpeed(body.vx, body.vy, MAX_THROW_SPEED);
    body.vx = speed.vx;
    body.vy = speed.vy;
  }
}

function step(
  bodies: BounceBody[],
  width: number,
  height: number,
  sunRadius: number,
  pausedId: string | null,
  dt: number,
) {
  const sunX = width / 2;
  const sunY = height * NUCLEUS_Y_RATIO;
  const subDt = dt / SUBSTEPS;

  for (let sub = 0; sub < SUBSTEPS; sub++) {
    for (const body of bodies) {
      if (body.id === pausedId) {
        continue;
      }

      if (sub === 0) {
        updateStuckState(body, sunX, sunY, sunRadius, dt, pausedId);
      }

      body.x += body.vx * subDt;
      body.y += body.vy * subDt;
    }

    solveCollisions(bodies, width, height, sunX, sunY, sunRadius, pausedId);
  }
}

export function useBouncePhysics(
  stageRef: RefObject<HTMLElement | null>,
  satelliteElsRef: RefObject<Map<string, HTMLElement | null>>,
  nucleusSize: number,
  interactionId: string | null,
  motionMode: "auto" | "paused" = "auto",
) {
  const bodiesRef = useRef<BounceBody[]>([]);
  const interactionRef = useRef(interactionId);
  const motionModeRef = useRef(motionMode);
  const sizeRef = useRef({ width: 0, height: 0 });
  const syncRunningRef = useRef<() => void>(() => {});

  useEffect(() => {
    interactionRef.current = interactionId;
  }, [interactionId]);

  useEffect(() => {
    motionModeRef.current = motionMode;
    syncRunningRef.current();
  }, [motionMode]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const root = stage.closest(".orbit-hero") ?? stage;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sunRadius = sunCollisionRadius(nucleusSize);
    const PAUSE_DELAY_MS = 1000;

    const measure = () => {
      const { width, height } = stage.getBoundingClientRect();
      sizeRef.current = { width, height };

      return sizeRef.current;
    };

    const init = () => {
      const { width, height } = measure();
      if (width === 0 || height === 0) {
        return;
      }

      const initial = createBodies(width, height, sunRadius);
      bodiesRef.current = initial;
      paintSatellites(initial, satelliteElsRef.current);
    };

    init();

    if (reducedMotion) {
      root.classList.add("paused");

      return;
    }

    let raf = 0;
    let loopActive = false;
    let pauseTimer = 0;
    let last = performance.now();
    let inView = true;
    let pageVisible = document.visibilityState === "visible";

    const shouldRun = () =>
      motionModeRef.current === "auto" && inView && pageVisible;

    const setPausedClass = (paused: boolean) => {
      root.classList.toggle("paused", paused);
    };

    const stopLoop = () => {
      loopActive = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      setPausedClass(true);
    };

    const tick = (now: number) => {
      if (!shouldRun()) {
        stopLoop();

        return;
      }

      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;

      const { width, height } = sizeRef.current;
      if (width > 0 && height > 0 && bodiesRef.current.length > 0) {
        step(bodiesRef.current, width, height, sunRadius, interactionRef.current, dt);
        paintSatellites(bodiesRef.current, satelliteElsRef.current);
      }

      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (loopActive || !shouldRun()) {
        return;
      }

      loopActive = true;
      setPausedClass(false);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const syncRunning = () => {
      if (shouldRun()) {
        if (pauseTimer) {
          window.clearTimeout(pauseTimer);
          pauseTimer = 0;
        }
        startLoop();

        return;
      }

      if (pauseTimer) {
        window.clearTimeout(pauseTimer);
        pauseTimer = 0;
      }

      // User pause: freeze now. Off-screen / hidden tab: delay before freeze.
      if (motionModeRef.current === "paused" || !loopActive) {
        stopLoop();

        return;
      }

      pauseTimer = window.setTimeout(() => {
        pauseTimer = 0;
        stopLoop();
      }, PAUSE_DELAY_MS);
    };

    syncRunningRef.current = syncRunning;

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio > 0;
        syncRunning();
      },
      { threshold: [0, 0.05], rootMargin: "0px" },
    );
    io.observe(root);

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      syncRunning();
    };

    const onResize = () => {
      init();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    syncRunning();

    return () => {
      syncRunningRef.current = () => {};
      if (pauseTimer) {
        window.clearTimeout(pauseTimer);
      }
      loopActive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      root.classList.remove("paused");
    };
  }, [stageRef, satelliteElsRef, nucleusSize]);

  return { bodiesRef };
}
