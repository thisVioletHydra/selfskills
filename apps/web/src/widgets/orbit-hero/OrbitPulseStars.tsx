import type { CSSProperties } from 'react';

const PULSE_STARS = [
  { x: '11%', y: '16%' },
  { x: '22%', y: '38%' },
  { x: '8%', y: '62%' },
  { x: '31%', y: '11%' },
  { x: '39%', y: '74%' },
  { x: '48%', y: '22%' },
  { x: '57%', y: '58%' },
  { x: '64%', y: '9%' },
  { x: '71%', y: '41%' },
  { x: '78%', y: '69%' },
  { x: '86%', y: '24%' },
  { x: '91%', y: '52%' },
  { x: '17%', y: '84%' },
] as const;

const CYCLE_SEC = 45;

export function OrbitPulseStars() {
  return (
    <div className="stars-pulse">
      {PULSE_STARS.map((star, index) => {
        const style = {
          left: star.x,
          top: star.y,
          '--delay': `${(index * CYCLE_SEC) / PULSE_STARS.length}s`,
        } as CSSProperties;

        return <span key={`${star.x}-${star.y}`} className="pulse-star" style={style} />;
      })}
    </div>
  );
}
