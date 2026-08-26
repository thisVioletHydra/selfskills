import type { TechStackItem } from '#web/entities/skill/tech-stack';
import type { BounceBody } from '#web/widgets/orbit-hero/useBouncePhysics';
import type { Dispatch, PointerEvent as ReactPointerEvent, RefObject, SetStateAction } from 'react';

import { clampThrowSpeed, planetTransform } from '#web/widgets/orbit-hero/useBouncePhysics';
import { useRef } from 'react';

type PointSample = {
  x: number;
  y: number;
  t: number;
};

type UsePlanetThrowOptions = {
  stageRef: RefObject<HTMLElement | null>;
  bodiesRef: RefObject<BounceBody[]>;
  planetElsRef: RefObject<Map<string, HTMLElement | null>>;
  draggingId: string | null;
  setDraggingId: Dispatch<SetStateAction<string | null>>;
  setHoveredId: Dispatch<SetStateAction<string | null>>;
  onOpen: (tech: TechStackItem) => void;
  onThrow?: () => void;
};

const FLICK_LOOKBACK_MS = 70;
const RELEASE_TAIL_MS = 50;
const TAP_THRESHOLD_PX = 10;
const TAIL_STILLNESS_PX = 9;
const GENTLE_RELEASE_RAW_SPEED = 38;
const THROW_CURVE = 1.2;
const RAW_SPEED_SOFT = 40;
const RAW_SPEED_HARD = 740;
const MIN_THROW_SPEED = 30;
const MAX_THROW_SPEED = 320;

function stagePoint(stage: HTMLElement, clientX: number, clientY: number) {
  const rect = stage.getBoundingClientRect();

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function computeFlickVelocity(samples: PointSample[]) {
  if (samples.length < 2) {
    return { vx: 0, vy: 0, rawSpeed: 0 };
  }

  const end = samples[samples.length - 1];
  const windowStart = end.t - FLICK_LOOKBACK_MS;
  let bestVx = 0;
  let bestVy = 0;
  let bestSpeed = 0;

  for (let i = 1; i < samples.length; i++) {
    const prev = samples[i - 1];
    const next = samples[i];

    if (next.t < windowStart) {
      continue;
    }

    const dt = (next.t - prev.t) / 1000;
    if (dt < 0.001) {
      continue;
    }

    const vx = (next.x - prev.x) / dt;
    const vy = (next.y - prev.y) / dt;
    const speed = Math.hypot(vx, vy);

    if (speed > bestSpeed) {
      bestSpeed = speed;
      bestVx = vx;
      bestVy = vy;
    }
  }

  return { vx: bestVx, vy: bestVy, rawSpeed: bestSpeed };
}

function mapThrowSpeed(rawSpeed: number) {
  const t = Math.min(
    1,
    Math.max(0, (rawSpeed - RAW_SPEED_SOFT) / (RAW_SPEED_HARD - RAW_SPEED_SOFT)),
  );

  return MIN_THROW_SPEED + Math.pow(t, THROW_CURVE) * (MAX_THROW_SPEED - MIN_THROW_SPEED);
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
  const isGentleRelease = tailDist < TAIL_STILLNESS_PX || flick.rawSpeed < GENTLE_RELEASE_RAW_SPEED;

  if (isGentleRelease || flick.rawSpeed <= 0) {
    return { vx: 0, vy: 0 };
  }

  const releaseSpeed = Math.min(MAX_THROW_SPEED, mapThrowSpeed(flick.rawSpeed));
  const dirLen = Math.hypot(flick.vx, flick.vy);

  if (dirLen <= 0.001) {
    return { vx: 0, vy: 0 };
  }

  return clampThrowSpeed((flick.vx / dirLen) * releaseSpeed, (flick.vy / dirLen) * releaseSpeed);
}

export function usePlanetThrow(options: UsePlanetThrowOptions) {
  const {
    stageRef,
    bodiesRef,
    planetElsRef,
    draggingId,
    setDraggingId,
    setHoveredId,
    onOpen,
    onThrow,
  } = options;

  const samplesRef = useRef<PointSample[]>([]);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const didDragRef = useRef(false);

  const getBody = (id: string) => bodiesRef.current.find((body) => body.id === id);

  const paintBody = (id: string, x: number, y: number) => {
    const el = planetElsRef.current.get(id);
    if (el !== null && el !== undefined) {
      el.style.transform = planetTransform(x, y);
    }
  };

  const onPointerDown = (tech: TechStackItem, event: ReactPointerEvent<HTMLButtonElement>) => {
    const stage = stageRef.current;
    if (stage === null || stage === undefined) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    const point = stagePoint(stage, event.clientX, event.clientY);
    const body = getBody(tech.id);

    if (body === null || body === undefined) {
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
    paintBody(tech.id, point.x, point.y);

    setDraggingId(tech.id);
    setHoveredId(null);
  };

  const onPointerMove = (tech: TechStackItem, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (draggingId !== tech.id) {
      return;
    }

    const stage = stageRef.current;
    const body = getBody(tech.id);
    if (stage === null || stage === undefined || body === null || body === undefined) {
      return;
    }

    const point = stagePoint(stage, event.clientX, event.clientY);
    body.x = point.x;
    body.y = point.y;
    body.vx = 0;
    body.vy = 0;
    paintBody(tech.id, point.x, point.y);

    samplesRef.current.push({ x: point.x, y: point.y, t: performance.now() });
    if (samplesRef.current.length > 24) {
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
    if (body !== null && body !== undefined) {
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
    if (draggingId === null || draggingId === undefined || draggingId === '') {
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
