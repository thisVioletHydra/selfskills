import type { TechStackItem } from '#web/entities/skill/tech-stack';
import type { OrbitMotionMode } from '#web/shared/lib/orbit-motion-state';

import { CORE_TECH, ORBIT_TECH } from '#web/entities/skill/tech-stack';
import { TechModal } from '#web/features/tech-modal/TechModal';
import { resetOrbitHintState } from '#web/shared/lib/orbit-hint-state';
import { readOrbitMotionMode, writeOrbitMotionMode } from '#web/shared/lib/orbit-motion-state';
import { OrbitComets } from '#web/widgets/orbit-hero/OrbitComet';
import { OrbitHaze } from '#web/widgets/orbit-hero/OrbitHaze';
import { OrbitPulseStars } from '#web/widgets/orbit-hero/OrbitPulseStars';
import { useBouncePhysics } from '#web/widgets/orbit-hero/useBouncePhysics';
import { useOrbitHints } from '#web/widgets/orbit-hero/useOrbitHints';
import { usePlanetThrow } from '#web/widgets/orbit-hero/usePlanetThrow';
import { useRef, useState } from 'react';
import '#web/widgets/orbit-hero/orbit-hero.css';

export function OrbitHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const planetElsRef = useRef(new Map<string, HTMLElement | null>());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeTech, setActiveTech] = useState<TechStackItem | null>(null);
  const [motionMode, setMotionMode] = useState<OrbitMotionMode>(() => readOrbitMotionMode());

  const { hints, teaseActive, dismissTapHint, dismissThrowHint, finishHide, markTeaseDone } =
    useOrbitHints();

  const interactionId = draggingId ?? hoveredId;
  const { bodiesRef } = useBouncePhysics(
    stageRef,
    planetElsRef,
    CORE_TECH.size,
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

  const openTech = (tech: TechStackItem) => {
    markInteracted();
    dismissTapHint();
    setActiveTech(tech);
  };

  const throwHandlers = usePlanetThrow({
    stageRef,
    bodiesRef,
    planetElsRef,
    draggingId,
    setDraggingId,
    setHoveredId,
    onOpen: openTech,
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
          aria-label="Сбросить подсказки"
          title="Сбросить подсказки"
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
          aria-label={isPaused ? 'Запустить орбиту' : 'Поставить орбиту на паузу'}
          title={isPaused ? 'Play' : 'Pause'}
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
          <span className="label">{isPaused ? 'Play' : 'Pause'}</span>
        </button>

        {hintsVisible && (
          <div className="hints" aria-label="Подсказки">
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

        {ORBIT_TECH.map((tech, index) => {
          const isActive = interactionId === tech.id;
          const isDragging = draggingId === tech.id;
          const teaseAlt = index % 2 === 1 ? ' tease-alt' : '';

          return (
            <button
              key={tech.id}
              type="button"
              ref={(node) => {
                planetElsRef.current.set(tech.id, node);
              }}
              className={`planet${teaseAlt}${isActive ? ' paused' : ''}${isDragging ? ' dragging' : ''}`}
              style={{
                width: `${tech.size}px`,
                height: `${tech.size}px`,
              }}
              onPointerEnter={() => throwHandlers.onPointerEnter(tech)}
              onPointerLeave={() => throwHandlers.onPointerLeave(tech)}
              onPointerDown={(event) => {
                markInteracted();
                throwHandlers.onPointerDown(tech, event);
              }}
              onPointerMove={(event) => throwHandlers.onPointerMove(tech, event)}
              onPointerUp={(event) => throwHandlers.onPointerUp(tech, event)}
              onPointerCancel={() => throwHandlers.onPointerCancel(tech)}
              aria-label={`${tech.name}. Тап — карточка. Зажми и швырни.`}
              title="Тап — карточка · зажми и швырни"
            >
              <img src={tech.icon} alt="" draggable={false} />
            </button>
          );
        })}

        <button
          type="button"
          className="supernova"
          onClick={() => openTech(CORE_TECH)}
          aria-label={`${CORE_TECH.name}. Тап — открыть карточку.`}
          title="Тап — карточка JavaScript"
        >
          <img src={CORE_TECH.icon} alt="" draggable={false} />
        </button>

        <div className="copy">
          <p className="tag">стек с орбиты</p>
          <h1 className="title">
            JS в центре.
            <br />
            Остальное — орбиты.
          </h1>
          <p className="sub">
            Не витрина «всего интернета» — только то, с чем реально работал. Тап — карточка, зажми и
            швырни — полёт.
          </p>
        </div>
      </div>

      <TechModal tech={activeTech} onClose={() => setActiveTech(null)} />
    </section>
  );
}
