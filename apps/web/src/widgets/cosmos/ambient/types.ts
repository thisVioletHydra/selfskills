import type { CosmosMotionMode } from '#web/widgets/cosmos/lib/motion-state';
import type { ReactNode } from 'react';

export type AmbientId = 'starfield' | 'pulseStars' | 'comets' | 'haze';

export type AmbientContext = {
  motionMode: CosmosMotionMode;
};

export type AmbientModule = {
  id: AmbientId;
  Layer: (props: AmbientContext) => ReactNode;
};
