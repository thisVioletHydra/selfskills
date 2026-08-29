import type { RefObject } from 'react';

import { ORBIT_PLANETS } from '#web/entities/planet/planets';
import { subscribeCosmosPresence } from '#web/widgets/cosmos/lib/presence';
import { clampThrowSpeed, MAX_THROW_SPEED } from '#web/widgets/cosmos/physics/throw-constants';
import { useEffect, useLayoutEffect, useRef } from 'react';

export type BounceBody = {
  id: string;
  pointX: number;
  pointY: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  stuckAnchorX: number;
  stuckAnchorY: number;
  stuckSeconds: number;
};

const MAX_SPEED = 52;
const WALL_PADDING = 16;
const WALL_DAMPING = 0.9;
const RESTITUTION = 0.78;
const STAR_Y_RATIO = 0.42;
const SUBSTEPS = 3;
const POSITION_ITERS = 2;
const BALL_SCALE = 1.08;
const STAR_COLLISION_SCALE = 1.15;
const STUCK_SPEED_THRESHOLD = 10;
const STUCK_DRIFT_PX = 20;
const STUCK_SECONDS = 10;
const NUDGE_SPEED = 38;
const MIN_BOUNCE_SPEED = 24;

function ballRadius(size: number) {
  return (size / 2) * BALL_SCALE;
}

function starCollisionRadius(starSize: number) {
  return (starSize / 2) * STAR_COLLISION_SCALE;
}

function clampSpeed(velocityX: number, velocityY: number, maxSpeed = MAX_SPEED) {
  const speed = Math.hypot(velocityX, velocityY);
  if (speed <= maxSpeed || speed === 0) {
    return { velocityX, velocityY };
  }

  const scale = maxSpeed / speed;

  return { velocityX: velocityX * scale, velocityY: velocityY * scale };
}

export function planetTransform(pointX: number, pointY: number) {
  return `translate3d(${pointX}px, ${pointY}px, 0) translate(-50%, -50%)`;
}

export { clampThrowSpeed };

export function paintPlanets(bodies: BounceBody[], elements: Map<string, HTMLElement | null>) {
  for (const body of bodies) {
    const el = elements.get(body.id);
    if (el === null || el === undefined) {
      continue;
    }

    el.style.transform = planetTransform(body.pointX, body.pointY);
  }
}

function ensureMinSpeed(body: BounceBody, minSpeed: number) {
  const speed = Math.hypot(body.velocityX, body.velocityY);
  if (speed >= minSpeed) {
    return;
  }

  if (speed > 0.01) {
    const scale = minSpeed / speed;
    body.velocityX *= scale;
    body.velocityY *= scale;

    return;
  }

  const angle = Math.random() * Math.PI * 2;
  body.velocityX = Math.cos(angle) * minSpeed;
  body.velocityY = Math.sin(angle) * minSpeed;
}

function createBodies(width: number, height: number, starRadius: number): BounceBody[] {
  const centerX = width / 2;
  const centerY = height * STAR_Y_RATIO;

  return ORBIT_PLANETS.map((planet, index) => {
    const radius = ballRadius(planet.size);
    const angle = (index / ORBIT_PLANETS.length) * Math.PI * 2 + 0.4;
    const dist = starRadius + radius + 48 + (index % 5) * 38 + Math.floor(index / 5) * 28;

    let velocityX = (Math.random() - 0.5) * 65;
    let velocityY = (Math.random() - 0.5) * 65;
    const clamped = clampSpeed(velocityX, velocityY);
    velocityX = clamped.velocityX;
    velocityY = clamped.velocityY;

    const pointX = centerX + Math.cos(angle) * dist;
    const pointY = centerY + Math.sin(angle) * dist;

    return {
      id: planet.id,
      pointX,
      pointY,
      velocityX,
      velocityY,
      radius,
      stuckAnchorX: pointX,
      stuckAnchorY: pointY,
      stuckSeconds: 0,
    };
  });
}

