import { useCallback, useRef, useState } from 'react';
import { pingBackend } from '#web/shared/api/ping-api';
import { sleep } from '#web/shared/lib/sleep';

import '#web/pages/gateway/gateway-page.css';

type FaultCode = 404 | 502;

const RETRY_COOLDOWN_MS = 1000;
const RETRY_CHECK_MS = 500;

type FaultPageProps = {
  code: FaultCode;
  title: string;
  text: string;
  busy?: boolean;
  onRetry?: () => void;
  onHome?: () => void | Promise<void>;
};

export function FaultPage({ code, title, text, busy = false, onRetry, onHome }: FaultPageProps) {
  const [cooling, setCooling] = useState(false);
  const [barTick, setBarTick] = useState(0);
  const homeLock = useRef(false);
  const retryLock = useRef(false);

  const handleRetry = useCallback(async () => {
    if (busy || cooling || retryLock.current || onRetry === undefined) {
      return;
    }

    retryLock.current = true;
    setBarTick((current) => current + 1);
    setCooling(true);

    const [alive] = await Promise.all([
      Promise.all([pingBackend(), sleep(RETRY_CHECK_MS)]).then(([ok]) => ok),
      sleep(RETRY_COOLDOWN_MS),
    ]);

    setCooling(false);
    retryLock.current = false;

    if (alive) {
      onRetry();
    }
  }, [busy, cooling, onRetry]);

  const handleHome = useCallback(async () => {
    if (busy || homeLock.current) {
      return;
    }

    homeLock.current = true;

    try {
      if (onHome !== undefined) {
        await onHome();
        return;
      }

      if (code === 404) {
        globalThis.location.assign(import.meta.env.BASE_URL);
        return;
      }

      const alive = await pingBackend();
      if (alive) {
        globalThis.location.assign(import.meta.env.BASE_URL);
      }
    } finally {
      homeLock.current = false;
    }
  }, [busy, code, onHome]);

  const retryLocked = busy || cooling;

  return (
    <main className="fault-page">
      <p className="code" aria-hidden="true">
        {code}
      </p>
      <h1 className="title">{title}</h1>
      <p className="text">{text}</p>
      <div className="actions">
        {code === 502 && onRetry !== undefined ? (
          <button
            type="button"
            className={`retry${cooling ? ' is-cooling' : ''}`}
            aria-disabled={retryLocked}
            aria-busy={cooling}
            onClick={() => {
              void handleRetry();
            }}
          >
            {cooling ? (
              <span
                className="retry-edge"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={RETRY_COOLDOWN_MS}
                aria-valuenow={0}
                aria-label="Проверяем бэк"
              >
                <span key={barTick} className="retry-edge-bar" />
              </span>
            ) : null}
            <span className="retry-label">Попробуй ещё раз</span>
          </button>
        ) : null}
        <button type="button" className="home" disabled={busy || cooling} onClick={handleHome}>
          На главную
        </button>
      </div>
    </main>
  );
}
