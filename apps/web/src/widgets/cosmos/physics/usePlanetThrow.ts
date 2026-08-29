import type { Planet } from '#web/entities/planet/planets';
import type { BounceBody } from '#web/widgets/cosmos/physics/useBouncePhysics';
import type { Dispatch, PointerEvent as ReactPointerEvent, RefObject, SetStateAction } from 'react';

import {
  capturePointer,
  isActivePointerSession,
  releasePointer,
} from '#web/widgets/cosmos/guards/pointer-session';
import {
  createDragAccelerationTracker,
  TAP_THRESHOLD_PX,
} from '#web/widgets/cosmos/physics/drag-acceleration';
import { paintPlanetPosition } from '#web/widgets/cosmos/physics/useBouncePhysics';
import { useRef } from 'react';

type UsePlanetThrowOptions = {
  stageRef: RefObject<HTMLElement | null>;
  bodiesRef: RefObject<BounceBody[]>;
  planetElsRef: RefObject<Map<string, HTMLElement | null>>;
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

function lockPlanetTouch(target: HTMLElement) {
  target.style.touchAction = 'none';
}

function unlockPlanetTouch(target: HTMLElement) {
  target.style.touchAction = 'pan-y';
}

/** After a throw, ignore hover-pause so the planet doesn't catch its own cursor. */
const THROW_HOVER_IMMUNE_MS = 1500;

export function usePlanetThrow(options: UsePlanetThrowOptions) {
  const {
    stageRef,
    bodiesRef,
    planetElsRef,
    setDraggingId,
    setHoveredId,
    onOpen,
    onThrow,
  } = options;

  const trackerRef = useRef(createDragAccelerationTracker());
  /** Sync session id — Android can fire up before React re-renders draggingId state. */
  const draggingIdRef = useRef<string | null>(null);
  /** Active pointer for this drag — ignore other fingers / ghost moves. */
  const activePointerIdRef = useRef<number | null>(null);
  /** planetId → performance.now() until hover may pause again */
  const hoverImmuneUntilRef = useRef(new Map<string, number>());

  const getBody = (id: string) => bodiesRef.current.find((body) => body.id === id);

  const isHoverImmune = (id: string) => {
    const until = hoverImmuneUntilRef.current.get(id);
    if (until === undefined) {
      return false;
    }

    if (performance.now() >= until) {
      hoverImmuneUntilRef.current.delete(id);
      return false;
    }

    return true;
  };

  const isDragPointer = (planetId: string, pointerId: number) => {
    return (
      isActivePointerSession(draggingIdRef.current, planetId)
      && activePointerIdRef.current === pointerId
    );
  };

  const paintBody = (id: string, pointX: number, pointY: number) => {
    const el = planetElsRef.current.get(id);
    if (el !== null && el !== undefined) {
      paintPlanetPosition(el, pointX, pointY);
    }
  };

  const applyRelease = (planet: Planet, release: { velocityX: number; velocityY: number; didDrag: boolean }) => {
    const body = getBody(planet.id);
    if (body === null || body === undefined || !release.didDrag) {
      return;
    }

    body.velocityX = release.velocityX;
    body.velocityY = release.velocityY;
    body.stuckAnchorX = body.pointX;
    body.stuckAnchorY = body.pointY;
    body.stuckSeconds = 0;

    if (release.velocityX !== 0 || release.velocityY !== 0) {
      hoverImmuneUntilRef.current.set(planet.id, performance.now() + THROW_HOVER_IMMUNE_MS);
      setHoveredId((current) => (current === planet.id ? null : current));
      onThrow?.();
    }
  };

  const clearDragSession = () => {
    draggingIdRef.current = null;
    activePointerIdRef.current = null;
    setDraggingId(null);
  };

  const onPointerDown = (planet: Planet, event: ReactPointerEvent<HTMLButtonElement>) => {
    const stage = stageRef.current;
    if (stage === null || stage === undefined) {
      return;
    }

    // Only primary finger; ignore multi-touch while already dragging something else.
    if (event.isPrimary !== true) {
      return;
    }

    if (draggingIdRef.current !== null) {
      return;
    }

    const target = event.currentTarget;
    // Must run before the browser commits a pan — CSS touch-action: none is the real fix;
    // preventDefault blocks the compatibility mouse path on Android WebView.
    event.preventDefault();
    lockPlanetTouch(target);
    capturePointer(target, event.pointerId);

    const point = stagePoint(stage, event.clientX, event.clientY);
    const body = getBody(planet.id);

    if (body === null || body === undefined) {
      unlockPlanetTouch(target);
      releasePointer(target, event.pointerId);
      return;
    }

    trackerRef.current.start(point);

    body.pointX = point.pointX;
    body.pointY = point.pointY;
    body.velocityX = 0;
    body.velocityY = 0;
    body.stuckSeconds = 0;
    body.stuckAnchorX = point.pointX;
    body.stuckAnchorY = point.pointY;
    paintBody(planet.id, point.pointX, point.pointY);

    draggingIdRef.current = planet.id;
    activePointerIdRef.current = event.pointerId;
    setDraggingId(planet.id);
    setHoveredId(null);
  };

  const onPointerMove = (planet: Planet, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragPointer(planet.id, event.pointerId)) {
      return;
    }

    const stage = stageRef.current;
    const body = getBody(planet.id);
    if (stage === null || stage === undefined || body === null || body === undefined) {
      return;
    }

    event.preventDefault();

    const point = stagePoint(stage, event.clientX, event.clientY);
    body.pointX = point.pointX;
    body.pointY = point.pointY;
    body.velocityX = 0;
    body.velocityY = 0;
    paintBody(planet.id, point.pointX, point.pointY);

    trackerRef.current.move(point);
  };

  const onPointerUp = (planet: Planet, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragPointer(planet.id, event.pointerId)) {
      return;
    }

    const target = event.currentTarget;
    releasePointer(target, event.pointerId);
    unlockPlanetTouch(target);

    const release = trackerRef.current.end();
    applyRelease(planet, release);

    clearDragSession();

    if (!release.didDrag) {
      // Kill the synthetic click that Android would otherwise dump on the new modal backdrop.
      event.preventDefault();
      onOpen(planet);
    }
  };

  const onPointerCancel = (planet: Planet, event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!isDragPointer(planet.id, event.pointerId)) {
      return;
    }

    const target = event.currentTarget;
    unlockPlanetTouch(target);

    const release = trackerRef.current.cancel();
    applyRelease(planet, release);

    clearDragSession();
  };

  const onPointerEnter = (planet: Planet) => {
    if (draggingIdRef.current !== null || isHoverImmune(planet.id)) {
      return;
    }

    setHoveredId(planet.id);
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

export { TAP_THRESHOLD_PX };
