import type { Lang } from './i18n';
import { HERO_SKINS, MAP_SKINS, SWORD_SKINS } from './skins';
import { tgCloudGet, tgCloudSet, tgUserName } from './telegram';

/** Player profile: coins, owned cosmetics, equipped cosmetics, callsign, language. */
export interface Profile {
  coins: number;
  /** premium currency — only earned from daily challenges and map pickups */
  gems: number;
  name: string;
  hero: string;
  sword: string;
  map: string;
  ownedHeroes: string[];
  ownedSwords: string[];
  ownedMaps: string[];
  lang: Lang;
}

export const PROFILE_KEY = 'stormblade.profile.v1';
/** The device/guest wallet, kept completely separate from any account. */
const GUEST_KEY = 'stormblade.profile.guest.v1';

/** Snapshot the current profile as the guest/device profile. */
export function saveGuestProfile(p: Profile) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

/** Restore the device profile used before signing in. */
export function loadGuestProfile(): Profile {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return defaultProfile();
    return { ...defaultProfile(), ...JSON.parse(raw) };
  } catch {
    return defaultProfile();
  }
}

export const defaultProfile = (): Profile => ({
  coins: 0,
  gems: 0,
  name: '',
  hero: 'storm',
  sword: 'storm-blade',
  map: 'storm',
  ownedHeroes: ['storm'],
  ownedSwords: ['storm-blade'],
  ownedMaps: ['storm'],
  lang: 'en',
});

/** Coins earned from a run: 20 coins per full 1000 score. */
export const coinsForScore = (score: number) => Math.floor(score / 1000) * 20;

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const p: Profile = { ...defaultProfile(), ...JSON.parse(raw) };
    p.ownedHeroes = Array.isArray(p.ownedHeroes) && p.ownedHeroes.length ? p.ownedHeroes : ['storm'];
    p.ownedSwords = Array.isArray(p.ownedSwords) && p.ownedSwords.length ? p.ownedSwords : ['storm-blade'];
    p.ownedMaps = Array.isArray(p.ownedMaps) && p.ownedMaps.length ? p.ownedMaps : ['storm'];
    if (!HERO_SKINS.some((s) => s.id === p.hero) || !p.ownedHeroes.includes(p.hero)) p.hero = 'storm';
    if (!SWORD_SKINS.some((s) => s.id === p.sword) || !p.ownedSwords.includes(p.sword)) p.sword = 'storm-blade';
    if (!MAP_SKINS.some((m) => m.id === p.map) || !p.ownedMaps.includes(p.map)) p.map = 'storm';
    if (typeof p.coins !== 'number' || p.coins < 0) p.coins = 0;
    if (typeof p.gems !== 'number' || p.gems < 0) p.gems = 0;
    if (p.lang !== 'en' && p.lang !== 'fa') p.lang = 'en';
    return p;
  } catch {
    return defaultProfile();
  }
}

export function persistProfile(p: Profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function saveProfileEverywhere(p: Profile) {
  persistProfile(p);
  tgCloudSet(PROFILE_KEY, JSON.stringify(p));
}

export function pullCloudProfile(): Promise<string | null> {
  return tgCloudGet(PROFILE_KEY);
}

/** Merge local profile with a cloud payload; Telegram name wins for the callsign. */
export function mergeProfile(local: Profile, cloudRaw: string | null, tgName: string | null): Profile {
  let cloud: Profile | null = null;
  if (cloudRaw) {
    try {
      cloud = { ...defaultProfile(), ...JSON.parse(cloudRaw) };
    } catch {
      cloud = null;
    }
  }
  const merged: Profile = {
    coins: Math.max(local.coins, cloud?.coins ?? 0),
    gems: Math.max(local.gems || 0, cloud?.gems ?? 0),
    name: tgName || local.name || cloud?.name || '',
    ownedHeroes: [...new Set([...local.ownedHeroes, ...(cloud?.ownedHeroes ?? [])])],
    ownedSwords: [...new Set([...local.ownedSwords, ...(cloud?.ownedSwords ?? [])])],
    ownedMaps: [...new Set([...local.ownedMaps, ...(cloud?.ownedMaps ?? [])])],
    hero: local.hero,
    sword: local.sword,
    map: local.map,
    lang: local.lang === 'fa' || !cloud?.lang ? local.lang || 'en' : cloud.lang,
  };
  if (cloud && merged.ownedHeroes.includes(cloud.hero) && HERO_SKINS.some((s) => s.id === cloud!.hero)) {
    merged.hero = cloud.hero;
  }
  if (cloud && merged.ownedSwords.includes(cloud.sword) && SWORD_SKINS.some((s) => s.id === cloud!.sword)) {
    merged.sword = cloud.sword;
  }
  if (cloud && merged.ownedMaps.includes(cloud.map) && MAP_SKINS.some((m) => m.id === cloud!.map)) {
    merged.map = cloud.map;
  }
  return merged;
}

export function resolveName(p: Profile): string {
  const n = (p.name || tgUserName() || 'Wanderer').trim();
  return n || 'Wanderer';
}

/* -------------------------------------------------------------
 * Global leaderboard hook.
 * A true cross-player board needs a tiny backend (a free
 * Cloudflare Worker or Supabase table). Paste its URL below and
 * the game will push each run and pull the top scores — no other
 * changes needed. Empty string = local board only.
 * ----------------------------------------------------------- */
export const LEADERBOARD_API = 'https://curly-hall-ecb2.amirpixie82.workers.dev';

export async function pushGlobalScore(entry: { name: string; score: number; wave: number; mode?: 'battle' | 'race' | 'rush' | 'word' }) {
  if (!LEADERBOARD_API) return;
  try {
    await fetch(`${LEADERBOARD_API}?mode=${entry.mode || 'battle'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch {
    /* offline — local board already saved */
  }
}

export async function fetchGlobalScores(mode: 'battle' | 'race' | 'rush' | 'word' = 'battle'): Promise<{ name: string; score: number; wave: number }[] | null> {
  if (!LEADERBOARD_API) return null;
  try {
    const r = await fetch(`${LEADERBOARD_API}?mode=${mode}`);
    if (!r.ok) return null;
    const d = (await r.json()) as unknown;
    return Array.isArray(d) ? (d as { name: string; score: number; wave: number }[]) : null;
  } catch {
    return null;
  }
}
