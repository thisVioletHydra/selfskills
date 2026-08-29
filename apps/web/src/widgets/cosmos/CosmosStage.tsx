import type { Planet } from '#web/entities/planet/planets';
import type { AmbientId } from '#web/widgets/cosmos/ambient/types';
import type { CosmosMotionMode } from '#web/widgets/cosmos/lib/motion-state';

import { CORE_PLANET } from '#web/entities/planet/planets';
import { localizePlanet } from '#web/entities/planet/localizePlanet';
import { PlanetModal } from '#web/features/planet-modal/PlanetModal';
import { AMBIENT_REGISTRY } from '#web/widgets/cosmos/ambient/registry';
import { HintsResetButton } from '#web/widgets/cosmos/chrome/HintsResetButton';
import { MotionChip } from '#web/widgets/cosmos/chrome/MotionChip';
import { StatusChips } from '#web/widgets/cosmos/chrome/StatusChips';
import { useCosmosHints } from '#web/widgets/cosmos/chrome/useCosmosHints';
import { ACTIVE_PRESET } from '#web/widgets/cosmos/config/presets';
import { readCosmosMotionMode, writeCosmosMotionMode } from '#web/widgets/cosmos/lib/motion-state';
import { subscribeCosmosHintReset } from '#web/widgets/cosmos/lib/hint-state';
import {
  COMPACT_WIDTH_PX,
  orbitPlanetsForWidth,
  useBouncePhysics,
} from '#web/widgets/cosmos/physics/useBouncePhysics';
import { usePlanetThrow } from '#web/widgets/cosmos/physics/usePlanetThrow';
import { useLocale } from '#web/shared/i18n/locale-context';
import { useEffect, useRef, useState } from 'react';

import '#web/widgets/cosmos/cosmos-stage.css';

const STAR_MODULES = new Set<AmbientId>(['starfield', 'pulseStars', 'comets']);
const DEMO_FLING_DELAY_MS = 1200;
const DEMO_PLANET_INDEX = 0;

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
  const [orbitPlanets, setOrbitPlanets] = useState(() =>
    orbitPlanetsForWidth(typeof window === 'undefined' ? COMPACT_WIDTH_PX : window.innerWidth),
  );

  useEffect(() => {
    const media = window.matchMedia(`(width < ${COMPACT_WIDTH_PX}px)`);
    const sync = () => {
      setOrbitPlanets(orbitPlanetsForWidth(window.innerWidth));
    };

    sync();
    media.addEventListener('change', sync);

    return () => {
      media.removeEventListener('change', sync);
    };
  }, []);

  const { hints, teaseActive, dismissTapHint, dismissThrowHint, finishHide, markTeaseDone } =
    useCosmosHints(t);

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
    dismissTapHint();
    setActivePlanet(planet);
  };

  const throwHandlers = usePlanetThrow({
    stageRef,
    bodiesRef,
    planetElsRef,
    draggingId,
    setDraggingId,
    setHoveredId,
    onOpen: openPlanet,
    onThrow: () => {
      markInteracted();
      dismissThrowHint();
      demoFlingDoneRef.current = true;
    },
  });

  useEffect(() => {
    return subscribeCosmosHintReset(() => {
      demoFlingDoneRef.current = false;
    });
  }, []);

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

      const demoPlanet = orbitPlanets[DEMO_PLANET_INDEX] ?? orbitPlanets[0];
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
  const hintsVisible = hints.some((hint) => hint.visible || hint.hiding);
  const isPaused = motionMode === 'paused';
  const showPullHint = teaseActive;
  const pullPlanetId = orbitPlanets[DEMO_PLANET_INDEX]?.id ?? orbitPlanets[0]?.id;
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

        <HintsResetButton label={t('hintsReset')} />

        <div className="chrome-left">
          <div className="motion-chip-stack">
            <MotionChip
              isPaused={isPaused}
              onToggle={toggleMotion}
              playLabel={t('play')}
              pauseLabel={t('pause')}
              ariaPlay={t('orbitPlay')}
              ariaPause={t('orbitPause')}
            />
            <span className="app-version" aria-hidden="true">
              v1.1.1
            </span>
          </div>
          <StatusChips />
        </div>

        {hintsVisible && (
          <div className="hints" aria-label={t('hintsAria')}>
            {hints.map((hint) =>
              hint.visible ? (
                <p
                  key={hint.key}
                  className={`hint${hint.hiding ? ' out' : ''}`}
                  onAnimationEnd={(event) => {
                    if (event.animationName === 'hint-fade-out' && hint.hiding) {
                      finishHide(hint.key);
                    }
                  }}
                >
                  <span className={hint.markClass} aria-hidden="true">
                    {hint.mark}
                  </span>
                  {hint.text}
                </p>
              ) : null,
            )}
          </div>
        )}

        <div className="star" aria-hidden="true">
          <div className="corona outer" />
          <div className="corona mid" />
          <div className="corona core" />
        </div>

        {orbitPlanets.map((planet, index) => {
          const isActive = interactionId === planet.id;
          const isDragging = draggingId === planet.id;
          const teaseAlt = index % 2 === 1 ? ' tease-alt' : '';
          const showPlanetPull = showPullHint && planet.id === pullPlanetId;

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
              onPointerCancel={() => throwHandlers.onPointerCancel(planet)}
              aria-label={t('planetTapAria', { name: planet.name })}
              title={t('planetTapTitle')}
            >
              {showPlanetPull ? (
                <span className="planet-pull-hint" aria-hidden="true">
                  {t('hintPull')}
                </span>
              ) : null}
              <img src={planet.icon} alt="" draggable={false} />
            </button>
          );
        })}

        <button
          type="button"
          className="supernova"
          onClick={() => openPlanet(CORE_PLANET)}
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
