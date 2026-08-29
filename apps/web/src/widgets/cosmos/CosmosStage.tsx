import type { Planet } from '#web/entities/planet/planets';
import type { AmbientId } from '#web/widgets/cosmos/ambient/types';
import type { CosmosMotionMode } from '#web/widgets/cosmos/lib/motion-state';

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
import { useEffect, useRef, useState } from 'react';

import '#web/widgets/cosmos/cosmos-stage.css';

const STAR_MODULES = new Set<AmbientId>(['starfield', 'pulseStars', 'comets']);
const DEMO_FLING_DELAY_MS = 1200;
const PULL_HINT_PLANET_ID = 'typescript';
const TAP_HINT_PLANET_ID = 'docker';

function renderAmbient(ids: readonly AmbientId[], motionMode: CosmosMotionMode) {
  return ids.map((id) => {
    const { Layer } = AMBIENT_REGISTRY[id];

    return <Layer key={id} motionMode={motionMode} />;
  });
}

export function CosmosStage() {
  const { t, locale } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const planetElsRef = useRef(new Map<string, HTMLElement | null>());
  const demoFlingDoneRef = useRef(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activePlanet, setActivePlanet] = useState<Planet | null>(null);
  const [motionMode, setMotionMode] = useState<CosmosMotionMode>(() => readCosmosMotionMode());

  const { teaseActive, markTeaseDone } = useCosmosHints();

  const interactionId = draggingId ?? hoveredId;
  const { bodiesRef } = useBouncePhysics(
    stageRef,
    planetElsRef,
    CORE_PLANET.size,
    interactionId,
    motionMode,
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
    bodiesRef,
    planetElsRef,
    setDraggingId,
    setHoveredId,
    onOpen: openPlanet,
    onThrow: () => {
      markInteracted();
      demoFlingDoneRef.current = true;
    },
  });

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

      const demoPlanet = ORBIT_PLANETS.find((planet) => planet.id === PULL_HINT_PLANET_ID)
        ?? ORBIT_PLANETS[0];
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
  }, [bodiesRef, motionMode, teaseActive]);

  const stageClassName = teaseActive ? 'stage hinting' : 'stage';
  const isPaused = motionMode === 'paused';
  const starIds = ACTIVE_PRESET.modules.filter((id) => STAR_MODULES.has(id));
  const overlayIds = ACTIVE_PRESET.modules.filter((id) => !STAR_MODULES.has(id));

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

        {ORBIT_PLANETS.map((planet, index) => {
          const isActive = interactionId === planet.id;
          const isDragging = draggingId === planet.id;
          const teaseAlt = index % 2 === 1 ? ' tease-alt' : '';
          const showPlanetPull = planet.id === PULL_HINT_PLANET_ID;
          const showPlanetTap = planet.id === TAP_HINT_PLANET_ID;

          return (
            <button
              key={planet.id}
              type="button"
              ref={(node) => {
                planetElsRef.current.set(planet.id, node);
              }}
              className={`planet${teaseAlt}${isActive ? ' paused' : ''}${isDragging ? ' dragging' : ''}`}
              style={{
                width: `${planet.size}px`,
                height: `${planet.size}px`,
              }}
              onPointerEnter={() => throwHandlers.onPointerEnter(planet)}
              onPointerLeave={() => throwHandlers.onPointerLeave(planet)}
              onPointerDown={(event) => {
                markInteracted();
                throwHandlers.onPointerDown(planet, event);
              }}
              onPointerMove={(event) => throwHandlers.onPointerMove(planet, event)}
              onPointerUp={(event) => throwHandlers.onPointerUp(planet, event)}
              onPointerCancel={(event) => throwHandlers.onPointerCancel(planet, event)}
              aria-label={t('planetTapAria', { name: planet.name })}
              title={t('planetTapTitle')}
            >
              {showPlanetPull ? (
                <span className="planet-pull-hint" aria-hidden="true">
                  {t('hintPull')}
                </span>
              ) : null}
              {showPlanetTap ? (
                <span className="planet-pull-hint" aria-hidden="true">
                  {t('hintTap')}
                </span>
              ) : null}
              <img src={planet.icon} alt="" draggable={false} />
            </button>
          );
        })}

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
