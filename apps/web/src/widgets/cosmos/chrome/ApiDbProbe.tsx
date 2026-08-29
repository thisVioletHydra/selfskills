import { fetchProfile } from '#web/shared/api/profile-api';
import { graphqlUrl } from '#web/shared/api/graphql-url';
import { pingBackend } from '#web/shared/api/ping-api';
import { useLocale } from '#web/shared/i18n/locale-context';
import { useEffect, useId, useRef, useState } from 'react';

import '#web/widgets/cosmos/chrome/api-db-probe.css';

type ProbeStatus = 'idle' | 'loading' | 'ok' | 'error';

type ProbeResult = {
  status: ProbeStatus;
  text: string;
};

const IDLE_RESULT: ProbeResult = { status: 'idle', text: '' };

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
    setResult({ status: 'loading', text: t('apiDbLoading') });
    const started = performance.now();
    const ok = await pingBackend();
    const ms = Math.round(performance.now() - started);

    if (ok) {
      setResult({
        status: 'ok',
        text: `ok · ${ms}ms · { "__typename": "Query" }`,
      });
      return;
    }

    setResult({
      status: 'error',
      text: `fail · ${ms}ms · ${t('apiDbDown')}`,
    });
  };

  const runDb = async () => {
    setResult({ status: 'loading', text: t('apiDbLoading') });
    const started = performance.now();

    try {
      const profile = await fetchProfile(locale);
      const ms = Math.round(performance.now() - started);
      setResult({
        status: 'ok',
        text: `ok · ${ms}ms · ${JSON.stringify({ name: profile.name, role: profile.role })}`,
      });
    } catch (caught: unknown) {
      const ms = Math.round(performance.now() - started);
      const message = caught instanceof Error ? caught.message : t('apiDbDown');
      setResult({
        status: 'error',
        text: `fail · ${ms}ms · ${message}`,
      });
    }
  };

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
          <div className="api-db-actions">
            <button
              type="button"
              className="api-db-action"
              disabled={result.status === 'loading'}
              onClick={() => {
                void runApi();
              }}
            >
              {t('apiDbTestApi')}
            </button>
            <button
              type="button"
              className="api-db-action"
              disabled={result.status === 'loading'}
              onClick={() => {
                void runDb();
              }}
            >
              {t('apiDbTestDb')}
            </button>
          </div>

          <pre
            className={`api-db-pocket is-${result.status}`}
            aria-live="polite"
          >
            {result.text === '' ? t('apiDbIdle') : result.text}
          </pre>

          <p className="api-db-example">
            {`POST ${graphqlUrl()} · { __typename } / profile`}
          </p>
        </div>
      ) : null}
    </div>
  );
}
