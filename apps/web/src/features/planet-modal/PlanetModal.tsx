import type { Planet } from '#web/entities/planet/planets';

import { useEffect } from 'react';
import '#web/features/planet-modal/planet-modal.css';

type PlanetModalProps = {
  planet: Planet | null;
  onClose: () => void;
};

export function PlanetModal({ planet, onClose }: PlanetModalProps) {
  useEffect(() => {
    if (planet === null || planet === undefined) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [planet, onClose]);

  if (planet === null || planet === undefined) {
    return null;
  }

  return (
    <div className="planet-modal" onClick={onClose} role="presentation">
      <dialog
        className="panel"
        open
        aria-labelledby="planet-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>

        <div className="head">
          <img className="icon" src={planet.icon} alt="" />
          <h2 id="planet-modal-title" className="title">
            {planet.name}
          </h2>
        </div>

        <dl className="fields">
          <div className="field">
            <dt>Название</dt>
            <dd>
              {planet.name} / {planet.reading}
            </dd>
          </div>
          <div className="field">
            <dt>Что это такое</dt>
            <dd>{planet.summary}</dd>
          </div>
          <div className="field">
            <dt>Опыт работы</dt>
            <dd>{planet.experience}</dd>
          </div>
        </dl>
      </dialog>
    </div>
  );
}
