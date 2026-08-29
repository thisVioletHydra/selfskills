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
const STAR_Y_RATIO_COMPACT = 0.34;
const SUBSTEPS = 3;
const SUBSTEPS_COMPACT = 1;
const POSITION_ITERS = 2;
const POSITION_ITERS_COMPACT = 1;
const BALL_SCALE = 1.08;
const BALL_SCALE_COMPACT = 0.92;
const STAR_COLLISION_SCALE = 1.15;
const STUCK_SPEED_THRESHOLD = 10;
const STUCK_DRIFT_PX = 20;
const STUCK_SECONDS = 10;
const NUDGE_SPEED = 38;
const MIN_BOUNCE_SPEED = 24;
const COMPACT_WIDTH_PX = 768;
/** Ignore Chrome collapse / zero layout frames — never scale from these. */
const MIN_LAYOUT_PX = 48;
const WALL_PADDING_COMPACT = 6;
/** Insane scale after bfcache/toolbar = clamp-only. */
const MAX_SCALE_JUMP = 2.5;

function isCompactWidth(width: number) {
  return width > 0 && width < COMPACT_WIDTH_PX;
}

function wallPadding(compact: boolean) {
  return compact ? WALL_PADDING_COMPACT : WALL_PADDING;
}

function isUsableLayout(width: number, height: number) {
  return width >= MIN_LAYOUT_PX && height >= MIN_LAYOUT_PX;
}

function ballRadius(size: number, compact: boolean) {
  return (size / 2) * (compact ? BALL_SCALE_COMPACT : BALL_SCALE);
}

function starYRatio(compact: boolean) {
  return compact ? STAR_Y_RATIO_COMPACT : STAR_Y_RATIO;
}

