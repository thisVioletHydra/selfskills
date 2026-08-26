import { subscribeWindowEvent } from '#web/shared/lib/subscribe-window-event';

/**
 * SHELVED: anamorphic flash / lens flare.
 * Файлы живы: OrbitFlash.tsx + .flash-* в orbit-hero.css.
 * Вернуть: импорт OrbitFlash + triggerOrbitFlash в OrbitHero.
 */
export const ORBIT_FLASH_TRIGGER_EVENT = 'orbit-flash-trigger';

export function triggerOrbitFlash() {
  window.dispatchEvent(new CustomEvent(ORBIT_FLASH_TRIGGER_EVENT));
}

export function subscribeOrbitFlashTrigger(listener: () => void) {
  return subscribeWindowEvent(ORBIT_FLASH_TRIGGER_EVENT, listener);
}
