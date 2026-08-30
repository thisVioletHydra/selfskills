import type { Planet } from '#web/entities/planet/planets';
import type { BounceBody } from '#web/widgets/cosmos/physics/useBouncePhysics';

import { ORBIT_PLANETS } from '#web/entities/planet/planets';

const iconCache = new Map<string, HTMLImageElement>();
const iconReadyListeners = new Set<() => void>();

export function onPlanetIconsReady(listener: () => void) {
  iconReadyListeners.add(listener);

  return () => {
    iconReadyListeners.delete(listener);
  };
}

function notifyIconsReady() {
  for (const listener of iconReadyListeners) {
    listener();
  }
}

export const ORBIT_PLANET_BY_ID: ReadonlyMap<string, Planet> = new Map(
  ORBIT_PLANETS.map((planet) => [planet.id, planet]),
);

export function preloadPlanetIcons(planets: readonly Planet[] = ORBIT_PLANETS) {
  for (const planet of planets) {
    if (iconCache.has(planet.id)) {
      continue;
    }

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      notifyIconsReady();
    };
    image.src = planet.icon;
    iconCache.set(planet.id, image);
  }
}

preloadPlanetIcons();

export function resizePlanetCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
) {
  if (cssWidth <= 0 || cssHeight <= 0) {
    return;
  }

  const dprCap = window.matchMedia('(pointer: coarse)').matches ? 1 : 2;
  const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), dprCap);
  const nextWidth = Math.max(1, Math.floor(cssWidth * dpr));
  const nextHeight = Math.max(1, Math.floor(cssHeight * dpr));

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export type DrawPlanetsOpts = {
  interactionId: string | null;
  draggingId: string | null;
  teaseActive?: boolean;
  pullHintId?: string;
  tapHintId?: string;
  pullHintText?: string;
  tapHintText?: string;
};

export function drawPlanets(
  canvas: HTMLCanvasElement,
  bodies: BounceBody[],
  planetById: ReadonlyMap<string, Planet>,
  opts: DrawPlanetsOpts,
) {
  const ctx = canvas.getContext('2d');
  if (ctx === null) {
    return;
  }

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width <= 0 || height <= 0) {
    return;
  }

  ctx.clearRect(0, 0, width, height);

  for (const body of bodies) {
    const planet = planetById.get(body.id);
    if (planet === undefined) {
      continue;
    }

    const baseSize = Math.max(planet.size, body.radius * 2);
    let scale = 1;
    if (opts.draggingId === body.id) {
      scale = 1.15;
    } else if (opts.interactionId === body.id) {
      scale = 1.12;
    }

    // Match former DOM: button box = size, icon ≈ 72% of box.
    const drawSize = baseSize * 0.72 * scale;
    const half = drawSize / 2;
    const image = iconCache.get(planet.id);

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    if (
      image !== undefined
      && image.complete
      && image.naturalWidth > 0
    ) {
      ctx.drawImage(
        image,
        body.pointX - half,
        body.pointY - half,
        drawSize,
        drawSize,
      );
    } else {
      ctx.beginPath();
      ctx.arc(body.pointX, body.pointY, half, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200, 210, 255, 0.35)';
      ctx.fill();
    }

    ctx.restore();

    // Planet tip labels stay on (teaseActive only drives stage.hinting / demo fling).
    let hintText: string | undefined;
    if (body.id === opts.pullHintId) {
      hintText = opts.pullHintText;
    } else if (body.id === opts.tapHintId) {
      hintText = opts.tapHintText;
    }

    if (hintText === undefined || hintText === '') {
      continue;
    }

    ctx.save();
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const labelY = body.pointY - half - 8;
    const metrics = ctx.measureText(hintText);
    const padX = 8;
    const padY = 4;
    const boxW = metrics.width + padX * 2;
    const boxH = 18;
    const boxX = body.pointX - boxW / 2;
    const boxY = labelY - boxH + padY;

    ctx.fillStyle = 'rgba(8, 10, 20, 0.55)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const r = 999;
    ctx.roundRect(boxX, boxY, boxW, boxH, r);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(247, 223, 30, 0.95)';
    ctx.shadowColor = 'transparent';
    ctx.fillText(hintText, body.pointX, labelY);
    ctx.restore();
  }
}

/** Nearest body whose center is within radius * 1.25 of the point. */
export function hitTestPlanet(
  bodies: BounceBody[],
  pointX: number,
  pointY: number,
): string | null {
  let bestId: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const body of bodies) {
    const dist = Math.hypot(body.pointX - pointX, body.pointY - pointY);
    const hitRadius = body.radius * 1.25;
    if (dist <= hitRadius && dist < bestDist) {
      bestDist = dist;
      bestId = body.id;
    }
  }

  return bestId;
}
