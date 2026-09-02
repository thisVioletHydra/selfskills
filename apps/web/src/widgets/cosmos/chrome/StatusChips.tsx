import type { HealthSnapshot } from '#web/shared/api/health-api';

import { useHealth } from '#web/shared/api/useHealth';
import { useLocale } from '#web/shared/i18n/locale-context';
import { useEffect, useId, useRef, useState } from 'react';

import '#web/widgets/cosmos/chrome/status-chip.css';

function overallLamp(health: HealthSnapshot) {
  if (health.api === 'unknown') {
    return 'is-warn';
  }

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

function formatMs(ms: number) {
  return `${ms}\u00A0ms`;
}

export function StatusChips() {
  const { t } = useLocale();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const health = useHealth();
  const [open, setOpen] = useState(false);

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
  const apiLabel =
    health.api === 'up'
      ? t('statusLive')
      : health.api === 'down'
        ? t('statusDown')
        : t('statusUnknown');
  const dbLabel =
    health.db === 'up' ? t('statusLive') : health.db === 'down' ? t('statusDown') : t('statusUnknown');
  const avgPing = health.latencyAvgMs;
  const lastPing = health.latencyMs;

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
        {avgPing !== null ? (
          <span className="status-chip-ping">{formatMs(avgPing)}</span>
        ) : null}
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
              <p className="status-popover-title">
                {t('statusApiCard')}
                {' · '}
                GraphQL
              </p>
              <p className="status-popover-meta">Railway · {apiLabel}</p>
            </div>
          </div>
          <div className="status-popover-row">
            <span className={`status-popover-lamp ${rowState(health.db)}`} aria-hidden="true" />
            <div className="status-popover-copy">
              <p className="status-popover-title">
                {t('statusDbCard')}
                {' · '}
                Postgres
              </p>
              <p className="status-popover-meta">Railway · {dbLabel}</p>
            </div>
          </div>
          {lastPing !== null && avgPing !== null ? (
            <div className="status-popover-metrics" aria-label={t('statusPing')}>
              <div className="status-popover-metric">
                <span className="status-popover-metric-label">{t('statusPingAvg')}</span>
                <span className="status-popover-metric-value">{formatMs(avgPing)}</span>
              </div>
              <div className="status-popover-metric">
                <span className="status-popover-metric-label">{t('statusPingLast')}</span>
                <span className="status-popover-metric-value">{formatMs(lastPing)}</span>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
