/**
 * Клиентский request-gate: очки за фейлы бэка, тиры easy → medium → hard,
 * decay по wall-clock (свернул вкладку — счётчик всё равно тает).
 *
 * Демо-правила (щадящие):
 *   easy   — 20 фейлов → бан 20с, −2 очка / 30с
 *   medium — 10 фейлов → бан 44с, −1 очко / 30с
 *   hard   — 5 фейлов  → бан 5м,  −1 очко / 60с
 *
 * Бан на easy поднимает в medium, на medium — в hard.
 * Успешный запрос сбрасывает в easy. Decay до 0 без бана — шаг вниз по тиру.
 */

export type RequestGateTier = 'easy' | 'medium' | 'hard';

type TierConfig = {
  failLimit: number;
  blockMs: number;
  decayPoints: number;
  decayEveryMs: number;
};

export const REQUEST_GATE_TIERS: Record<RequestGateTier, TierConfig> = {
  easy: {
    failLimit: 20,
    blockMs: 20_000,
    decayPoints: 2,
    decayEveryMs: 30_000,
  },
  medium: {
    failLimit: 10,
    blockMs: 44_000,
    decayPoints: 1,
    decayEveryMs: 30_000,
  },
  hard: {
    failLimit: 5,
    blockMs: 5 * 60_000,
    decayPoints: 1,
    decayEveryMs: 60_000,
  },
};

/** @deprecated use REQUEST_GATE_TIERS.easy — оставлено для старых импортов */
export const REQUEST_FAIL_LIMIT = REQUEST_GATE_TIERS.easy.failLimit;
/** @deprecated use REQUEST_GATE_TIERS.easy */
export const REQUEST_BLOCK_MS = REQUEST_GATE_TIERS.easy.blockMs;

const STORAGE_KEY = 'selfskills:request-gate:v2';

type GateSnapshot = {
  points: number;
  tier: RequestGateTier;
  blockedUntil: number;
  lastDecayAt: number;
};

function isTier(value: unknown): value is RequestGateTier {
  return value === 'easy' || value === 'medium' || value === 'hard';
}

function escalateTier(current: RequestGateTier): RequestGateTier {
  if (current === 'easy') {
    return 'medium';
  }

  return 'hard';
}

function demoteTier(current: RequestGateTier): RequestGateTier {
  if (current === 'hard') {
    return 'medium';
  }

  return 'easy';
}

function readSnapshot(): GateSnapshot {
  const now = Date.now();

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (raw === null || raw === '') {
      return { points: 0, tier: 'easy', blockedUntil: 0, lastDecayAt: now };
    }

    const parsed = JSON.parse(raw) as Partial<GateSnapshot>;
    const points = typeof parsed.points === 'number' && parsed.points > 0 ? parsed.points : 0;
    const tier = isTier(parsed.tier) ? parsed.tier : 'easy';
    const blockedUntil =
      typeof parsed.blockedUntil === 'number' && parsed.blockedUntil > now ? parsed.blockedUntil : 0;
    const lastDecayAt =
      typeof parsed.lastDecayAt === 'number' && parsed.lastDecayAt > 0 ? parsed.lastDecayAt : now;

    return { points, tier, blockedUntil, lastDecayAt };
  } catch {
    return { points: 0, tier: 'easy', blockedUntil: 0, lastDecayAt: now };
  }
}

function writeSnapshot(): void {
  try {
    const payload: GateSnapshot = { points, tier, blockedUntil, lastDecayAt };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
  }
}

let { points, tier, blockedUntil, lastDecayAt } = readSnapshot();
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function tierConfig(): TierConfig {
  return REQUEST_GATE_TIERS[tier];
}

/**
 * Списывает очки по прошедшему wall-clock времени.
 * Работает и со свёрнутой вкладкой: при следующем вызове догоняет тики.
 */
function applyDecay(): void {
  const now = Date.now();
  const { decayPoints, decayEveryMs } = tierConfig();
  const elapsed = now - lastDecayAt;

  if (elapsed < decayEveryMs) {
    return;
  }

  const ticks = Math.floor(elapsed / decayEveryMs);
  lastDecayAt += ticks * decayEveryMs;

  if (points <= 0) {
    // давно чистый счётчик — мягко сползаем по тиру вниз
    if (blockedUntil <= now && tier !== 'easy') {
      for (let step = 0; step < ticks && tier !== 'easy'; step++) {
        tier = demoteTier(tier);
      }
      writeSnapshot();
    }

    return;
  }

  const nextPoints = Math.max(0, points - ticks * decayPoints);
  const cleared = points > 0 && nextPoints === 0;
  points = nextPoints;

  if (cleared && blockedUntil <= now && tier !== 'easy') {
    tier = demoteTier(tier);
  }

  writeSnapshot();
}

export function subscribeRequestGate(listener: () => void): () => void {
  listeners.add(listener);

  applyDecay();

  if (!isRequestGateOpen()) {
    listener();
  }

  return () => {
    listeners.delete(listener);
  };
}

export function isRequestGateOpen(): boolean {
  applyDecay();

  return Date.now() >= blockedUntil;
}

export function remainingRequestGateMs(): number {
  applyDecay();

  return Math.max(0, blockedUntil - Date.now());
}

export function getRequestGateTier(): RequestGateTier {
  applyDecay();

  return tier;
}

export function getRequestGatePoints(): number {
  applyDecay();

  return points;
}

export class RequestGateError extends Error {
  constructor() {
    super('Request gate closed');
    this.name = 'RequestGateError';
  }
}

export function assertRequestGateOpen(): void {
  if (!isRequestGateOpen()) {
    throw new RequestGateError();
  }
}

/** Бэк ответил — сразу в easy, очки в ноль. */
export function recordRequestOk(): void {
  applyDecay();
  points = 0;
  tier = 'easy';
  blockedUntil = 0;
  lastDecayAt = Date.now();
  writeSnapshot();
}

/** Фейл / таймаут бэка — +1 очко; на лимите тира — бан и эскалация. */
export function recordRequestFail(): void {
  applyDecay();

  if (!isRequestGateOpen()) {
    return;
  }

  points += 1;
  lastDecayAt = Date.now();

  const { failLimit, blockMs } = tierConfig();

  if (points < failLimit) {
    writeSnapshot();

    return;
  }

  points = 0;
  blockedUntil = Date.now() + blockMs;
  tier = escalateTier(tier);
  lastDecayAt = Date.now();
  writeSnapshot();
  notify();
}
