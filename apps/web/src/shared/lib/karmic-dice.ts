export type KarmicCount = 1 | 2 | 3 | 4;

function d10() {
  return Math.floor(Math.random() * 10) + 1;
}

/**
 * Karmic Dice — nested d10 gates, not a flat linear roll.
 *
 * 1) 1–5 → ×1 | 6–10 → at least ×2        (~50/50)
 * 2) only if ×2+: 1–7 → ×2 | 8–10 → ×3     (~1/3 upgrade)
 * 3) only if ×3+: 1 or 10 → ×4 | else ×3   (~1/5 of ×3)
 *
 * `max` clamps the ladder (comets use 2, haze uses 4).
 */
export function rollKarmicDice(max: 1): 1;
export function rollKarmicDice(max: 2): 1 | 2;
export function rollKarmicDice(max: 3): 1 | 2 | 3;
export function rollKarmicDice(max?: 4): KarmicCount;
export function rollKarmicDice(max: KarmicCount = 4): KarmicCount {
  if (max < 1) {
    return 1;
  }

  if (d10() <= 5) {
    return 1;
  }

  if (max === 1) {
    return 1;
  }

  if (max === 2) {
    return 2;
  }

  if (d10() < 8) {
    return 2;
  }

  if (max === 3) {
    return 3;
  }

  const finale = d10();
  if (finale === 1 || finale === 10) {
    return 4;
  }

  return 3;
}
