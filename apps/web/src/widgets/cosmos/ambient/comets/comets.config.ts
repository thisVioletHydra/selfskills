export const COMETS_CONFIG = {
  ambientId: 'comet-ambient',
  sparkCount: 14,
  firstDelay: [2_000, 7_000] as [number, number],
  nextDelay: [20_000, 30_000] as [number, number],
  maxFlights: 6,
  sparkTones: [
    'rgba(255, 255, 255, 0.95)',
    'rgba(210, 230, 255, 0.9)',
    'rgba(255, 248, 230, 0.85)',
    'rgba(190, 215, 255, 0.75)',
    'rgba(255, 255, 255, 0.7)',
  ],
} as const;
