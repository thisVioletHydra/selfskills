export const HAZE_CONFIG = {
  spawnId: 'haze-spawn',
  lifePrefix: 'haze-life-',
  rollIntervalMs: 12_000,
  maxGenerations: 2,
  sunX: 50,
  sunY: 42,
  centerRadius: 22,
  tones: {
    cold: 'rgba(80, 125, 195, 0.62)',
    warm: 'rgba(155, 105, 58, 0.58)',
    white: 'rgba(230, 236, 255, 0.48)',
  },
} as const;

export type HazeTone = keyof typeof HAZE_CONFIG.tones;
