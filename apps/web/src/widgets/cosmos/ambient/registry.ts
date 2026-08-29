import type { AmbientId, AmbientModule } from '#web/widgets/cosmos/ambient/types';

import { CometsLayer } from '#web/widgets/cosmos/ambient/comets/CometsLayer';
import { HazeLayer } from '#web/widgets/cosmos/ambient/haze/HazeLayer';
import { PulseStarsLayer } from '#web/widgets/cosmos/ambient/pulse-stars/PulseStarsLayer';
import { StarfieldLayer } from '#web/widgets/cosmos/ambient/starfield/StarfieldLayer';

export const AMBIENT_REGISTRY: Record<AmbientId, AmbientModule> = {
  starfield: { id: 'starfield', Layer: StarfieldLayer },
  pulseStars: { id: 'pulseStars', Layer: PulseStarsLayer },
  comets: { id: 'comets', Layer: CometsLayer },
  haze: { id: 'haze', Layer: HazeLayer },
};
