import type { TechStackItem } from '#app/entities/skill/tech-stack';

import { useEffect } from 'react';
import '#app/features/tech-modal/tech-modal.css';

type TechModalProps = {
  tech: TechStackItem | null;
  onClose: () => void;
};

export function TechModal({ tech, onClose }: TechModalProps) {
  useEffect(() => {
    if (tech == null) {
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
  }, [tech, onClose]);

  if (tech == null) {
    return null;
  }

  return (
    <div className="tech-modal" onClick={onClose} role="presentation">
      <dialog
        className="panel"
        open
        aria-labelledby="tech-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>

        <div className="head">
          <img className="icon" src={tech.icon} alt="" />
          <h2 id="tech-modal-title" className="title">
            {tech.name}
          </h2>
        </div>

        <dl className="fields">
          <div className="field">
            <dt>Название</dt>
            <dd>
              {tech.name} / {tech.reading}
            </dd>
          </div>
          <div className="field">
            <dt>Что это такое</dt>
            <dd>{tech.summary}</dd>
          </div>
          <div className="field">
            <dt>Опыт работы</dt>
            <dd>{tech.experience}</dd>
          </div>
        </dl>
      </dialog>
    </div>
  );
}
