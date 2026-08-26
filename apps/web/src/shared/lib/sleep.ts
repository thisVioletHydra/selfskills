export type SleepSignal = AbortSignal | undefined;

/**
 * Awaitable delay. Для моков / «подожди N мс».
 * Не для ambient spawn — там timer-kit (id + cancel + interval/jitter).
 */
export function sleep(ms: number, signal?: SleepSignal): Promise<void> {
  if (signal != null && signal.aborted === true) {
    return Promise.reject(abortError());
  }

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };

    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function abortError() {
  return new DOMException('Aborted', 'AbortError');
}
