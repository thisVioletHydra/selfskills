import type { Planet } from '#web/entities/planet/planets';
import type { BounceBody } from '#web/widgets/cosmos/physics/useBouncePhysics';
import type { Dispatch, PointerEvent as ReactPointerEvent, RefObject, SetStateAction } from 'react';

import {
  capturePointer,
  isActivePointerSession,
  releasePointer,
} from '#web/widgets/cosmos/guards/pointer-session';
import {
  computeReleaseVelocity,
  TAP_THRESHOLD_PX,
  trimSamples,
  type PointSample,
} from '#web/widgets/cosmos/physics/flick-velocity';
import { paintPlanetPosition } from '#web/widgets/cosmos/physics/useBouncePhysics';
import { useRef } from 'react';

type UsePlanetThrowOptions = {
  stageRef: RefObject<HTMLElement | null>;
  bodiesRef: RefObject<BounceBody[]>;
  planetElsRef: RefObject<Map<string, HTMLElement | null>>;
  draggingId: string | null;
  setDraggingId: Dispatch<SetStateAction<string | null>>;
  setHoveredId: Dispatch<SetStateAction<string | null>>;
  onOpen: (planet: Planet) => void;
  onThrow?: () => void;
};

function stagePoint(stage: HTMLElement, clientX: number, clientY: number) {
  const rect = stage.getBoundingClientRect();

  return {
    pointX: clientX - rect.left,
    pointY: clientY - rect.top,
  };
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
  const dragStartRef = useRef({ pointX: 0, pointY: 0 });
  const didDragRef = useRef(false);

  const getBody = (id: string) => bodiesRef.current.find((body) => body.id === id);

  const paintBody = (id: string, pointX: number, pointY: number) => {
    const el = planetElsRef.current.get(id);
    if (el !== null && el !== undefined) {
      paintPlanetPosition(el, pointX, pointY);
    }
  };

  const onPointerDown = (planet: Planet, event: ReactPointerEvent<HTMLButtonElement>) => {
    const stage = stageRef.current;
    if (stage === null || stage === undefined) {
      return;
    }

    capturePointer(event.currentTarget, event.pointerId);

    const point = stagePoint(stage, event.clientX, event.clientY);
    const body = getBody(planet.id);

    if (body === null || body === undefined) {
      return;
    }

    didDragRef.current = false;
    dragStartRef.current = point;
    samplesRef.current = [{ pointX: point.pointX, pointY: point.pointY, t: performance.now() }];

    body.pointX = point.pointX;
    body.pointY = point.pointY;
    body.velocityX = 0;
    body.velocityY = 0;
    body.stuckSeconds = 0;
    body.stuckAnchorX = point.pointX;
    body.stuckAnchorY = point.pointY;
    paintBody(planet.id, point.pointX, point.pointY);

    setDraggingId(planet.id);
    setHoveredId(null);
  };

  const onPointerMove = (planet: Planet, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isActivePointerSession(draggingId, planet.id)) {
      return;
    }

    const stage = stageRef.current;
    const body = getBody(planet.id);
    if (stage === null || stage === undefined || body === null || body === undefined) {
      return;
    }

    const point = stagePoint(stage, event.clientX, event.clientY);
    body.pointX = point.pointX;
    body.pointY = point.pointY;
    body.velocityX = 0;
    body.velocityY = 0;
    paintBody(planet.id, point.pointX, point.pointY);

    const now = performance.now();
    samplesRef.current.push({ pointX: point.pointX, pointY: point.pointY, t: now });
    trimSamples(samplesRef.current, now);

    const drift = Math.hypot(point.pointX - dragStartRef.current.pointX, point.pointY - dragStartRef.current.pointY);
    if (drift > TAP_THRESHOLD_PX) {
      didDragRef.current = true;
    }
  };

  const onPointerUp = (planet: Planet, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isActivePointerSession(draggingId, planet.id)) {
      return;
    }

    releasePointer(event.currentTarget, event.pointerId);

    const body = getBody(planet.id);
    if (body !== null && body !== undefined) {
      if (didDragRef.current) {
        const release = computeReleaseVelocity(samplesRef.current, dragStartRef.current);
        body.velocityX = release.velocityX;
        body.velocityY = release.velocityY;
        body.stuckAnchorX = body.pointX;
        body.stuckAnchorY = body.pointY;
        body.stuckSeconds = 0;

        if (release.velocityX !== 0 || release.velocityY !== 0) {
          onThrow?.();
        }
      }
    }

    setDraggingId(null);
    samplesRef.current = [];

    if (!didDragRef.current) {
      onOpen(planet);
    }
  };

  const onPointerCancel = (planet: Planet) => {
    if (!isActivePointerSession(draggingId, planet.id)) {
      return;
    }

    setDraggingId(null);
    samplesRef.current = [];
    didDragRef.current = false;
  };

  const onPointerEnter = (planet: Planet) => {
    if (draggingId === null || draggingId === undefined || draggingId === '') {
      setHoveredId(planet.id);
    }
  };

  const onPointerLeave = (planet: Planet) => {
    setHoveredId((current) => (current === planet.id ? null : current));
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
