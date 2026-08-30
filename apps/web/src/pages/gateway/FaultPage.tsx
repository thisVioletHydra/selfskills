import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  isRequestGateOpen,
  remainingRequestGateMs,
  subscribeRequestGate,
} from '#web/shared/api/request-gate';
import { sleep } from '#web/shared/lib/sleep';

import '#web/pages/gateway/gateway-page.css';

type FaultCode = 404 | 502;

const CLICK_COOLDOWN_MS = 1000;

type FaultPageProps = {
  code: FaultCode;
  title: string;
  text: string;
  hint?: string;
  busy?: boolean;
  onRetry?: () => void;
  onHome?: () => void | Promise<void>;
};

export function FaultPage({ code, title, text, hint, busy = false, onRetry, onHome }: FaultPageProps) {
  const [coolingMs, setCoolingMs] = useState(0);
  const [barTick, setBarTick] = useState(0);
  const homeLock = useRef(false);
  const retryLock = useRef(false);
  const coolGen = useRef(0);

  const runCooling = useCallback(async (ms: number) => {
    if (ms <= 0) {
      return;
    }

    const gen = coolGen.current + 1;
    coolGen.current = gen;
    setCoolingMs(ms);
    setBarTick((current) => current + 1);
    await sleep(ms);

    if (coolGen.current === gen) {
      setCoolingMs(0);
    }
  }, []);

  useEffect(() => {
    const syncGate = () => {
      const left = remainingRequestGateMs();
      if (left > 0) {
        void runCooling(left);
      }
    };

    syncGate();
    return subscribeRequestGate(syncGate);
  }, [runCooling]);

  const locked = busy || coolingMs > 0;

  const handleRetry = useCallback(async () => {
    if (locked || retryLock.current || onRetry === undefined) {
      return;
    }

    if (!isRequestGateOpen()) {
      void runCooling(remainingRequestGateMs());
      return;
    }

    retryLock.current = true;
    void runCooling(CLICK_COOLDOWN_MS);
    await sleep(CLICK_COOLDOWN_MS);
    retryLock.current = false;

    // Always hand off — parent re-pings / refetches. Gating on ping made Retry a no-op
    // while a hard reload already hit a warm API.
    onRetry();
  }, [locked, onRetry, runCooling]);

  const handleHome = useCallback(async () => {
    if (locked || homeLock.current) {
      return;
    }

    if (!isRequestGateOpen()) {
      void runCooling(remainingRequestGateMs());
      return;
    }

    homeLock.current = true;
    void runCooling(CLICK_COOLDOWN_MS);

    try {
      if (onHome !== undefined) {
        await onHome();
        return;
      }

      globalThis.location.assign(import.meta.env.BASE_URL);
    } finally {
      homeLock.current = false;
    }
  }, [locked, onHome, runCooling]);

  const cooling = coolingMs > 0;

  return (
    <main className="fault-page">
      <p className="code" aria-hidden="true">
        {code}
      </p>
      <h1 className="title">{title}</h1>
      <p className="text">{text}</p>
      {hint !== undefined && hint.length > 0 ? <p className="hint">{hint}</p> : null}
      <div className="actions">
        {code === 502 && onRetry !== undefined ? (
          <button
            type="button"
            className={`retry${cooling ? ' is-cooling' : ''}`}
            aria-disabled={locked}
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
                aria-valuemax={coolingMs}
                aria-valuenow={0}
                aria-label="Проверяем сервер"
              >
                <span
                  key={barTick}
                  className="retry-edge-bar"
                  style={{ '--fault-cool-ms': `${coolingMs}ms` } as CSSProperties}
                />
              </span>
            ) : null}
            <span className="retry-label">Повторить</span>
          </button>
        ) : null}
        <button
          type="button"
          className="home"
          disabled={locked}
          onClick={() => {
            void handleHome();
          }}
        >
          На главную
        </button>
      </div>
    </main>
  );
}
