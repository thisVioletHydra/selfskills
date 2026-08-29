import { cancel, schedule } from '#web/widgets/cosmos/lib/timer-kit';
import { useEffect, useEffectEvent } from 'react';

type EveryOptions = {
  enabled: boolean;
  timerId: string;
  everyMs: number;
  onTick: () => void;
};

type JitterOptions = {
  enabled: boolean;
  timerId: string;
  firstDelay?: [number, number];
  nextDelay: [number, number];
  onTick: () => void;
};

export type UseAmbientSchedulerOptions = EveryOptions | JitterOptions;

function isEvery(options: UseAmbientSchedulerOptions): options is EveryOptions {
  return 'everyMs' in options;
}

/**
 * Shared ambient spawn loop: arms timer while enabled, cancels on disable/unmount.
 */
export function useAmbientScheduler(options: UseAmbientSchedulerOptions) {
  const onTick = useEffectEvent(options.onTick);

  useEffect(() => {
    if (!options.enabled) {
      cancel(options.timerId);

      return;
    }

    if (isEvery(options)) {
      schedule({
        id: options.timerId,
        everyMs: options.everyMs,
        onFire: () => {
          onTick();
        },
      });
    } else {
      const [nextMin, nextMax] = options.nextDelay;
      const first = options.firstDelay;

      schedule({
        id: options.timerId,
        minMs: nextMin,
        maxMs: nextMax,
        firstMinMs: first?.[0],
        firstMaxMs: first?.[1],
        onFire: () => {
          onTick();
        },
      });
    }

    return () => {
      cancel(options.timerId);
    };
  }, [
    options.enabled,
    options.timerId,
    isEvery(options) ? options.everyMs : options.nextDelay[0],
    isEvery(options) ? undefined : options.nextDelay[1],
    isEvery(options) ? undefined : options.firstDelay?.[0],
    isEvery(options) ? undefined : options.firstDelay?.[1],
  ]);
}