function orbitPlanetsForWidth(width: number) {
  // Half the flock on phones — 20×N² collisions cook the GPU for no UX gain.
  if (isCompactWidth(width)) {
    return ORBIT_PLANETS.filter((_, index) => index % 2 === 0);
  }

  return ORBIT_PLANETS;
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

/** Layout left/top so Android hit-tests match the visual (transform-only breaks taps). */
export function paintPlanetPosition(el: HTMLElement, pointX: number, pointY: number) {
  const prevX = Number(el.dataset.px ?? Number.NaN);
  const prevY = Number(el.dataset.py ?? Number.NaN);
  if (
    Number.isFinite(prevX)
    && Number.isFinite(prevY)
    && Math.abs(prevX - pointX) < 0.45
    && Math.abs(prevY - pointY) < 0.45
  ) {
    return;
  }

  el.dataset.px = String(pointX);
  el.dataset.py = String(pointY);
  el.style.left = `${pointX}px`;
  el.style.top = `${pointY}px`;
  el.style.transform = 'translate(-50%, -50%)';
  el.dataset.positioned = '1';
}

/** @deprecated Prefer paintPlanetPosition — kept for any transform-only callers. */
export function planetTransform(pointX: number, pointY: number) {
  return `translate3d(${pointX}px, ${pointY}px, 0) translate(-50%, -50%)`;
}

export { clampThrowSpeed, orbitPlanetsForWidth, COMPACT_WIDTH_PX };

export function paintPlanets(bodies: BounceBody[], elements: Map<string, HTMLElement | null>) {
  for (const body of bodies) {
    const el = elements.get(body.id);
    if (el === null || el === undefined) {
      continue;
    }

    paintPlanetPosition(el, body.pointX, body.pointY);
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

function createBodies(
  width: number,
  height: number,
  starRadius: number,
  floorInset: number,
): BounceBody[] {
  const compact = isCompactWidth(width);
  const pad = wallPadding(compact);
  const centerX = width / 2;
  const centerY = height * starYRatio(compact);
  const planets = orbitPlanetsForWidth(width);

  return planets.map((planet, index) => {
    const radius = ballRadius(planet.size, compact);
    const angle = (index / planets.length) * Math.PI * 2 + 0.35;

    // Ellipse almost to stage edges (mobile: full width, not a tight center cluster).
    const maxRx = Math.max(width / 2 - pad - radius, starRadius + radius + 16);
    const maxRyTop = Math.max(centerY - pad - radius, starRadius + radius + 12);
    const maxRyBot = Math.max(height - centerY - pad - radius, starRadius + radius + 12);
    const maxRy = Math.min(maxRyTop, maxRyBot);
    const ring = compact
      ? 0.9 + (index % 4) * 0.025
      : 0.55 + (index % 5) * 0.07 + Math.floor(index / 5) * 0.04;

    let velocityX = (Math.random() - 0.5) * 65;
    let velocityY = (Math.random() - 0.5) * 65;
    const clamped = clampSpeed(velocityX, velocityY);
    velocityX = clamped.velocityX;
    velocityY = clamped.velocityY;

    const pointX = centerX + Math.cos(angle) * maxRx * ring;
    const pointY = centerY + Math.sin(angle) * maxRy * ring;

    const body: BounceBody = {
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

    clampBodyToStage(body, width, height, floorInset);

    return body;
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

function clampBodyToStage(body: BounceBody, width: number, height: number, floorInset: number) {
  const compact = isCompactWidth(width);
  const pad = wallPadding(compact);
  const playHeight = Math.max(height - floorInset, height * 0.45);
  const minX = pad + body.radius;
  const maxX = width - pad - body.radius;
  const minY = pad + body.radius;
  const maxY = playHeight - pad - body.radius;

  body.pointX = Math.min(Math.max(body.pointX, minX), maxX);
  body.pointY = Math.min(Math.max(body.pointY, minY), maxY);
  body.stuckAnchorX = Math.min(Math.max(body.stuckAnchorX, minX), maxX);
  body.stuckAnchorY = Math.min(Math.max(body.stuckAnchorY, minY), maxY);
}

function scaleBodiesToSize(
  bodies: BounceBody[],
  prevWidth: number,
  prevHeight: number,
  nextWidth: number,
  nextHeight: number,
  starRadius: number,
  floorInset: number,
) {
  if (
    !isUsableLayout(prevWidth, prevHeight) ||
    !isUsableLayout(nextWidth, nextHeight)
  ) {
    return;
  }

  const scaleX = nextWidth / prevWidth;
  const scaleY = nextHeight / prevHeight;

  // Chrome toolbar / zero→full frames: never blow up positions.
  if (
    scaleX > MAX_SCALE_JUMP ||
    scaleX < 1 / MAX_SCALE_JUMP ||
    scaleY > MAX_SCALE_JUMP ||
    scaleY < 1 / MAX_SCALE_JUMP
  ) {
    for (const body of bodies) {
      clampBodyToStage(body, nextWidth, nextHeight, floorInset);
    }

    return;
  }

  const compact = isCompactWidth(nextWidth);
  const playHeight = Math.max(nextHeight - floorInset, nextHeight * 0.45);
  const starX = nextWidth / 2;
  const starY = playHeight * starYRatio(compact);

  for (const body of bodies) {
    body.pointX *= scaleX;
    body.pointY *= scaleY;
    body.stuckAnchorX *= scaleX;
    body.stuckAnchorY *= scaleY;
    clampBodyToStage(body, nextWidth, nextHeight, floorInset);

    const deltaX = body.pointX - starX;
    const deltaY = body.pointY - starY;
    const dist = Math.hypot(deltaX, deltaY);
    const minDist = starRadius + body.radius + 4;

    if (dist > 0 && dist < minDist) {
      const push = minDist / dist;
      body.pointX = starX + deltaX * push;
      body.pointY = starY + deltaY * push;
      clampBodyToStage(body, nextWidth, nextHeight, floorInset);
    }
  }
}

function bounceWalls(body: BounceBody, width: number, height: number, floorInset: number) {
  const compact = isCompactWidth(width);
  const pad = wallPadding(compact);
  const playHeight = Math.max(height - floorInset, height * 0.45);
  const minX = pad + body.radius;
  const maxX = width - pad - body.radius;
  const minY = pad + body.radius;
  const maxY = playHeight - pad - body.radius;

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
  pausedId: string | null,
  floorInset: number,
  positionIters: number,
) {
  const star: CircleBody = {
    pointX: starX,
    pointY: starY,
    velocityX: 0,
    velocityY: 0,
    radius: starRadius,
  };

  for (let iter = 0; iter < positionIters; iter++) {
    for (const body of bodies) {
      const bodyStatic = body.id === pausedId;
      if (bodyStatic === false) {
        bounceWalls(body, width, height, floorInset);
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
  dt: number,
  floorInset: number,
) {
  const compact = isCompactWidth(width);
  const playHeight = Math.max(height - floorInset, height * 0.45);
  const starX = width / 2;
  const starY = playHeight * starYRatio(compact);
  const substeps = compact ? SUBSTEPS_COMPACT : SUBSTEPS;
  const positionIters = compact ? POSITION_ITERS_COMPACT : POSITION_ITERS;
  const subDt = dt / substeps;

  for (let sub = 0; sub < substeps; sub++) {
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

    solveCollisions(
      bodies,
      width,
      height,
      starX,
      starY,
      starRadius,
      pausedId,
      floorInset,
      positionIters,
    );
  }
}

export function useBouncePhysics(
  stageRef: RefObject<HTMLElement | null>,
  planetElsRef: RefObject<Map<string, HTMLElement | null>>,
  starSize: number,
  interactionId: string | null,
  motionMode: 'auto' | 'paused' = 'auto',
  suspendPhysics = false,
) {
  const bodiesRef = useRef<BounceBody[]>([]);
  const interactionRef = useRef(interactionId);
  const motionModeRef = useRef(motionMode);
  const suspendRef = useRef(suspendPhysics);
  const sizeRef = useRef({ width: 0, height: 0 });
  const floorInsetRef = useRef(0);
  const syncRunningRef = useRef<() => void>(() => {});

  useEffect(() => {
    interactionRef.current = interactionId;
  }, [interactionId]);

  useEffect(() => {
    motionModeRef.current = motionMode;
    syncRunningRef.current();
  }, [motionMode]);

  useEffect(() => {
    suspendRef.current = suspendPhysics;
    syncRunningRef.current();
  }, [suspendPhysics]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (stage === null || stage === undefined) {
      return;
    }

    const root = stage.closest('.cosmos-stage') ?? stage;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const starRadius = starCollisionRadius(starSize);
    const PAUSE_DELAY_MS = 1000;

    const measureFloorInset = (_height: number) => {
      // Planets may cross hero copy — no soft floor.
      floorInsetRef.current = 0;

      return 0;
    };

    const measure = () => {
      const { width, height } = stage.getBoundingClientRect();
      sizeRef.current = { width, height };
      measureFloorInset(height);

      return sizeRef.current;
    };

    const spawnBodies = (width: number, height: number) => {
      const floorInset = measureFloorInset(height);
      const initial = createBodies(width, height, starRadius, floorInset);
      bodiesRef.current = initial;
      paintPlanets(initial, planetElsRef.current);
    };

    const init = () => {
      const { width, height } = measure();
      if (!isUsableLayout(width, height)) {
        return;
      }

      spawnBodies(width, height);
    };

    init();

    // Copy lays out after first paint — remeasure floor so planets stay above text.
    let floorSyncRaf = window.requestAnimationFrame(() => {
      floorSyncRaf = 0;
      const { width, height } = sizeRef.current;
      if (width === 0 || height === 0) {
        return;
      }

      const floorInset = measureFloorInset(height);
      for (const body of bodiesRef.current) {
        clampBodyToStage(body, width, height, floorInset);
      }
      paintPlanets(bodiesRef.current, planetElsRef.current);
    });

    let resizeTimer = 0;
    const RESIZE_DEBOUNCE_MS = 180;
    /** Ignore chrome URL-bar height jitter; only real width changes reflow bodies. */
    const WIDTH_SCALE_EPS_PX = 2;

    const clampBodiesToCurrentStage = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (!isUsableLayout(width, height)) {
        return;
      }

      sizeRef.current = { width, height };
      const floorInset = measureFloorInset(height);

      if (bodiesRef.current.length === 0) {
        spawnBodies(width, height);

        return;
      }

      for (const body of bodiesRef.current) {
        clampBodyToStage(body, width, height, floorInset);
      }
      paintPlanets(bodiesRef.current, planetElsRef.current);
    };

    const applyResize = () => {
      const prevWidth = sizeRef.current.width;
      const prevHeight = sizeRef.current.height;
      const { width, height } = stage.getBoundingClientRect();

      // Chrome collapse / transient 0×0 — ignore, keep last good size.
      if (!isUsableLayout(width, height)) {
        return;
      }

      sizeRef.current = { width, height };
      const floorInset = measureFloorInset(height);

      if (bodiesRef.current.length === 0) {
        spawnBodies(width, height);

        return;
      }

      // After zero/bad layout or pageshow: never scale — clamp only.
      if (!isUsableLayout(prevWidth, prevHeight)) {
        for (const body of bodiesRef.current) {
          clampBodyToStage(body, width, height, floorInset);
        }
        paintPlanets(bodiesRef.current, planetElsRef.current);

        return;
      }

      const crossedCompact = isCompactWidth(prevWidth) !== isCompactWidth(width);

      if (crossedCompact) {
        spawnBodies(width, height);

        return;
      }

      const widthDelta = Math.abs(prevWidth - width);
      const heightChanged = Math.abs(prevHeight - height) > 0.5;

      if (widthDelta < WIDTH_SCALE_EPS_PX) {
        if (heightChanged) {
          for (const body of bodiesRef.current) {
            clampBodyToStage(body, width, height, floorInset);
          }
          paintPlanets(bodiesRef.current, planetElsRef.current);
        }

        return;
      }

      scaleBodiesToSize(
        bodiesRef.current,
        prevWidth,
        prevHeight,
        width,
        height,
        starRadius,
        floorInset,
      );
      paintPlanets(bodiesRef.current, planetElsRef.current);
    };

    const onResize = () => {
      if (resizeTimer !== 0) {
        window.clearTimeout(resizeTimer);
      }

      resizeTimer = window.setTimeout(() => {
        resizeTimer = 0;
        applyResize();
      }, RESIZE_DEBOUNCE_MS);
    };

    /** BFCache / tab resume: clamp only — never scale from a collapsed frame. */
    const onPageShow = () => {
      clampBodiesToCurrentStage();
    };

    const onVisibilityResume = () => {
      if (document.visibilityState === 'visible') {
        clampBodiesToCurrentStage();
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityResume);

    if (reducedMotion) {
      root.classList.add('paused');

      return () => {
        if (floorSyncRaf !== 0) {
          window.cancelAnimationFrame(floorSyncRaf);
        }
        if (resizeTimer !== 0) {
          window.clearTimeout(resizeTimer);
        }
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pageshow', onPageShow);
        document.removeEventListener('visibilitychange', onVisibilityResume);
        root.classList.remove('paused');
      };
    }

    let raf = 0;
    let loopActive = false;
    let pauseTimer = 0;
    let last = performance.now();
    let inView = true;
    let pageVisible = document.visibilityState === 'visible';
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    /** Phones: 20Hz sim — 30Hz still cooked the device (see perf-1 logs ~29fps hot). */
    const frameBudgetMs = () => {
      const compact = isCompactWidth(sizeRef.current.width);
      if (coarsePointer || compact) {
        return 1000 / 20;
      }

      return 1000 / 60;
    };
    const IDLE_PAUSE_MS = coarsePointer ? 1800 : 8000;
    let idlePaused = false;
    let idleTimer = 0;

    const bumpInteraction = () => {
      if (idleTimer !== 0) {
        window.clearTimeout(idleTimer);
        idleTimer = 0;
      }

      if (idlePaused) {
        idlePaused = false;
        syncRunningRef.current();
      }

      idleTimer = window.setTimeout(() => {
        idleTimer = 0;
        idlePaused = true;
        syncRunningRef.current();
      }, IDLE_PAUSE_MS);
    };

    const shouldRun = () =>
      motionModeRef.current === 'auto'
      && inView
      && pageVisible
      && !suspendRef.current
      && !idlePaused;

    /** Hard stop (user pause / tab hidden / modal / idle) — freeze CSS ambient too. */
    const shouldHardStop = () =>
      motionModeRef.current === 'paused'
      || !pageVisible
      || suspendRef.current
      || idlePaused;

    const setPausedClass = (paused: boolean) => {
      root.classList.toggle('paused', paused);
    };

    const stopLoop = (freezeAmbient: boolean) => {
      loopActive = false;
      if (raf !== 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (freezeAmbient) {
        setPausedClass(true);
      }
    };

    const tick = (now: number) => {
      if (shouldHardStop()) {
        stopLoop(true);

        return;
      }

      // Soft leave (scroll away): keep RAF alive until pauseTimer; do NOT freeze ambient
      // every IO flap — Android Chrome flaps intersection when the URL bar moves.
      if (!inView) {
        last = now;
        raf = requestAnimationFrame(tick);

        return;
      }

      const budget = frameBudgetMs();
      const elapsed = now - last;
      if (elapsed < budget - 1) {
        raf = requestAnimationFrame(tick);

        return;
      }

      const dt = Math.min(elapsed / 1000, 0.05);
      last = now;

      const { width, height } = sizeRef.current;
      if (width > 0 && height > 0 && bodiesRef.current.length > 0) {
        step(
          bodiesRef.current,
          width,
          height,
          starRadius,
          interactionRef.current,
          dt,
          floorInsetRef.current,
        );
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
      bumpInteraction();
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

      if (shouldHardStop() || !loopActive) {
        stopLoop(true);

        return;
      }

      // Off-screen: delay before killing RAF (matches ambient gate intent).
      pauseTimer = window.setTimeout(() => {
        pauseTimer = 0;
        if (!shouldRun()) {
          stopLoop(false);
        }
      }, PAUSE_DELAY_MS);
    };

    syncRunningRef.current = syncRunning;

    const onStagePointer = () => {
      bumpInteraction();
    };
    stage.addEventListener('pointerdown', onStagePointer, { passive: true });
    stage.addEventListener('pointermove', onStagePointer, { passive: true });

    const unsubscribePresence = subscribeCosmosPresence(root, (next) => {
      inView = next.inView;
      pageVisible = next.pageVisible;
      syncRunning();
    });

    syncRunning();
    bumpInteraction();

    return () => {
      syncRunningRef.current = () => {};
      stage.removeEventListener('pointerdown', onStagePointer);
      stage.removeEventListener('pointermove', onStagePointer);
      if (idleTimer !== 0) {
        window.clearTimeout(idleTimer);
      }
      if (floorSyncRaf !== 0) {
        window.cancelAnimationFrame(floorSyncRaf);
      }
      if (pauseTimer !== 0) {
        window.clearTimeout(pauseTimer);
      }
      if (resizeTimer !== 0) {
        window.clearTimeout(resizeTimer);
      }
      loopActive = false;
      cancelAnimationFrame(raf);
      unsubscribePresence();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityResume);
      root.classList.remove('paused');
    };
  }, [stageRef, planetElsRef, starSize]);

  return { bodiesRef };
}