function nudgeUnstuck(body: BounceBody, starX: number, starY: number, starRadius: number) {
  const deltaX = body.pointX - starX;
  const deltaY = body.pointY - starY;
  const dist = Math.hypot(deltaX, deltaY);
  const safeOrbit = starRadius + body.radius + 48;

  if (dist < safeOrbit) {
    const normalX = dist > 1 ? deltaX / dist : Math.cos(Math.random() * Math.PI * 2);
    const normalY = dist > 1 ? deltaY / dist : Math.sin(Math.random() * Math.PI * 2);
    body.velocityX = normalX * NUDGE_SPEED;
    body.velocityY = normalY * NUDGE_SPEED;
  } else {
    const normalX = dist > 1 ? deltaX / dist : 0;
    const normalY = dist > 1 ? deltaY / dist : 0;
    const tangentX = -normalY;
    const tangentY = normalX;
    const side = Math.random() > 0.5 ? 1 : -1;
    body.velocityX = tangentX * side * NUDGE_SPEED;
    body.velocityY = tangentY * side * NUDGE_SPEED;
  }

  const speed = clampSpeed(body.velocityX, body.velocityY);
  body.velocityX = speed.velocityX;
  body.velocityY = speed.velocityY;
}

function updateStuckState(
  body: BounceBody,
  starX: number,
  starY: number,
  starRadius: number,
  dt: number,
  pausedId: string | null
) {
  if (body.id === pausedId) {
    body.stuckSeconds = 0;
    body.stuckAnchorX = body.pointX;
    body.stuckAnchorY = body.pointY;

    return;
  }

  const speed = Math.hypot(body.velocityX, body.velocityY);
  const drift = Math.hypot(body.pointX - body.stuckAnchorX, body.pointY - body.stuckAnchorY);

  if (speed < STUCK_SPEED_THRESHOLD && drift < STUCK_DRIFT_PX) {
    body.stuckSeconds += dt;
  } else {
    body.stuckSeconds = 0;
    body.stuckAnchorX = body.pointX;
    body.stuckAnchorY = body.pointY;
  }

  if (body.stuckSeconds >= STUCK_SECONDS) {
    nudgeUnstuck(body, starX, starY, starRadius);
    body.stuckSeconds = 0;
    body.stuckAnchorX = body.pointX;
    body.stuckAnchorY = body.pointY;
  }
}

function bounceWalls(body: BounceBody, width: number, height: number) {
  const minX = WALL_PADDING + body.radius;
  const maxX = width - WALL_PADDING - body.radius;
  const minY = WALL_PADDING + body.radius;
  const maxY = height - WALL_PADDING - body.radius;

  if (body.pointX < minX) {
    body.pointX = minX;
    body.velocityX = Math.abs(body.velocityX) * WALL_DAMPING;
    ensureMinSpeed(body, MIN_BOUNCE_SPEED * 0.7);
  } else if (body.pointX > maxX) {
    body.pointX = maxX;
    body.velocityX = -Math.abs(body.velocityX) * WALL_DAMPING;
    ensureMinSpeed(body, MIN_BOUNCE_SPEED * 0.7);
  }

  if (body.pointY < minY) {
    body.pointY = minY;
    body.velocityY = Math.abs(body.velocityY) * WALL_DAMPING;
    ensureMinSpeed(body, MIN_BOUNCE_SPEED * 0.7);
  } else if (body.pointY > maxY) {
    body.pointY = maxY;
    body.velocityY = -Math.abs(body.velocityY) * WALL_DAMPING;
    ensureMinSpeed(body, MIN_BOUNCE_SPEED * 0.7);
  }
}

type CircleBody = {
  pointX: number;
  pointY: number;
  velocityX: number;
  velocityY: number;
  radius: number;
};

