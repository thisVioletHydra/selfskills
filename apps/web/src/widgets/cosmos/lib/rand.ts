export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
