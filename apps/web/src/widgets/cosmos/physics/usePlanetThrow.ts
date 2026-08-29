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
import {
  hitTestPlanet,
  ORBIT_PLANET_BY_ID,
} from '#web/widgets/cosmos/physics/planet-canvas';
import { useRef } from 'react';

type UsePlanetThrowOptions = {
  stageRef: RefObject<HTMLElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  bodiesRef: RefObject<BounceBody[]>;
  setDraggingId: Dispatch<SetStateAction<string | null>>;
  setHoveredId: Dispatch<SetStateAction<string | null>>;
  onOpen: (planet: Planet) => void;
  onThrow?: () => void;
  onPaint: () => void;
  onInteract?: () => void;
};

function stagePoint(stage: HTMLElement, clientX: number, clientY: number) {
  const rect = stage.getBoundingClientRect();

  return {
    pointX: clientX - rect.left,
    pointY: clientY - rect.top,
  };
}

/**
 * Android Chrome pull-to-refresh: non-passive touchmove + overscroll lock while dragging.
 * CSS overscroll-behavior alone is not enough on some WebViews when scrollY === 0.
 */
let dragTouchMoveBlock: ((event: TouchEvent) => void) | null = null;

function lockPageOverscroll() {
  document.documentElement.style.overscrollBehaviorY = 'none';
  document.body.style.overscrollBehaviorY = 'none';

  if (dragTouchMoveBlock !== null) {
    return;
  }

  dragTouchMoveBlock = (event: TouchEvent) => {
    if (event.cancelable) {
      event.preventDefault();
    }
  };
  document.addEventListener('touchmove', dragTouchMoveBlock, { passive: false });
}

function unlockPageOverscroll() {
  document.documentElement.style.overscrollBehaviorY = '';
  document.body.style.overscrollBehaviorY = '';

  if (dragTouchMoveBlock === null) {
    return;
  }

  document.removeEventListener('touchmove', dragTouchMoveBlock);
  dragTouchMoveBlock = null;
}

/** After a throw, ignore hover-pause so the planet doesn't catch its own cursor. */
const THROW_HOVER_IMMUNE_MS = 1500;

export function usePlanetThrow(options: UsePlanetThrowOptions) {
  const {
    stageRef,
    canvasRef,
    bodiesRef,
    setDraggingId,
    setHoveredId,
    onOpen,
    onThrow,
    onPaint,
    onInteract,
  } = options;

  const trackerRef = useRef(createDragAccelerationTracker());
  /** Sync session id — Android can fire up before React re-renders draggingId state. */
  const draggingIdRef = useRef<string | null>(null);
  /** Active pointer for this drag — ignore other fingers / ghost moves. */
  const activePointerIdRef = useRef<number | null>(null);
  /** planetId → performance.now() until hover may pause again */
  const hoverImmuneUntilRef = useRef(new Map<string, number>());
  const coarsePointerRef = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(pointer: coarse)').matches
      : false,
  );

  const getBody = (id: string) => bodiesRef.current.find((body) => body.id === id);

  const getPlanet = (id: string) => ORBIT_PLANET_BY_ID.get(id);

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
    unlockPageOverscroll();
    const canvas = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      canvas.style.cursor = 'grab';
    }
  };

  const syncHoverFromPoint = (pointX: number, pointY: number) => {
    if (coarsePointerRef.current || draggingIdRef.current !== null) {
      return;
    }

    const hitId = hitTestPlanet(bodiesRef.current, pointX, pointY);
    if (hitId === null || isHoverImmune(hitId)) {
      setHoveredId(null);
      const canvas = canvasRef.current;
      if (canvas !== null && canvas !== undefined) {
        canvas.style.cursor = 'grab';
      }

      return;
    }

    setHoveredId(hitId);
    const canvas = canvasRef.current;
    if (canvas !== null && canvas !== undefined) {
      canvas.style.cursor = 'grab';
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stage = stageRef.current;
    const canvas = event.currentTarget;
    if (stage === null || stage === undefined) {
      return;
    }

    if (event.isPrimary !== true) {
      return;
    }

    if (draggingIdRef.current !== null) {
      return;
    }

    const point = stagePoint(stage, event.clientX, event.clientY);
    const hitId = hitTestPlanet(bodiesRef.current, point.pointX, point.pointY);
    if (hitId === null) {
      return;
    }

    const planet = getPlanet(hitId);
    const body = getBody(hitId);
    if (planet === undefined || body === null || body === undefined) {
      return;
    }

    event.preventDefault();
    capturePointer(canvas, event.pointerId);
    lockPageOverscroll();
    onInteract?.();

    trackerRef.current.start(point);

    body.pointX = point.pointX;
    body.pointY = point.pointY;
    body.velocityX = 0;
    body.velocityY = 0;
    body.stuckSeconds = 0;
    body.stuckAnchorX = point.pointX;
    body.stuckAnchorY = point.pointY;
    onPaint();

    draggingIdRef.current = planet.id;
    activePointerIdRef.current = event.pointerId;
    setDraggingId(planet.id);
    setHoveredId(null);
    canvas.style.cursor = 'grabbing';
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const stage = stageRef.current;
    if (stage === null || stage === undefined) {
      return;
    }

    const point = stagePoint(stage, event.clientX, event.clientY);
    const dragId = draggingIdRef.current;

    if (dragId === null || activePointerIdRef.current !== event.pointerId) {
      syncHoverFromPoint(point.pointX, point.pointY);

      return;
    }

    if (!isDragPointer(dragId, event.pointerId)) {
      return;
    }

    const body = getBody(dragId);
    if (body === null || body === undefined) {
      return;
    }

    event.preventDefault();

    body.pointX = point.pointX;
    body.pointY = point.pointY;
    body.velocityX = 0;
    body.velocityY = 0;
    onPaint();

    trackerRef.current.move(point);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const dragId = draggingIdRef.current;
    if (dragId === null || !isDragPointer(dragId, event.pointerId)) {
      return;
    }

    const canvas = event.currentTarget;
    releasePointer(canvas, event.pointerId);

    const planet = getPlanet(dragId);
    if (planet === undefined) {
      clearDragSession();
      onPaint();

      return;
    }

    const release = trackerRef.current.end();
    applyRelease(planet, release);

    clearDragSession();
    onPaint();

    if (!release.didDrag) {
      // Kill the synthetic click that Android would otherwise dump on the new modal backdrop.
      event.preventDefault();
      onOpen(planet);
    }
  };

  const onPointerCancel = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const dragId = draggingIdRef.current;
    if (dragId === null || !isDragPointer(dragId, event.pointerId)) {
      return;
    }

    const canvas = event.currentTarget;
    if (canvas.hasPointerCapture(event.pointerId)) {
      releasePointer(canvas, event.pointerId);
    }

    const planet = getPlanet(dragId);
    if (planet !== undefined) {
      const release = trackerRef.current.cancel();
      applyRelease(planet, release);
    }

    clearDragSession();
    onPaint();
  };

  const onPointerLeave = () => {
    if (draggingIdRef.current !== null) {
      return;
    }

    setHoveredId(null);
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onPointerLeave,
  };
}

export { TAP_THRESHOLD_PX };
