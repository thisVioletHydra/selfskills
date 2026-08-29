import type { AmbientContext } from '#web/widgets/cosmos/ambient/types';
import type { CSSProperties } from 'react';

import { PULSE_STARS_CONFIG } from '#web/widgets/cosmos/ambient/pulse-stars/pulse-stars.config';

export function PulseStarsLayer(_props: AmbientContext) {
  const { cycleSec, stars } = PULSE_STARS_CONFIG;

  return (
    <div className="stars-pulse">
      {stars.map((star, index) => {
        const style = {
          left: star.x,
          top: star.y,
          '--delay': `${(index * cycleSec) / stars.length}s`,
        } as CSSProperties;

        return <span key={`${star.x}-${star.y}`} className="pulse-star" style={style} />;
      })}
    </div>
  );
}
