export function subscribeWindowEvent(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  window.addEventListener(type, listener, options);

  return () => window.removeEventListener(type, listener, options);
}
