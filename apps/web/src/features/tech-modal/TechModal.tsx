import { useEffect } from 'react';
import type { TechStackItem } from '#app/entities/skill/tech-stack';
import '#app/features/tech-modal/tech-modal.css';

type TechModalProps = {
  tech: TechStackItem | null;
  onClose: () => void;
};

export function TechModal({ tech, onClose }: TechModalProps) {
  useEffect(() => {
    if (!tech) {
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

  if (!tech) {
    return null;
  }

  return (
    <div className="tech-modal__backdrop" onClick={onClose} role="presentation">
      <dialog className="tech-modal" open aria-labelledby="tech-modal-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="tech-modal__close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>

        <div className="tech-modal__head">
          <img className="tech-modal__icon" src={tech.icon} alt="" />
          <h2 id="tech-modal-title" className="tech-modal__title">
            {tech.name}
          </h2>
        </div>

        <dl className="tech-modal__fields">
          <div className="tech-modal__field">
            <dt>Название</dt>
            <dd>{tech.name} / {tech.reading}</dd>
          </div>
          <div className="tech-modal__field">
            <dt>Что это такое</dt>
            <dd>{tech.summary}</dd>
          </div>
          <div className="tech-modal__field">
            <dt>Опыт работы</dt>
            <dd>{tech.experience}</dd>
          </div>
        </dl>
      </dialog>
    </div>
  );
}
