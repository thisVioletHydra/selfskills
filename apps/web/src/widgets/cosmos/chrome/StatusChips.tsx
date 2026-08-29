import type { HealthDbStatus, HealthSnapshot } from '#web/shared/api/health-api';

import { fetchHealth, HEALTH_POLL_MS } from '#web/shared/api/health-api';
import { useLocale } from '#web/shared/i18n/locale-context';
import { useEffect, useId, useRef, useState } from 'react';

type ChipKind = 'api' | 'db';

type OpenPopover = ChipKind | null;

function lampClass(status: 'up' | 'down' | 'unknown') {
  if (status === 'up') {
    return 'is-up';
  }

  if (status === 'down') {
    return 'is-down';
  }

  return 'is-unknown';
}

function dbLabel(
  status: HealthDbStatus,
  live: string,
  down: string,
  unknown: string,
) {
  if (status === 'up') {
    return live;
  }

  if (status === 'down') {
    return down;
  }

  return unknown;
}

export function StatusChips() {
  const { t } = useLocale();
  const apiPanelId = useId();
  const dbPanelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [health, setHealth] = useState<HealthSnapshot>({ api: 'down', db: 'unknown' });
  const [open, setOpen] = useState<OpenPopover>(null);

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
    if (open === null) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (root === null || root.contains(event.target as Node)) {
        return;
      }

      setOpen(null);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(null);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const toggle = (kind: ChipKind) => {
    setOpen((current) => (current === kind ? null : kind));
  };

  const apiLive = health.api === 'up';

  return (
    <div className="status-chips" ref={rootRef}>
      <div className="status-chip-wrap">
        <button
          type="button"
          className={`status-chip ${lampClass(health.api)}`}
          aria-expanded={open === 'api'}
          aria-controls={apiPanelId}
          onClick={() => toggle('api')}
        >
          <span className="status-lamp" aria-hidden="true" />
          <span className="label">{t('statusApi')}</span>
        </button>
        {open === 'api' ? (
          <div className="status-popover" id={apiPanelId} role="dialog" aria-label={t('statusApiCard')}>
            <p className="status-popover-title">{t('statusApiCard')}</p>
            <p className="status-popover-meta">Railway · GraphQL</p>
            <p className={`status-popover-state ${lampClass(health.api)}`}>
              {apiLive ? t('statusLive') : t('statusDown')}
            </p>
          </div>
        ) : null}
      </div>

      <div className="status-chip-wrap">
        <button
          type="button"
          className={`status-chip ${lampClass(health.db)}`}
          aria-expanded={open === 'db'}
          aria-controls={dbPanelId}
          onClick={() => toggle('db')}
        >
          <span className="status-lamp" aria-hidden="true" />
          <span className="label">{t('statusDb')}</span>
        </button>
        {open === 'db' ? (
          <div className="status-popover" id={dbPanelId} role="dialog" aria-label={t('statusDbCard')}>
            <p className="status-popover-title">{t('statusDbCard')}</p>
            <p className="status-popover-meta">Neon · Postgres</p>
            <p className={`status-popover-state ${lampClass(health.db)}`}>
              {dbLabel(health.db, t('statusLive'), t('statusDown'), t('statusUnknown'))}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
