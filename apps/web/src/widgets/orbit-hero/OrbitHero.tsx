import { useRef, useState } from 'react';
import { CORE_TECH, ORBIT_TECH, type TechStackItem } from '#app/entities/skill/tech-stack';
import { TechModal } from '#app/features/tech-modal/TechModal';
import { useBouncePhysics } from '#app/widgets/orbit-hero/useBouncePhysics';
import { useIconThrow } from '#app/widgets/orbit-hero/useIconThrow';
import { useOrbitHints } from '#app/widgets/orbit-hero/useOrbitHints';
import '#app/widgets/orbit-hero/orbit-hero.css';

export function OrbitHero() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [activeTech, setActiveTech] = useState<TechStackItem | null>(null);

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
  const { bodies, bodiesRef } = useBouncePhysics(stageRef, CORE_TECH.size, interactionId);

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
    draggingId,
    setDraggingId,
    setHoveredId,
    onOpen: openTech,
    onThrow: () => {
      markInteracted();
      dismissThrowHint();
    },
  });

  const stageClassName = teaseActive
    ? 'orbit-hero__stage orbit-hero__stage--hinting'
    : 'orbit-hero__stage';

  const hintsVisible = showTapHint || showThrowHint || tapHiding || throwHiding;

  return (
    <section className="orbit-hero" id="hero">
      <div className={stageClassName} ref={stageRef}>
        <div className="orbit-hero__glow" aria-hidden="true" />

        {hintsVisible && (
          <div className="orbit-hero__hints" aria-label="Подсказки">
            {showTapHint && (
              <p
                className={`orbit-hint${tapHiding ? ' orbit-hint--out' : ''}`}
                onAnimationEnd={(event) => {
                  if (event.animationName === 'hint-fade-out' && tapHiding) {
                    finishTapHintHide();
                  }
                }}
              >
                <span className="orbit-hint__mark" aria-hidden="true">◎</span>
                Тап — карточка
              </p>
            )}
            {showThrowHint && (
              <p
                className={`orbit-hint${throwHiding ? ' orbit-hint--out' : ''}`}
                onAnimationEnd={(event) => {
                  if (event.animationName === 'hint-fade-out' && throwHiding) {
                    finishThrowHintHide();
                  }
                }}
              >
                <span className="orbit-hint__mark orbit-hint__mark--throw" aria-hidden="true">↗</span>
                Зажми и швырни
              </p>
            )}
          </div>
        )}

        <div className="orbit-sun" aria-hidden="true">
          <div className="orbit-sun__corona orbit-sun__corona--outer" />
          <div className="orbit-sun__corona orbit-sun__corona--mid" />
          <div className="orbit-sun__corona orbit-sun__corona--core" />
        </div>

        {ORBIT_TECH.map((tech, index) => {
          const body = bodies.find((item) => item.id === tech.id);
          const isActive = interactionId === tech.id;
          const isDragging = draggingId === tech.id;
          const teaseAlt = index % 2 === 1 ? ' orbit-satellite--tease-alt' : '';

          return (
            <button
              key={tech.id}
              type="button"
              className={`orbit-satellite${teaseAlt}${isActive ? ' orbit-satellite--paused' : ''}${isDragging ? ' orbit-satellite--dragging' : ''}`}
              style={{
                left: body ? `${body.x}px` : '50%',
                top: body ? `${body.y}px` : '42%',
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
          className="orbit-nucleus"
          onClick={() => openTech(CORE_TECH)}
          aria-label={`${CORE_TECH.name}. Тап — открыть карточку.`}
          title="Тап — карточка JavaScript"
        >
          <img src={CORE_TECH.icon} alt="" draggable={false} />
        </button>

        <div className="orbit-hero__copy">
          <p className="orbit-hero__tag">fullstack</p>
          <h1 className="orbit-hero__title">
            JS в центре.
            <br />
            Остальное — орбиты.
          </h1>
          <p className="orbit-hero__sub">
            Иконки живые: тап без движения — карточка, зажми и отпусти — полёт. Наведи — пауза.
          </p>
        </div>
      </div>

      <TechModal tech={activeTech} onClose={() => setActiveTech(null)} />
    </section>
  );
}