function separateCircles(
  bodyA: CircleBody,
  bodyB: CircleBody,
  bodyAStatic: boolean,
  bodyBStatic: boolean,
  normalX: number,
  normalY: number,
  overlap: number
) {
  if (bodyAStatic && bodyBStatic) {
    return;
  }

  if (bodyAStatic) {
    bodyB.pointX = bodyA.pointX + normalX * (bodyA.radius + bodyB.radius);
    bodyB.pointY = bodyA.pointY + normalY * (bodyA.radius + bodyB.radius);

    return;
  }

  if (bodyBStatic) {
    bodyA.pointX = bodyB.pointX - normalX * (bodyA.radius + bodyB.radius);
    bodyA.pointY = bodyB.pointY - normalY * (bodyA.radius + bodyB.radius);

    return;
  }

  bodyA.pointX -= normalX * overlap * 0.5;
  bodyA.pointY -= normalY * overlap * 0.5;
  bodyB.pointX += normalX * overlap * 0.5;
  bodyB.pointY += normalY * overlap * 0.5;
}

function applyImpulse(
  bodyA: CircleBody,
  bodyB: CircleBody,
  normalX: number,
  normalY: number,
  bodyAStatic: boolean,
  bodyBStatic: boolean
) {
  if (bodyAStatic && bodyBStatic) {
    return;
  }

  if (bodyAStatic) {
    const dot = bodyB.velocityX * normalX + bodyB.velocityY * normalY;
    if (dot < 0) {
      bodyB.velocityX -= (1 + RESTITUTION) * dot * normalX;
      bodyB.velocityY -= (1 + RESTITUTION) * dot * normalY;
      ensureMinSpeed(bodyB as BounceBody, MIN_BOUNCE_SPEED);
    }

    return;
  }

  if (bodyBStatic) {
    const dot = bodyA.velocityX * normalX + bodyA.velocityY * normalY;
    if (dot > 0) {
      bodyA.velocityX -= (1 + RESTITUTION) * dot * normalX;
      bodyA.velocityY -= (1 + RESTITUTION) * dot * normalY;
      ensureMinSpeed(bodyA as BounceBody, MIN_BOUNCE_SPEED);
    }

    return;
  }

  const relVelNormal = (bodyB.velocityX - bodyA.velocityX) * normalX
    + (bodyB.velocityY - bodyA.velocityY) * normalY;

  if (relVelNormal >= 0) {
    return;
  }

  const impulse = -(1 + RESTITUTION) * relVelNormal * 0.5;
  bodyA.velocityX -= impulse * normalX;
  bodyA.velocityY -= impulse * normalY;
  bodyB.velocityX += impulse * normalX;
  bodyB.velocityY += impulse * normalY;

  ensureMinSpeed(bodyA as BounceBody, MIN_BOUNCE_SPEED * 0.85);
  ensureMinSpeed(bodyB as BounceBody, MIN_BOUNCE_SPEED * 0.85);
}

function resolveCircles(
  bodyA: CircleBody,
  bodyB: CircleBody,
  bodyAStatic: boolean,
  bodyBStatic: boolean
) {
  let deltaX = bodyB.pointX - bodyA.pointX;
  let deltaY = bodyB.pointY - bodyA.pointY;
  let dist = Math.hypot(deltaX, deltaY);
  const minDist = bodyA.radius + bodyB.radius;

  if (dist === 0) {
    const angle = Math.random() * Math.PI * 2;
    deltaX = Math.cos(angle);
    deltaY = Math.sin(angle);
    dist = 1;
  }

  if (dist >= minDist) {
    return;
  }

  const normalX = deltaX / dist;
  const normalY = deltaY / dist;
  const overlap = minDist - dist + 0.35;

  separateCircles(bodyA, bodyB, bodyAStatic, bodyBStatic, normalX, normalY, overlap);
  applyImpulse(bodyA, bodyB, normalX, normalY, bodyAStatic, bodyBStatic);
}

