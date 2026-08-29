import type { Planet } from '#web/entities/planet/planets';
import type { OrbitMotionMode } from '#web/shared/lib/orbit-motion-state';

import { CORE_PLANET, ORBIT_PLANETS } from '#web/entities/planet/planets';
import { localizePlanet } from '#web/entities/planet/localizePlanet';
import { PlanetModal } from '#web/features/planet-modal/PlanetModal';
import { resetOrbitHintState } from '#web/shared/lib/orbit-hint-state';
import { readOrbitMotionMode, writeOrbitMotionMode } from '#web/shared/lib/orbit-motion-state';
import { useLocale } from '#web/shared/i18n/locale-context';
import { OrbitComets } from '#web/widgets/orbit-hero/OrbitComet';
import { OrbitHaze } from '#web/widgets/orbit-hero/OrbitHaze';
import { OrbitPulseStars } from '#web/widgets/orbit-hero/OrbitPulseStars';
import { useBouncePhysics } from '#web/widgets/orbit-hero/useBouncePhysics';
import { useOrbitHints } from '#web/widgets/orbit-hero/useOrbitHints';
import { usePlanetThrow } from '#web/widgets/orbit-hero/usePlanetThrow';
import { useRef, useState } from 'react';

import '#web/widgets/orbit-hero/orbit-hero.css';

export function OrbitHero() {
  const { t, locale } = useLocale();
  const stageRef = useRef<HTMLDivElement>(null);
  const planetElsRef = useRef(new Map<string, HTMLElement | null>());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activePlanet, setActivePlanet] = useState<Planet | null>(null);
  const [motionMode, setMotionMode] = useState<OrbitMotionMode>(() => readOrbitMotionMode());

  const { hints, teaseActive, dismissTapHint, dismissThrowHint, finishHide, markTeaseDone } =
    useOrbitHints(t);

  const interactionId = draggingId ?? hoveredId;
  const { bodiesRef } = useBouncePhysics(
    stageRef,
    planetElsRef,
    CORE_PLANET.size,
    interactionId,
    motionMode,
  );

  const toggleMotion = () => {
    const next: OrbitMotionMode = motionMode === 'auto' ? 'paused' : 'auto';
    writeOrbitMotionMode(next);
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
    },
  });

  const stageClassName = teaseActive ? 'stage hinting' : 'stage';
  const hintsVisible = hints.some((hint) => hint.visible || hint.hiding);
  const isPaused = motionMode === 'paused';

  return (
    <section className="orbit-hero" id="hero">
      <div className={stageClassName} ref={stageRef}>
        <div className="stars" aria-hidden="true">
          <div className="stars-far" />
          <div className="stars-mid" />
          <div className="stars-near" />
          <OrbitPulseStars />
          <OrbitComets motionMode={motionMode} />
        </div>
        <OrbitHaze motionMode={motionMode} />
        <div className="glow" aria-hidden="true" />

        <button
          type="button"
          className="hints-reset"
          onClick={() => resetOrbitHintState()}
          aria-label={t('hintsReset')}
          title={t('hintsReset')}
        >
          <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3.2 3.2a5.6 5.6 0 0 1 9.1 1.3M12.8 12.8a5.6 5.6 0 0 1-9.1-1.3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M12.8 2.4v3.2h-3.2M3.2 13.6v-3.2h3.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          className="motion-chip"
          onClick={toggleMotion}
          aria-pressed={isPaused}
          aria-label={isPaused ? t('orbitPlay') : t('orbitPause')}
          title={isPaused ? t('play') : t('pause')}
        >
          {isPaused ? (
            <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4.2 2.4v11.2L13.2 8 4.2 2.4Z" fill="currentColor" />
            </svg>
          ) : (
            <svg className="glyph" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="3.2" y="2.8" width="3.2" height="10.4" rx="0.6" fill="currentColor" />
              <rect x="9.6" y="2.8" width="3.2" height="10.4" rx="0.6" fill="currentColor" />
            </svg>
          )}
          <span className="label">{isPaused ? t('play') : t('pause')}</span>
        </button>

        {hintsVisible && (
          <div className="hints" aria-label={t('hintsAria')}>
            {hints.map(
              (hint) =>
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

        {ORBIT_PLANETS.map((planet, index) => {
          const isActive = interactionId === planet.id;
          const isDragging = draggingId === planet.id;
          const teaseAlt = index % 2 === 1 ? ' tease-alt' : '';

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
