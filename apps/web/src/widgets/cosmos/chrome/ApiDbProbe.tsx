import { fetchProfile } from '#web/shared/api/profile-api';
import { pingBackend } from '#web/shared/api/ping-api';
import { useLocale } from '#web/shared/i18n/locale-context';
import { useEffect, useId, useRef, useState } from 'react';

import '#web/widgets/cosmos/chrome/api-db-probe.css';

type ProbeKind = 'api' | 'db';
type ProbeStatus = 'idle' | 'loading' | 'ok' | 'error';

type ProbeResult = {
  status: ProbeStatus;
  kind: ProbeKind | null;
  ms: number | null;
  body: string;
};

const IDLE_RESULT: ProbeResult = {
  status: 'idle',
  kind: null,
  ms: null,
  body: '',
};

function formatMs(ms: number) {
  return `${ms}\u00A0ms`;
}

export function ApiDbProbe() {
  const { t, locale } = useLocale();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ProbeResult>(IDLE_RESULT);

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

  const runApi = async () => {
    setResult({ status: 'loading', kind: 'api', ms: null, body: t('apiDbLoading') });
    const started = performance.now();
    const ok = await pingBackend();
    const ms = Math.round(performance.now() - started);

    if (ok) {
      setResult({
        status: 'ok',
        kind: 'api',
        ms,
        body: JSON.stringify({ __typename: 'Query' }, null, 2),
      });
      return;
    }

    setResult({
      status: 'error',
      kind: 'api',
      ms,
      body: t('apiDbDown'),
    });
  };

  const runDb = async () => {
    setResult({ status: 'loading', kind: 'db', ms: null, body: t('apiDbLoading') });
    const started = performance.now();

    try {
      const profile = await fetchProfile(locale);
      const ms = Math.round(performance.now() - started);
      setResult({
        status: 'ok',
        kind: 'db',
        ms,
        body: JSON.stringify({ name: profile.name, role: profile.role }, null, 2),
      });
    } catch (caught: unknown) {
      const ms = Math.round(performance.now() - started);
      const message = caught instanceof Error ? caught.message : t('apiDbDown');
      setResult({
        status: 'error',
        kind: 'db',
        ms,
        body: message,
      });
    }
  };

  const kindTitle =
    result.kind === 'api'
      ? `${t('statusApiCard')} · GraphQL`
      : result.kind === 'db'
        ? `${t('statusDbCard')} · Postgres`
        : null;
  const statusLabel =
    result.status === 'ok'
      ? t('apiDbOk')
      : result.status === 'error'
        ? t('apiDbFail')
        : result.status === 'loading'
          ? t('apiDbLoading')
          : null;

  return (
    <div className="api-db-probe" ref={rootRef}>
      <button
        type="button"
        className={`api-db-trigger${result.status === 'ok' ? ' is-ok' : ''}${result.status === 'error' ? ' is-error' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('apiDbAria')}
        title={t('apiDbButton')}
        onClick={() => {
          setOpen((current) => !current);
        }}
      >
        <span className="api-db-trigger-lamp" aria-hidden="true" />
        <span className="label">{t('apiDbButton')}</span>
        {result.ms !== null ? (
          <span className="api-db-trigger-ping">{formatMs(result.ms)}</span>
        ) : null}
      </button>

      {open ? (
        <div className="api-db-panel" id={panelId} role="region" aria-label={t('apiDbAria')}>
          <div className="api-db-actions">
            <button
              type="button"
              className={`api-db-action${result.kind === 'api' ? ' is-active' : ''}`}
              disabled={result.status === 'loading'}
              onClick={() => {
                void runApi();
              }}
            >
              {t('apiDbTestApi')}
            </button>
            <button
              type="button"
              className={`api-db-action${result.kind === 'db' ? ' is-active' : ''}`}
              disabled={result.status === 'loading'}
              onClick={() => {
                void runDb();
              }}
            >
              {t('apiDbTestDb')}
            </button>
          </div>

          <div className={`api-db-pocket is-${result.status}`} aria-live="polite">
            {result.status === 'idle' ? (
              <p className="api-db-pocket-idle">{t('apiDbIdle')}</p>
            ) : (
              <>
                <div className="api-db-pocket-head">
                  <p className="api-db-pocket-title">{kindTitle}</p>
                  <div className="api-db-pocket-stats">
                    {statusLabel !== null ? (
                      <span className={`api-db-badge is-${result.status}`}>{statusLabel}</span>
                    ) : null}
                    {result.ms !== null ? (
                      <span className="api-db-latency">{formatMs(result.ms)}</span>
                    ) : null}
                  </div>
                </div>
                <pre className="api-db-pocket-body">{result.body}</pre>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
