import type { HealthSnapshot } from '#web/shared/api/health-api';

import { fetchHealth, HEALTH_POLL_MS } from '#web/shared/api/health-api';
import { useLocale } from '#web/shared/i18n/locale-context';
import { useEffect, useId, useRef, useState } from 'react';

import '#web/widgets/cosmos/chrome/status-chip.css';

function overallLamp(health: HealthSnapshot) {
  if (health.api === 'up' && health.db === 'up') {
    return 'is-up';
  }

  if (health.api === 'up') {
    return 'is-warn';
  }

  return 'is-down';
}

function rowState(status: 'up' | 'down' | 'unknown') {
  if (status === 'up') {
    return 'is-up';
  }

  if (status === 'down') {
    return 'is-down';
  }

  return 'is-unknown';
}

export function StatusChips() {
  const { t } = useLocale();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [health, setHealth] = useState<HealthSnapshot>({ api: 'down', db: 'unknown' });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      const next = await fetchHealth();
      if (!cancelled) {
        setHealth(next);
      }
    };

    void poll();
    const timer = window.setInterval(() => {
      void poll();
    }, HEALTH_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root === null || root.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const lamp = overallLamp(health);
  const apiLabel = health.api === 'up' ? t('statusLive') : t('statusDown');
  const dbLabel =
    health.db === 'up' ? t('statusLive') : health.db === 'down' ? t('statusDown') : t('statusUnknown');

  return (
    <div className="status-chip" ref={rootRef}>
      <button
        type="button"
        className={`status-chip-btn ${lamp}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('statusLabel')}
        title={t('statusLabel')}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="status-lamp" aria-hidden="true" />
        <span className="status-chip-label">{t('statusLabel')}</span>
      </button>

      {open ? (
        <div
          className="status-popover"
          id={panelId}
          role="dialog"
          aria-label={t('statusLabel')}
        >
          <div className="status-popover-row">
            <span className={`status-popover-lamp ${rowState(health.api)}`} aria-hidden="true" />
            <div className="status-popover-copy">
              <p className="status-popover-title">{t('statusApiCard')}</p>
              <p className="status-popover-meta">Railway · GraphQL · {apiLabel}</p>
            </div>
          </div>
          <div className="status-popover-row">
            <span className={`status-popover-lamp ${rowState(health.db)}`} aria-hidden="true" />
            <div className="status-popover-copy">
              <p className="status-popover-title">{t('statusDbCard')}</p>
              <p className="status-popover-meta">Neon · Postgres · {dbLabel}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
