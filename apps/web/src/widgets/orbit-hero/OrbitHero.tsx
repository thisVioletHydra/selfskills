import type { TechStackItem } from "#app/entities/skill/tech-stack";

import { CORE_TECH, ORBIT_TECH } from "#app/entities/skill/tech-stack";
import { TechModal } from "#app/features/tech-modal/TechModal";
import {
  readOrbitMotionMode,
  writeOrbitMotionMode,
  type OrbitMotionMode,
} from "#app/shared/lib/orbit-motion-state";
import { OrbitComets } from "#app/widgets/orbit-hero/OrbitComet";
import { OrbitHaze } from "#app/widgets/orbit-hero/OrbitHaze";
import { OrbitPulseStars } from "#app/widgets/orbit-hero/OrbitPulseStars";
import { useBouncePhysics } from "#app/widgets/orbit-hero/useBouncePhysics";
import { useIconThrow } from "#app/widgets/orbit-hero/useIconThrow";
import { useOrbitHints } from "#app/widgets/orbit-hero/useOrbitHints";
import { useRef, useState } from "react";
import "#app/widgets/orbit-hero/orbit-hero.css";

export function OrbitHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const satelliteElsRef = useRef(new Map<string, HTMLElement | null>());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeTech, setActiveTech] = useState<TechStackItem | null>(null);
  const [motionMode, setMotionMode] = useState<OrbitMotionMode>(() => readOrbitMotionMode());

  const {
    showTapHint,
    showThrowHint,
    teaseActive,
    tapHiding,
    throwHiding,
    dismissTapHint,
    dismissThrowHint,
    finishTapHintHide,
    finishThrowHintHide,
    markTeaseDone,
  } = useOrbitHints();

  const interactionId = draggingId ?? hoveredId;
  const { bodiesRef } = useBouncePhysics(
    stageRef,
    satelliteElsRef,
    CORE_TECH.size,
    interactionId,
    motionMode,
  );

  const toggleMotion = () => {
    const next: OrbitMotionMode = motionMode === "auto" ? "paused" : "auto";
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

  const throwHandlers = useIconThrow({
    stageRef,
    bodiesRef,
    satelliteElsRef,
    draggingId,
    setDraggingId,
    setHoveredId,
    onOpen: openTech,
    onThrow: () => {
      markInteracted();
      dismissThrowHint();
    },
  });

  const stageClassName = teaseActive ? "stage hinting" : "stage";
  const hintsVisible = showTapHint || showThrowHint || tapHiding || throwHiding;
  const isPaused = motionMode === "paused";

  return (
    <section className="orbit-hero" id="hero">
      <div className={stageClassName} ref={stageRef}>
        <div className="stars" aria-hidden="true">
          <div className="stars-far" />
          <OrbitHaze />
          <div className="stars-mid" />
          <div className="stars-near" />
          <OrbitPulseStars />
          <OrbitComets />
        </div>
        <div className="glow" aria-hidden="true" />

        <button
          type="button"
          className="motion-chip"
          onClick={toggleMotion}
          aria-pressed={isPaused}
          aria-label={isPaused ? "Запустить орбиту" : "Поставить орбиту на паузу"}
          title={isPaused ? "Play" : "Pause"}
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
          <span className="label">{isPaused ? "Play" : "Pause"}</span>
        </button>

        {hintsVisible && (
          <div className="hints" aria-label="Подсказки">
            {showTapHint && (
              <p
                className={`hint${tapHiding ? " out" : ""}`}
                onAnimationEnd={(event) => {
                  if (event.animationName === "hint-fade-out" && tapHiding) {
                    finishTapHintHide();
                  }
                }}
              >
                <span className="mark" aria-hidden="true">
                  ◎
                </span>
                Тап — карточка
              </p>
            )}
            {showThrowHint && (
              <p
                className={`hint${throwHiding ? " out" : ""}`}
                onAnimationEnd={(event) => {
                  if (event.animationName === "hint-fade-out" && throwHiding) {
                    finishThrowHintHide();
                  }
                }}
              >
                <span className="mark throw" aria-hidden="true">
                  ↗
                </span>
                Зажми и швырни
              </p>
            )}
          </div>
        )}

        <div className="sun" aria-hidden="true">
          <div className="corona outer" />
          <div className="corona mid" />
          <div className="corona core" />
        </div>

        {ORBIT_TECH.map((tech, index) => {
          const isActive = interactionId === tech.id;
          const isDragging = draggingId === tech.id;
          const teaseAlt = index % 2 === 1 ? " tease-alt" : "";

          return (
            <button
              key={tech.id}
              type="button"
              ref={(node) => {
                satelliteElsRef.current.set(tech.id, node);
              }}
              className={`satellite${teaseAlt}${isActive ? " paused" : ""}${isDragging ? " dragging" : ""}`}
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
          className="nucleus"
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
