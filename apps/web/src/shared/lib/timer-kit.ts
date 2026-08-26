type TimerHandle = {
  kind: 'timeout' | 'interval';
  handle: number;
  abortListener?: () => void;
  signal?: AbortSignal;
};

type ScheduleBase = {
  id: string;
  onFire: () => void;
  signal?: AbortSignal;
};

export type OnceSchedule = ScheduleBase & {
  ms: number;
};

export type EverySchedule = ScheduleBase & {
  everyMs: number;
};

export type JitterSchedule = ScheduleBase & {
  minMs: number;
  maxMs: number;
  /** Первая пауза до onFire; дальше minMs/maxMs */
  firstMinMs?: number;
  firstMaxMs?: number;
};

export type ScheduleConfig = OnceSchedule | EverySchedule | JitterSchedule;

const registry = new Map<string, TimerHandle>();

function isEvery(config: ScheduleConfig): config is EverySchedule {
  return 'everyMs' in config;
}

function isJitter(config: ScheduleConfig): config is JitterSchedule {
  return 'minMs' in config && 'maxMs' in config;
}

function jitterMs(minMs: number, maxMs: number) {
  const lo = Math.min(minMs, maxMs);
  const hi = Math.max(minMs, maxMs);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function detachAbort(entry: TimerHandle) {
  if (entry.signal && entry.abortListener) {
    entry.signal.removeEventListener('abort', entry.abortListener);
  }
}

function clearHandle(entry: TimerHandle) {
  detachAbort(entry);
  if (entry.kind === 'interval') {
    window.clearInterval(entry.handle);
  } else {
    window.clearTimeout(entry.handle);
  }
}

/**
 * Именованные таймеры: one-shot / interval / jitter (сам планирует следующий тик).
 * Повторный schedule с тем же id снимает предыдущий.
 */
export function schedule(config: ScheduleConfig) {
  cancel(config.id);

  if (config.signal?.aborted) {
    return;
  }

  const bindAbort = (entry: TimerHandle) => {
    if (!config.signal) {
      return;
    }

    const onAbort = () => {
      cancel(config.id);
    };

    entry.signal = config.signal;
    entry.abortListener = onAbort;
    config.signal.addEventListener('abort', onAbort, { once: true });
  };

  if (isEvery(config)) {
    const handle = window.setInterval(() => {
      config.onFire();
    }, config.everyMs);
    const entry: TimerHandle = { kind: 'interval', handle };
    bindAbort(entry);
    registry.set(config.id, entry);
    return;
  }

  if (isJitter(config)) {
    const entry: TimerHandle = { kind: 'timeout', handle: 0 };
    bindAbort(entry);
    registry.set(config.id, entry);

    let isFirst = true;

    const arm = () => {
      if (registry.get(config.id) !== entry) {
        return;
      }

      const minMs =
        isFirst && config.firstMinMs !== undefined ? config.firstMinMs : config.minMs;
      const maxMs =
        isFirst && config.firstMaxMs !== undefined ? config.firstMaxMs : config.maxMs;

      isFirst = false;

      entry.handle = window.setTimeout(() => {
        if (registry.get(config.id) !== entry) {
          return;
        }

        config.onFire();

        if (registry.get(config.id) === entry) {
          arm();
        }
      }, jitterMs(minMs, maxMs));
    };

    arm();
    return;
  }

  const entry: TimerHandle = { kind: 'timeout', handle: 0 };
  bindAbort(entry);
  registry.set(config.id, entry);

  entry.handle = window.setTimeout(() => {
    if (registry.get(config.id) !== entry) {
      return;
    }

    cancel(config.id);
    config.onFire();
  }, config.ms);
}

export function cancel(id: string) {
  const entry = registry.get(id);
  if (!entry) {
    return;
  }

  clearHandle(entry);
  registry.delete(id);
}

export function cancelAll(prefix?: string) {
  for (const id of [...registry.keys()]) {
    if (prefix === undefined || id.startsWith(prefix)) {
      cancel(id);
    }
  }
}

export function hasTimer(id: string) {
  return registry.has(id);
}
