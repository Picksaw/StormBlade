/**
 * DAILY CHALLENGES — three tasks per day, each paying out gems.
 * The set is deterministic per calendar day (same for everyone on that date)
 * and resets automatically at local midnight.
 */

import type { GameMode } from './core';

export type ChallengeId =
  | 'kills20'
  | 'kills60'
  | 'combo20'
  | 'combo5'
  | 'wave10'
  | 'boss1'
  | 'race20k'
  | 'race3sectors'
  | 'rush30'
  | 'rush15k'
  | 'word10'
  | 'word3phase'
  | 'gems3'
  | 'score15k'
  | 'kills40'
  | 'combo10'
  | 'wave5'
  | 'race10k'
  | 'rush50'
  | 'word5'
  | 'gems5'
  | 'score30k'
  | 'play3modes';

export interface Challenge {
  id: ChallengeId;
  /** i18n key for the description */
  key: string;
  gems: number;
  target: number;
  mode?: GameMode; // undefined = any mode
}

export const CHALLENGE_POOL: Challenge[] = [
  { id: 'kills20', key: 'ch_kills20', gems: 2, target: 20, mode: 'battle' },
  { id: 'kills60', key: 'ch_kills60', gems: 4, target: 60, mode: 'battle' },
  { id: 'combo20', key: 'ch_combo20', gems: 5, target: 20, mode: 'battle' },
  { id: 'combo5', key: 'ch_combo5', gems: 3, target: 5 },
  { id: 'wave10', key: 'ch_wave10', gems: 4, target: 10, mode: 'battle' },
  { id: 'boss1', key: 'ch_boss1', gems: 6, target: 1, mode: 'battle' },
  { id: 'race20k', key: 'ch_race20k', gems: 6, target: 20000, mode: 'race' },
  { id: 'race3sectors', key: 'ch_race3sectors', gems: 3, target: 3, mode: 'race' },
  { id: 'rush30', key: 'ch_rush30', gems: 4, target: 30, mode: 'rush' },
  { id: 'rush15k', key: 'ch_rush15k', gems: 5, target: 15000, mode: 'rush' },
  { id: 'word10', key: 'ch_word10', gems: 5, target: 10, mode: 'word' },
  { id: 'word3phase', key: 'ch_word3phase', gems: 4, target: 3, mode: 'word' },
  { id: 'gems3', key: 'ch_gems3', gems: 2, target: 3 },
  { id: 'score15k', key: 'ch_score15k', gems: 3, target: 15000 },
  { id: 'kills40', key: 'ch_kills40', gems: 3, target: 40, mode: 'battle' },
  { id: 'combo10', key: 'ch_combo10', gems: 3, target: 10, mode: 'battle' },
  { id: 'wave5', key: 'ch_wave5', gems: 2, target: 5, mode: 'battle' },
  { id: 'race10k', key: 'ch_race10k', gems: 3, target: 10000, mode: 'race' },
  { id: 'rush50', key: 'ch_rush50', gems: 6, target: 50, mode: 'rush' },
  { id: 'word5', key: 'ch_word5', gems: 3, target: 5, mode: 'word' },
  { id: 'gems5', key: 'ch_gems5', gems: 4, target: 5 },
  { id: 'score30k', key: 'ch_score30k', gems: 5, target: 30000 },
  { id: 'play3modes', key: 'ch_play3modes', gems: 4, target: 3 },
];

export interface DailyState {
  day: string; // YYYY-MM-DD
  picks: ChallengeId[];
  progress: Record<string, number>;
  claimed: Record<string, boolean>;
  /** distinct modes played today (for the "play 3 modes" task) */
  modesPlayed?: string[];
}

const KEY = 'stormblade.daily.v2';
/** How many challenges are handed out each day. */
export const DAILY_COUNT = 6;

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Deterministic shuffle so everyone gets the same three tasks each day. */
function pickForDay(day: string): ChallengeId[] {
  let seed = 0;
  for (let i = 0; i < day.length; i++) seed = (Math.imul(31, seed) + day.charCodeAt(i)) | 0;
  const rng = () => {
    seed = (Math.imul(1103515245, seed) + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const pool = [...CHALLENGE_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, DAILY_COUNT).map((c) => c.id);
}

export function loadDaily(): DailyState {
  const day = todayKey();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as DailyState;
      // still the same day → keep progress
      if (s.day === day && Array.isArray(s.picks) && s.picks.length === DAILY_COUNT) return s;
    }
  } catch {
    /* ignore */
  }
  // new day → fresh challenges, progress wiped
  const fresh: DailyState = { day, picks: pickForDay(day), progress: {}, claimed: {} };
  saveDaily(fresh);
  return fresh;
}

export function saveDaily(s: DailyState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export const challengeById = (id: ChallengeId) => CHALLENGE_POOL.find((c) => c.id === id)!;

/** Stats a finished run reports to the daily tracker. */
export interface RunStats {
  mode: GameMode;
  score: number;
  kills: number;
  wave: number;
  bestCombo: number;
  combos: number;
  gems: number;
  sector: number;
  broken: number;
  wordsDone: number;
  phase: number;
  bossKills: number;
}

/** Fold a finished run into today's progress. Returns the updated state. */
export function applyRun(state: DailyState, r: RunStats): DailyState {
  const s: DailyState = { ...state, progress: { ...state.progress }, claimed: { ...state.claimed } };
  const bump = (id: ChallengeId, value: number) => {
    if (!s.picks.includes(id)) return;
    s.progress[id] = Math.max(s.progress[id] ?? 0, value);
  };
  const add = (id: ChallengeId, value: number) => {
    if (!s.picks.includes(id)) return;
    s.progress[id] = (s.progress[id] ?? 0) + value;
  };

  if (r.mode === 'battle') {
    add('kills20', r.kills);
    add('kills40', r.kills);
    add('kills60', r.kills);
    bump('combo20', r.bestCombo);
    bump('combo10', r.bestCombo);
    bump('wave10', r.wave);
    bump('wave5', r.wave);
    add('boss1', r.bossKills);
  }
  if (r.mode === 'race') {
    bump('race20k', r.score);
    bump('race10k', r.score);
    bump('race3sectors', r.sector);
  }
  if (r.mode === 'rush') {
    add('rush30', r.broken);
    add('rush50', r.broken);
    bump('rush15k', r.score);
  }
  if (r.mode === 'word') {
    add('word10', r.wordsDone);
    add('word5', r.wordsDone);
    bump('word3phase', r.phase);
  }
  add('combo5', r.combos);
  add('gems3', r.gems);
  add('gems5', r.gems);
  bump('score15k', r.score);
  bump('score30k', r.score);

  // "play 3 different modes" — track which ones have been touched today
  if (s.picks.includes('play3modes')) {
    const seen: string[] = Array.isArray(s.modesPlayed) ? s.modesPlayed : [];
    if (!seen.includes(r.mode)) seen.push(r.mode);
    s.modesPlayed = seen;
    s.progress.play3modes = seen.length;
  }
  return s;
}

export const isComplete = (s: DailyState, id: ChallengeId) =>
  (s.progress[id] ?? 0) >= challengeById(id).target;

export const canClaim = (s: DailyState, id: ChallengeId) => isComplete(s, id) && !s.claimed[id];
