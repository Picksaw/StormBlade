export const TAU = Math.PI * 2;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rand = (a = 1, b = 0) => b + Math.random() * (a - b);
export const randInt = (a: number, b: number) => Math.floor(a + Math.random() * (b - a + 1));
export const pick = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by);
export const dist2 = (ax: number, ay: number, bx: number, by: number) => {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
};
/** Frame-rate independent smoothing factor. */
export const smooth = (k: number, dt: number) => 1 - Math.exp(-k * dt);

export const angleDiff = (a: number, b: number) => {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
};

/** Distance from point p to segment ab. */
export function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

export const PALETTE = {
  bg0: '#05060f',
  bg1: '#0b1026',
  grid: 'rgba(94,132,255,0.10)',
  gridHot: 'rgba(120,220,255,0.20)',
  cyan: '#79f2ff',
  cyanDeep: '#22a7ff',
  violet: '#a97bff',
  gold: '#ffd166',
  crimson: '#ff4d6d',
  ember: '#ff8a3d',
  ink: '#0a0a14',
  bone: '#e8f4ff',
};

export type GameMode = 'battle' | 'race' | 'rush' | 'word';
export type HighScore = {
  name: string;
  score: number;
  wave: number;
  kills: number;
  date: number;
  mode?: GameMode;
  /** id of the blade the player finished the run with (shown on the board) */
  blade?: string;
  /** device the run was played on (shown as an icon on the board) */
  platform?: 'pc' | 'android';
};

/**
 * Bump SEASON to wipe every locally-stored board — use it whenever the
 * online board is reset so old device rows can't reappear.
 */
const SEASON = 'v4';
const HS_KEY_BATTLE = `stormblade.hs.${SEASON}.battle`;
const HS_KEY_RACE = `stormblade.hs.${SEASON}.race`;
const HS_KEY_RUSH = `stormblade.hs.${SEASON}.rush`;
const HS_KEY_WORD = `stormblade.hs.${SEASON}.word`;
const keyFor = (m: GameMode) =>
  m === 'race' ? HS_KEY_RACE : m === 'rush' ? HS_KEY_RUSH : m === 'word' ? HS_KEY_WORD : HS_KEY_BATTLE;

/**
 * HARD SEASON WIPE — runs once per SEASON bump.
 * Removes every legacy board key AND the cached personal bests stored on
 * local accounts, so nothing from a previous season can render.
 * Coins, owned skins and maps are deliberately preserved.
 */
const SEASON_FLAG = `stormblade.season.${SEASON}`;
try {
  if (!localStorage.getItem(SEASON_FLAG)) {
    // 1. drop every old/known board key
    for (const k of Object.keys(localStorage)) {
      if (/^stormblade\.(highscores|hs)\./.test(k) && !k.includes(SEASON)) localStorage.removeItem(k);
    }
    // 2. zero the per-account bests cached on this device
    try {
      const raw = localStorage.getItem('stormblade.accounts.v1');
      if (raw) {
        const accounts = JSON.parse(raw) as Record<string, Record<string, unknown>>;
        for (const a of Object.values(accounts)) {
          a.bestBattle = 0;
          a.bestRace = 0;
          a.bestRush = 0;
          a.bestWave = 0;
          a.bestSector = 0;
          a.bestBroken = 0;
          a.bladeBattle = '';
          a.bladeRace = '';
          a.bladeRush = '';
        }
        localStorage.setItem('stormblade.accounts.v1', JSON.stringify(accounts));
      }
    } catch {
      /* ignore */
    }
    localStorage.setItem(SEASON_FLAG, '1');
  }
} catch {
  /* ignore */
}

export function loadScores(mode: GameMode = 'battle'): HighScore[] {
  try {
    const raw = localStorage.getItem(keyFor(mode));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s) => s && typeof s.score === 'number')
      .map((s) => ({ ...s, name: s.name || 'Wanderer', mode }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  } catch {
    return [];
  }
}

/**
 * Merge score boards: only each player's BEST score is kept
 * (deduplicated by name), sorted, capped at 8.
 */
export function mergeBoards(a: HighScore[], b: HighScore[]): HighScore[] {
  const all = [...a, ...b]
    .filter((s) => s && typeof s.score === 'number')
    .sort((x, y) => y.score - x.score);
  const seen = new Set<string>();
  const out: HighScore[] = [];
  for (const s of all) {
    const k = (s.name || 'Wanderer').toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ ...s, name: s.name || 'Wanderer' });
    if (out.length >= 8) break;
  }
  return out;
}

export function persistScores(list: HighScore[], mode: GameMode = 'battle') {
  try {
    localStorage.setItem(keyFor(mode), JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function saveScore(entry: HighScore, mode: GameMode = 'battle'): { list: HighScore[]; rank: number } {
  const list = mergeBoards(loadScores(mode), [entry]);
  persistScores(list, mode);
  const rank = list.findIndex((s) => s === entry);
  return { list, rank };
}

export const formatScore = (n: number) => Math.floor(n).toLocaleString('en-US');
