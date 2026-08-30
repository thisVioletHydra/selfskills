import type { Planet } from '#web/entities/planet/planets';
import type { AmbientId } from '#web/widgets/cosmos/ambient/types';
import type { CosmosMotionMode } from '#web/widgets/cosmos/lib/motion-state';
import type { DrawPlanetsOpts } from '#web/widgets/cosmos/physics/planet-canvas';

import { CORE_PLANET, ORBIT_PLANETS } from '#web/entities/planet/planets';
import { localizePlanet } from '#web/entities/planet/localizePlanet';
import { PlanetModal } from '#web/features/planet-modal/PlanetModal';
import { AMBIENT_REGISTRY } from '#web/widgets/cosmos/ambient/registry';
import { MotionChip } from '#web/widgets/cosmos/chrome/MotionChip';
import { useCosmosHints } from '#web/widgets/cosmos/chrome/useCosmosHints';
import { ACTIVE_PRESET } from '#web/widgets/cosmos/config/presets';
import { readCosmosMotionMode, writeCosmosMotionMode } from '#web/widgets/cosmos/lib/motion-state';
import { useBouncePhysics } from '#web/widgets/cosmos/physics/useBouncePhysics';
import { usePlanetThrow } from '#web/widgets/cosmos/physics/usePlanetThrow';
import { useLocale } from '#web/shared/i18n/locale-context';
import { LocaleToggle } from '#web/shared/ui/LocaleToggle';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import '#web/widgets/cosmos/cosmos-stage.css';

const STAR_MODULES = new Set<AmbientId>(['starfield', 'pulseStars', 'comets']);
const DEMO_FLING_DELAY_MS = 1200;
const PULL_HINT_PLANET_ID = 'docker';
const TAP_HINT_PLANET_ID = 'typescript';

function renderAmbient(ids: readonly AmbientId[], motionMode: CosmosMotionMode) {
  return ids.map((id) => {
    const { Layer } = AMBIENT_REGISTRY[id];

    return <Layer key={id} motionMode={motionMode} />;
  });
}

export function CosmosStage() {
  const { t, locale } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintExtraRef = useRef<Partial<DrawPlanetsOpts> | null>(null);
  const demoFlingDoneRef = useRef(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activePlanet, setActivePlanet] = useState<Planet | null>(null);
  const [motionMode, setMotionMode] = useState<CosmosMotionMode>(() => readCosmosMotionMode());
  const orbitPlanets = ORBIT_PLANETS;

  const { teaseActive, markTeaseDone } = useCosmosHints();

  useLayoutEffect(() => {
    paintExtraRef.current = {
      teaseActive,
      pullHintId: PULL_HINT_PLANET_ID,
      tapHintId: TAP_HINT_PLANET_ID,
      pullHintText: t('hintPull'),
      tapHintText: t('hintTap'),
    };
  }, [teaseActive, t]);

  const interactionId = draggingId ?? hoveredId;
  const modalOpen = activePlanet !== null;
  const { bodiesRef, requestPaint } = useBouncePhysics(
    stageRef,
    canvasRef,
    CORE_PLANET.size,
    interactionId,
    draggingId,
    motionMode,
    modalOpen,
    paintExtraRef,
  );

  const toggleMotion = () => {
    const next: CosmosMotionMode = motionMode === 'auto' ? 'paused' : 'auto';
    writeCosmosMotionMode(next);
    setMotionMode(next);
  };

  const markInteracted = () => {
    markTeaseDone();
  };

  const openPlanet = (planet: Planet) => {
    markInteracted();
    setActivePlanet(planet);
  };

  const throwHandlers = usePlanetThrow({
    stageRef,
    canvasRef,
    bodiesRef,
    setDraggingId,
    setHoveredId,
    onOpen: openPlanet,
    onPaint: requestPaint,
    onInteract: markInteracted,
    onThrow: () => {
      markInteracted();
      demoFlingDoneRef.current = true;
    },
  });

  useEffect(() => {
    requestPaint();
  }, [requestPaint, teaseActive, locale]);

  useEffect(() => {
    if (!teaseActive || motionMode !== 'auto' || demoFlingDoneRef.current) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (demoFlingDoneRef.current) {
        return;
      }

      const demoPlanet = orbitPlanets.find((planet) => planet.id === PULL_HINT_PLANET_ID)
        ?? orbitPlanets[0];
      if (demoPlanet === undefined) {
        return;
      }

      const body = bodiesRef.current.find((item) => item.id === demoPlanet.id);
      if (body === undefined) {
        return;
      }

      body.velocityX += 26;
      body.velocityY -= 16;
      demoFlingDoneRef.current = true;
    }, DEMO_FLING_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [bodiesRef, motionMode, orbitPlanets, teaseActive]);

  const stageClassName = teaseActive ? 'stage hinting' : 'stage';
  const isPaused = motionMode === 'paused';
  const starIds: AmbientId[] = ACTIVE_PRESET.modules.filter((id) => STAR_MODULES.has(id));
  const overlayIds: AmbientId[] = ACTIVE_PRESET.modules.filter((id) => !STAR_MODULES.has(id));

  return (
    <section className="cosmos-stage" id="cosmos">
      <div className={stageClassName} ref={stageRef}>
        <div className="stars" aria-hidden="true">
          {renderAmbient(starIds, motionMode)}
        </div>
        {renderAmbient(overlayIds, motionMode)}
        <div className="glow" aria-hidden="true" />

        <div className="chrome-left">
          <MotionChip
            isPaused={isPaused}
            onToggle={toggleMotion}
            playLabel={t('play')}
            pauseLabel={t('pause')}
            ariaPlay={t('orbitPlay')}
            ariaPause={t('orbitPause')}
          />
        </div>

        <div className="chrome-right">
          <LocaleToggle />
        </div>

        <div className="hints" aria-hidden="true">
          <p className="app-version-chip">{`ver:${__APP_GIT_SHA__}`}</p>
        </div>

        <div className="star" aria-hidden="true">
          <div className="corona outer" />
          <div className="corona mid" />
          <div className="corona core" />
        </div>

        <canvas
          ref={canvasRef}
          className="planets-canvas"
          aria-label={t('orbitPlanetsAria')}
          onPointerDown={throwHandlers.onPointerDown}
          onPointerMove={throwHandlers.onPointerMove}
          onPointerUp={throwHandlers.onPointerUp}
          onPointerCancel={throwHandlers.onPointerCancel}
          onPointerLeave={throwHandlers.onPointerLeave}
        />

        <button
          type="button"
          className="supernova"
          onPointerUp={(event) => {
            // Same Android path as planets: open on pointerup, kill synthetic click on modal.
            event.preventDefault();
            openPlanet(CORE_PLANET);
          }}
          aria-label={t('supernovaAria', { name: CORE_PLANET.name })}
          title={t('supernovaTap')}
        >
          <img src={CORE_PLANET.icon} alt="" draggable={false} />
        </button>

        <div className="copy">
          <p className="tag">{t('heroTag')}</p>
          <h1 className="title">
            {t('heroTitleLine1')}
            <br />
            {t('heroTitleLine2')}
          </h1>

          <figure className="hero-quote-wrap">
            <blockquote className="hero-quote">{t('heroQuote')}</blockquote>
            <figcaption className="hero-quote-by">{t('heroQuoteBy')}</figcaption>
          </figure>
        </div>
      </div>

      <PlanetModal
        planet={activePlanet === null ? null : localizePlanet(activePlanet, locale)}
        onClose={() => setActivePlanet(null)}
      />
    </section>
  );
}
