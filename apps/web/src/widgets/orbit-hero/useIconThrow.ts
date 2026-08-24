import { useRef, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';
import type { TechStackItem } from '#app/entities/skill/tech-stack';
import type { BounceBody } from '#app/widgets/orbit-hero/useBouncePhysics';
import { clampThrowSpeed } from '#app/widgets/orbit-hero/useBouncePhysics';

type PointSample = {
  x: number;
  y: number;
  t: number;
};

type UseIconThrowOptions = {
  stageRef: RefObject<HTMLElement | null>;
  bodiesRef: RefObject<BounceBody[]>;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;
  onOpen: (tech: TechStackItem) => void;
  onThrow?: () => void;
};

const FLICK_LOOKBACK_MS = 90;
const RELEASE_TAIL_MS = 55;
const TAP_THRESHOLD_PX = 10;
const TAIL_STILLNESS_PX = 10;
const GENTLE_RELEASE_RAW_SPEED = 52;
const FLICK_MULTIPLIER = 2.45;
const FLICK_SPEED_BONUS = 0.32;
const DRAG_DISTANCE_BONUS = 0.28;
const MIN_FLICK_DT_SEC = 0.008;
const MAX_THROW_SPEED = 280;

function stagePoint(stage: HTMLElement, clientX: number, clientY: number) {
  const rect = stage.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function computeFlickVelocity(samples: PointSample[]) {
  if (samples.length < 2) {
    return { vx: 0, vy: 0, speed: 0, rawSpeed: 0 };
  }

  const end = samples[samples.length - 1];
  const windowStart = end.t - FLICK_LOOKBACK_MS;
  const start = samples.find((sample) => sample.t >= windowStart) ?? samples[0];
  const dt = Math.max((end.t - start.t) / 1000, MIN_FLICK_DT_SEC);

  const rawVx = (end.x - start.x) / dt;
  const rawVy = (end.y - start.y) / dt;
  const rawSpeed = Math.hypot(rawVx, rawVy);
  const vx = rawVx * FLICK_MULTIPLIER;
  const vy = rawVy * FLICK_MULTIPLIER;
  const speed = Math.hypot(vx, vy);

  return { vx, vy, speed, rawSpeed };
}

function computeReleaseVelocity(samples: PointSample[], dragStart: { x: number; y: number }) {
  const flick = computeFlickVelocity(samples);
  const end = samples[samples.length - 1];
  const dragDx = end.x - dragStart.x;
  const dragDy = end.y - dragStart.y;
  const dragDist = Math.hypot(dragDx, dragDy);

  if (dragDist <= TAP_THRESHOLD_PX) {
    return { vx: 0, vy: 0 };
  }

  const tailStart = end.t - RELEASE_TAIL_MS;
  const tailAnchor = samples.find((sample) => sample.t >= tailStart) ?? samples[0];
  const tailDist = Math.hypot(end.x - tailAnchor.x, end.y - tailAnchor.y);
  const isGentleRelease =
    tailDist < TAIL_STILLNESS_PX || flick.rawSpeed < GENTLE_RELEASE_RAW_SPEED;

  if (isGentleRelease) {
    return { vx: 0, vy: 0 };
  }

  if (flick.speed <= 0) {
    return { vx: 0, vy: 0 };
  }

  const distanceBonus = Math.min(dragDist * DRAG_DISTANCE_BONUS, flick.speed * 0.3);
  const releaseSpeed = Math.min(
    MAX_THROW_SPEED,
    flick.speed * (1 + FLICK_SPEED_BONUS) + distanceBonus,
  );

  const dirX = flick.vx / flick.speed;
  const dirY = flick.vy / flick.speed;

  return clampThrowSpeed(dirX * releaseSpeed, dirY * releaseSpeed);
}

export function useIconThrow(options: UseIconThrowOptions) {
  const { stageRef, bodiesRef, draggingId, setDraggingId, setHoveredId, onOpen, onThrow } = options;

  const samplesRef = useRef<PointSample[]>([]);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const didDragRef = useRef(false);

  const getBody = (id: string) => bodiesRef.current.find((body) => body.id === id);

  const onPointerDown = (tech: TechStackItem, event: ReactPointerEvent<HTMLButtonElement>) => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    const point = stagePoint(stage, event.clientX, event.clientY);
    const body = getBody(tech.id);

    if (!body) {
      return;
    }

    didDragRef.current = false;
    dragStartRef.current = point;
    samplesRef.current = [{ x: point.x, y: point.y, t: performance.now() }];

    body.x = point.x;
    body.y = point.y;
    body.vx = 0;
    body.vy = 0;
    body.stuckSeconds = 0;
    body.stuckAnchorX = point.x;
    body.stuckAnchorY = point.y;

    setDraggingId(tech.id);
    setHoveredId(null);
  };

  const onPointerMove = (tech: TechStackItem, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (draggingId !== tech.id) {
      return;
    }

    const stage = stageRef.current;
    const body = getBody(tech.id);
    if (!stage || !body) {
      return;
    }

    const point = stagePoint(stage, event.clientX, event.clientY);
    body.x = point.x;
    body.y = point.y;
    body.vx = 0;
    body.vy = 0;

    samplesRef.current.push({ x: point.x, y: point.y, t: performance.now() });
    if (samplesRef.current.length > 12) {
      samplesRef.current.shift();
    }

    const drift = Math.hypot(point.x - dragStartRef.current.x, point.y - dragStartRef.current.y);
    if (drift > TAP_THRESHOLD_PX) {
      didDragRef.current = true;
    }
  };

  const onPointerUp = (tech: TechStackItem, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (draggingId !== tech.id) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const body = getBody(tech.id);
    if (body) {
      if (didDragRef.current) {
        const release = computeReleaseVelocity(samplesRef.current, dragStartRef.current);
        body.vx = release.vx;
        body.vy = release.vy;
        body.stuckAnchorX = body.x;
        body.stuckAnchorY = body.y;
        body.stuckSeconds = 0;

        if (release.vx !== 0 || release.vy !== 0) {
          onThrow?.();
        }
      }
    }

    setDraggingId(null);
    samplesRef.current = [];

    if (!didDragRef.current) {
      onOpen(tech);
    }
  };

  const onPointerCancel = (tech: TechStackItem) => {
    if (draggingId !== tech.id) {
      return;
    }

    setDraggingId(null);
    samplesRef.current = [];
    didDragRef.current = false;
  };

  const onPointerEnter = (tech: TechStackItem) => {
    if (!draggingId) {
      setHoveredId(tech.id);
    }
  };

  const onPointerLeave = (tech: TechStackItem) => {
    setHoveredId((current) => (current === tech.id ? null : current));
  };

  return {
    onPointerEnter,
    onPointerLeave,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
