import type { AmbientId } from '#web/widgets/cosmos/ambient/types';

export const COSMOS_PRESETS = {
  full: {
    id: 'full',
    modules: ['starfield', 'pulseStars', 'comets', 'haze'] as const satisfies readonly AmbientId[],
  },
  calm: {
    id: 'calm',
    modules: ['starfield', 'pulseStars', 'haze'] as const satisfies readonly AmbientId[],
  },
  minimal: {
    id: 'minimal',
    modules: ['starfield'] as const satisfies readonly AmbientId[],
  },
} as const;

export type CosmosPresetId = keyof typeof COSMOS_PRESETS;

export const ACTIVE_PRESET = COSMOS_PRESETS.full;