function solveCollisions(
  bodies: BounceBody[],
  width: number,
  height: number,
  starX: number,
  starY: number,
  starRadius: number,
  pausedId: string | null
) {
  const star: CircleBody = {
    pointX: starX,
    pointY: starY,
    velocityX: 0,
    velocityY: 0,
    radius: starRadius,
  };

  for (let iter = 0; iter < POSITION_ITERS; iter++) {
    for (const body of bodies) {
      const bodyStatic = body.id === pausedId;
      if (bodyStatic === false) {
        bounceWalls(body, width, height);
      }
      resolveCircles(body, star, bodyStatic, true);
    }

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i];
        const bodyB = bodies[j];
        resolveCircles(bodyA, bodyB, bodyA.id === pausedId, bodyB.id === pausedId);
      }
    }
  }

  for (const body of bodies) {
    if (body.id === pausedId) {
      continue;
    }
    const speed = clampSpeed(body.velocityX, body.velocityY, MAX_THROW_SPEED);
    body.velocityX = speed.velocityX;
    body.velocityY = speed.velocityY;
  }
}

function step(
  bodies: BounceBody[],
  width: number,
  height: number,
  starRadius: number,
  pausedId: string | null,
  dt: number
) {
  const starX = width / 2;
  const starY = height * STAR_Y_RATIO;
  const subDt = dt / SUBSTEPS;

  for (let sub = 0; sub < SUBSTEPS; sub++) {
    for (const body of bodies) {
      if (body.id === pausedId) {
        continue;
      }

      if (sub === 0) {
        updateStuckState(body, starX, starY, starRadius, dt, pausedId);
      }

      body.pointX += body.velocityX * subDt;
      body.pointY += body.velocityY * subDt;
    }

    solveCollisions(bodies, width, height, starX, starY, starRadius, pausedId);
  }
}

export function useBouncePhysics(
  stageRef: RefObject<HTMLElement | null>,
  planetElsRef: RefObject<Map<string, HTMLElement | null>>,
  starSize: number,
  interactionId: string | null,
  motionMode: 'auto' | 'paused' = 'auto'
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
    if (stage === null || stage === undefined) {
      return;
    }

    const root = stage.closest('.cosmos-stage') ?? stage;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const starRadius = starCollisionRadius(starSize);
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

      const initial = createBodies(width, height, starRadius);
      bodiesRef.current = initial;
      paintPlanets(initial, planetElsRef.current);
    };

    init();

    if (reducedMotion) {
      root.classList.add('paused');

      return;
    }

    let raf = 0;
    let loopActive = false;
    let pauseTimer = 0;
    let last = performance.now();
    let inView = true;
    let pageVisible = document.visibilityState === 'visible';

    const shouldRun = () => motionModeRef.current === 'auto' && inView && pageVisible;

    const setPausedClass = (paused: boolean) => {
      root.classList.toggle('paused', paused);
    };

    const stopLoop = () => {
      loopActive = false;
      if (raf !== 0) {
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
        step(bodiesRef.current, width, height, starRadius, interactionRef.current, dt);
        paintPlanets(bodiesRef.current, planetElsRef.current);
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
        if (pauseTimer !== 0) {
          window.clearTimeout(pauseTimer);
          pauseTimer = 0;
        }
        startLoop();

        return;
      }

      if (pauseTimer !== 0) {
        window.clearTimeout(pauseTimer);
        pauseTimer = 0;
      }

      // User pause: freeze now. Off-screen / hidden tab: delay before freeze.
      if (motionModeRef.current === 'paused' || !loopActive) {
        stopLoop();

        return;
      }

      pauseTimer = window.setTimeout(() => {
        pauseTimer = 0;
        stopLoop();
      }, PAUSE_DELAY_MS);
    };

    syncRunningRef.current = syncRunning;

    const onResize = () => {
      init();
    };

    const unsubscribePresence = subscribeCosmosPresence(root, (next) => {
      inView = next.inView;
      pageVisible = next.pageVisible;
      syncRunning();
    });

    window.addEventListener('resize', onResize);
    syncRunning();

    return () => {
      syncRunningRef.current = () => {};
      if (pauseTimer !== 0) {
        window.clearTimeout(pauseTimer);
      }
      loopActive = false;
      cancelAnimationFrame(raf);
      unsubscribePresence();
      window.removeEventListener('resize', onResize);
      root.classList.remove('paused');
    };
  }, [stageRef, planetElsRef, starSize]);

  return { bodiesRef };
}
