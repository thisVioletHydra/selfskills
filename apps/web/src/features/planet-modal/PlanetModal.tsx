import type { Planet } from '#web/entities/planet/planets';

import { useLocale } from '#web/shared/i18n/locale-context';
import { useEffect, useRef } from 'react';

import '#web/features/planet-modal/planet-modal.css';

/** Ignore same-gesture backdrop hits after open (Android ghost click). */
const OUTSIDE_CLOSE_GUARD_MS = 400;

type PlanetModalProps = {
  planet: Planet | null;
  onClose: () => void;
};

export function PlanetModal({ planet, onClose }: PlanetModalProps) {
  const { t } = useLocale();
  const openedAtRef = useRef(0);
  const allowOutsideCloseRef = useRef(false);

  useEffect(() => {
    if (planet === null || planet === undefined) {
      allowOutsideCloseRef.current = false;
      return;
    }

    openedAtRef.current = performance.now();
    allowOutsideCloseRef.current = false;

    const timer = window.setTimeout(() => {
      allowOutsideCloseRef.current = true;
    }, OUTSIDE_CLOSE_GUARD_MS);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [planet, onClose]);

  if (planet === null || planet === undefined) {
    return null;
  }

  const tryCloseOutside = () => {
    if (!allowOutsideCloseRef.current) {
      return;
    }

    if (performance.now() - openedAtRef.current < OUTSIDE_CLOSE_GUARD_MS) {
      return;
    }

    onClose();
  };

  return (
    <div
      className="planet-modal"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        tryCloseOutside();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        tryCloseOutside();
      }}
    >
      <dialog
        className="panel"
        open
        aria-labelledby="planet-modal-title"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="close" onClick={onClose} aria-label={t('planetModalClose')}>
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
            <dt>{t('planetModalName')}</dt>
            <dd>
              {planet.name} / {planet.reading}
            </dd>
          </div>
          <div className="field">
            <dt>{t('planetModalSummary')}</dt>
            <dd>{planet.summary}</dd>
          </div>
          <div className="field">
            <dt>{t('planetModalExperience')}</dt>
            <dd>{planet.experience}</dd>
          </div>
        </dl>
      </dialog>
    </div>
  );
}
