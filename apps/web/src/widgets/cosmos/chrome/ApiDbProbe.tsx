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
  body: string;
};

const IDLE_RESULT: ProbeResult = {
  status: 'idle',
  kind: null,
  body: '',
};

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
    setResult({ status: 'loading', kind: 'api', body: t('apiDbLoading') });
    const ok = await pingBackend();

    if (ok) {
      setResult({
        status: 'ok',
        kind: 'api',
        body: JSON.stringify({ __typename: 'Query' }, null, 2),
      });
      return;
    }

    setResult({
      status: 'error',
      kind: 'api',
      body: t('apiDbDown'),
    });
  };

  const runDb = async () => {
    setResult({ status: 'loading', kind: 'db', body: t('apiDbLoading') });

    try {
      const profile = await fetchProfile(locale);
      setResult({
        status: 'ok',
        kind: 'db',
        body: JSON.stringify({ name: profile.name, role: profile.role }, null, 2),
      });
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : t('apiDbDown');
      setResult({
        status: 'error',
        kind: 'db',
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
        className="api-db-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('apiDbAria')}
        title={t('apiDbButton')}
        onClick={() => {
          setOpen((current) => !current);
        }}
      >
        <span className="label">{t('apiDbButton')}</span>
      </button>

      {open ? (
        <div className="api-db-panel" id={panelId} role="region" aria-label={t('apiDbAria')}>
          <div className={`api-db-pocket is-${result.status}`} aria-live="polite">
            {result.status === 'idle' ? (
              <p className="api-db-pocket-idle">{t('apiDbIdle')}</p>
            ) : (
              <>
                <div className="api-db-pocket-head">
                  <p className="api-db-pocket-title">{kindTitle}</p>
                  {statusLabel !== null ? (
                    <span className={`api-db-badge is-${result.status}`}>{statusLabel}</span>
                  ) : null}
                </div>
                <pre className="api-db-pocket-body">{result.body}</pre>
              </>
            )}
          </div>

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
        </div>
      ) : null}
    </div>
  );
}
