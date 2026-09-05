/**
 * Local account system for the STORMBLADE leaderboard.
 * No email, no third party — just a username + password stored on-device
 * (and mirrored to Telegram CloudStorage when available).
 *
 * Passwords are salted + hashed with SHA-256 via WebCrypto; the plaintext
 * is never stored. This is a client-side board, so treat it as a friendly
 * identity system rather than bank-grade security.
 */

import { LEADERBOARD_API } from './meta';
import { tgCloudGet, tgCloudSet } from './telegram';

export interface Account {
  user: string; // canonical lowercase key
  display: string; // as typed (English chars only)
  hash: string;
  salt: string;
  created: number;
  bestBattle: number;
  bestRace: number;
  bestWave: number;
  bestSector: number;
  bestRush?: number;
  bestBroken?: number;
  /** blade used on each personal-best run (shown on the leaderboard) */
  bladeBattle?: string;
  bladeRace?: string;
  bladeRush?: string;
}

const ACCOUNTS_KEY = 'stormblade.accounts.v1';
const SESSION_KEY = 'stormblade.session.v1';

/* ----------------------------------------------------------- name filter */

/** Blocked substrings — slurs, sexual, scatological, and harassment terms. */
const BANNED = [
  'nigg', 'nigr', 'negro', 'chink', 'gook', 'kike', 'spic', 'wetback', 'coon', 'raghead',
  'tranny', 'faggot', 'fagot', 'fag', 'dyke', 'homo', 'queer',
  'retard', 'tard', 'spastic', 'cripple',
  'fuck', 'fuk', 'fvck', 'phuck', 'shit', 'sh1t', 'bullshit', 'crap',
  'cunt', 'kunt', 'twat', 'bitch', 'b1tch', 'biatch', 'whore', 'hoe', 'slut', 'skank',
  'bastard', 'wanker', 'prick', 'dick', 'd1ck', 'cock', 'cok', 'knob', 'penis', 'peni5',
  'vagina', 'pussy', 'pussi', 'puss1', 'clit', 'boob', 'tits', 'titty', 'nipple',
  'anal', 'anus', 'arse', 'ass', 'asshole', 'butthole', 'rectum', 'poop', 'turd', 'piss',
  'sex', 'sexo', 'porn', 'pron', 'porno', 'hentai', 'milf', 'dildo', 'orgasm', 'cum', 'jizz',
  'semen', 'sperm', 'masturb', 'fap', 'blowjob', 'handjob', 'rimjob', 'bdsm', 'fetish',
  'rape', 'rapist', 'molest', 'pedo', 'paedo', 'incest', 'bestial',
  'nazi', 'hitler', 'kkk', 'isis', 'jihad', 'terrorist', 'genocide',
  'kill yourself', 'kys', 'suicide',
  'damn', 'goddamn', 'bloody hell',
  'admin', 'moderator', 'official', 'piksaw', 'picksaw', 'system',
];

/** Leet-speak normalisation so "sh1t" / "a$$" / "fuk" are still caught. */
function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4@]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .replace(/[8]/g, 'b')
    .replace(/[9]/g, 'g')
    .replace(/[^a-z]/g, '');
}

export type NameError = 'empty' | 'short' | 'long' | 'charset' | 'start' | 'banned' | 'taken' | null;

/** Validate a username: English letters/digits/_/- only, 3–14 chars, clean. */
export function validateName(raw: string): NameError {
  const name = raw.trim();
  if (!name) return 'empty';
  if (name.length < 3) return 'short';
  if (name.length > 14) return 'long';
  // English alphabet, digits, underscore and hyphen only
  if (!/^[A-Za-z0-9_-]+$/.test(name)) return 'charset';
  if (!/^[A-Za-z]/.test(name)) return 'start';
  const flat = normalize(name);
  for (const bad of BANNED) {
    const b = normalize(bad);
    if (b && flat.includes(b)) return 'banned';
  }
  return null;
}

export function validatePassword(pw: string): 'empty' | 'short' | 'long' | null {
  if (!pw) return 'empty';
  if (pw.length < 4) return 'short';
  if (pw.length > 32) return 'long';
  return null;
}

/* -------------------------------------------------------------- storage */

export function loadAccounts(): Record<string, Account> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAccounts(map: Record<string, Account>) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  tgCloudSet(ACCOUNTS_KEY, JSON.stringify(map));
}

export function pullCloudAccounts(): Promise<string | null> {
  return tgCloudGet(ACCOUNTS_KEY);
}

export function loadSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function saveSession(user: string | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, user);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

/* --------------------------------------------------------------- crypto */

const randSalt = () => {
  const a = new Uint8Array(12);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
};

async function hashPw(pw: string, salt: string): Promise<string> {
  try {
    const data = new TextEncoder().encode(`stormblade::${salt}::${pw}`);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // very old browser fallback (still salted, just weaker)
    let h = 0;
    const s = `${salt}:${pw}`;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return `fb${(h >>> 0).toString(16)}`;
  }
}

/* ---------------------------------------------------------------- API */

export type AuthResult =
  | { ok: true; account: Account; profile?: Record<string, unknown> | null }
  | { ok: false; error: string };

/* ------------------------------------------------------- online sync */
/**
 * When LEADERBOARD_API is configured the account lives on the server, so
 * every player sees the same board. Without it we fall back to local-only.
 */
const TOKEN_KEY = 'stormblade.token.v1';

export const isOnline = () => !!LEADERBOARD_API;

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

async function api(path: string, body: unknown): Promise<{ ok: boolean; error?: string; [k: string]: unknown }> {
  const r = await fetch(`${LEADERBOARD_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await r.json()) as { ok: boolean; error?: string };
}

export type RunMode = 'battle' | 'race' | 'rush' | 'word';
export type Platform = 'pc' | 'android';

/** Where this run is being played — PC or Android, shown on the leaderboard. */
export function detectPlatform(): Platform {
  try {
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return 'android';
    // any touch-first device (incl. Telegram on a phone) counts as Android
    if (window.matchMedia('(pointer: coarse)').matches && !/Windows|Macintosh|Linux x86/i.test(ua)) {
      return 'android';
    }
    return 'pc';
  } catch {
    return 'pc';
  }
}

/** Push a finished run to the shared server board. */
export async function submitOnlineScore(
  mode: RunMode,
  score: number,
  wave: number,
  blade?: string,
  kills?: number,
) {
  if (!LEADERBOARD_API) return;
  const user = loadSession();
  const token = getToken();
  if (!user || !token) return;
  try {
    await api('/submit', { user, token, mode, score, wave, blade, kills, platform: detectPlatform() });
  } catch {
    /* offline — the local board already has it */
  }
}

/** Upload coins / owned skins / equipped gear so they follow the account. */
export async function syncProfileUp(profile: unknown) {
  if (!LEADERBOARD_API) return null;
  const user = loadSession();
  const token = getToken();
  if (!user || !token) return null;
  try {
    const res = await api('/profile', { user, token, profile });
    return res.ok ? (res.profile as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Fetch the shared board for a mode. */
export async function fetchOnlineBoard(mode: RunMode) {
  if (!LEADERBOARD_API) return null;
  try {
    const r = await fetch(`${LEADERBOARD_API}/board?mode=${mode}`);
    if (!r.ok) return null;
    const d = await r.json();
    return Array.isArray(d) ? (d as { name: string; score: number; wave: number; blade?: string }[]) : null;
  } catch {
    return null;
  }
}

export async function registerAccount(rawName: string, pw: string): Promise<AuthResult> {
  const nameErr = validateName(rawName);
  if (nameErr) return { ok: false, error: `name_${nameErr}` };
  const pwErr = validatePassword(pw);
  if (pwErr) return { ok: false, error: `pw_${pwErr}` };

  const accounts = loadAccounts();
  const key = rawName.trim().toLowerCase();

  // ── online: the server owns the namespace so names are unique worldwide
  if (LEADERBOARD_API) {
    try {
      const res = await api('/register', { user: rawName.trim(), pass: pw });
      if (!res.ok) return { ok: false, error: res.error || 'server' };
      setToken(String(res.token || ''));
    } catch {
      return { ok: false, error: 'offline' };
    }
  } else if (accounts[key]) {
    return { ok: false, error: 'name_taken' };
  }

  const salt = randSalt();
  const hash = await hashPw(pw, salt);
  const account: Account = {
    user: key,
    display: rawName.trim(),
    hash,
    salt,
    created: Date.now(),
    bestBattle: 0,
    bestRace: 0,
    bestWave: 0,
    bestSector: 0,
  };
  accounts[key] = account;
  saveAccounts(accounts);
  saveSession(key);
  return { ok: true, account };
}

export async function loginAccount(rawName: string, pw: string): Promise<AuthResult> {
  const key = rawName.trim().toLowerCase();
  if (!key) return { ok: false, error: 'name_empty' };
  const accounts = loadAccounts();

  // ── online: authenticate against the shared server
  if (LEADERBOARD_API) {
    try {
      const res = await api('/login', { user: rawName.trim(), pass: pw });
      if (!res.ok) return { ok: false, error: res.error || 'server' };
      setToken(String(res.token || ''));
      const best = (res.best || {}) as { battle?: number; race?: number; rush?: number };
      const acc: Account = accounts[key] ?? {
        user: key,
        display: String(res.user || rawName.trim()),
        hash: '',
        salt: '',
        created: Date.now(),
        bestBattle: 0,
        bestRace: 0,
        bestWave: 0,
        bestSector: 0,
      };
      const b = res.best as Record<string, unknown> | undefined;
      acc.bestBattle = Math.max(acc.bestBattle || 0, best.battle || 0);
      acc.bestRace = Math.max(acc.bestRace || 0, best.race || 0);
      acc.bestRush = Math.max(acc.bestRush || 0, best.rush || 0);
      acc.bestWave = Math.max(acc.bestWave || 0, Number(b?.wave) || 0);
      acc.bestSector = Math.max(acc.bestSector || 0, Number(b?.sector) || 0);
      acc.bestBroken = Math.max(acc.bestBroken || 0, Number(b?.broken) || 0);
      acc.bladeBattle = (b?.bladeBattle as string) || acc.bladeBattle;
      acc.bladeRace = (b?.bladeRace as string) || acc.bladeRace;
      acc.bladeRush = (b?.bladeRush as string) || acc.bladeRush;
      accounts[key] = acc;
      saveAccounts(accounts);
      saveSession(key);
      return { ok: true, account: acc, profile: (res.profile as Record<string, unknown>) ?? null };
    } catch {
      return { ok: false, error: 'offline' };
    }
  }

  const acc = accounts[key];
  if (!acc) return { ok: false, error: 'no_user' };
  const hash = await hashPw(pw, acc.salt);
  if (hash !== acc.hash) return { ok: false, error: 'bad_pw' };
  saveSession(key);
  return { ok: true, account: acc };
}

export function currentAccount(): Account | null {
  const key = loadSession();
  if (!key) return null;
  const accounts = loadAccounts();
  return accounts[key] ?? null;
}

export function logout() {
  saveSession(null);
  setToken(null);
}

/** Record a finished run onto the signed-in account. */
export function recordRun(
  user: string,
  mode: RunMode,
  score: number,
  wave: number,
  sector: number,
  blade?: string,
) {
  const accounts = loadAccounts();
  const acc = accounts[user];
  if (!acc) return null;
  if (mode === 'rush') {
    if (score > (acc.bestRush || 0)) acc.bladeRush = blade;
    acc.bestRush = Math.max(acc.bestRush || 0, score);
    acc.bestBroken = Math.max(acc.bestBroken || 0, sector);
  } else if (mode === 'race') {
    if (score > (acc.bestRace || 0)) acc.bladeRace = blade;
    acc.bestRace = Math.max(acc.bestRace || 0, score);
    acc.bestSector = Math.max(acc.bestSector || 0, sector);
  } else {
    if (score > (acc.bestBattle || 0)) acc.bladeBattle = blade;
    acc.bestBattle = Math.max(acc.bestBattle || 0, score);
    acc.bestWave = Math.max(acc.bestWave || 0, wave);
  }
  accounts[user] = acc;
  saveAccounts(accounts);
  return acc;
}

/** Build the leaderboard from every registered account for a given mode. */
export function accountBoard(mode: RunMode) {
  const accounts = loadAccounts();
  return Object.values(accounts)
    .map((a) => ({
      name: a.display,
      score: mode === 'rush' ? a.bestRush || 0 : mode === 'race' ? a.bestRace || 0 : a.bestBattle || 0,
      wave: mode === 'rush' ? a.bestBroken || 0 : mode === 'race' ? a.bestSector || 0 : a.bestWave || 0,
      blade: mode === 'rush' ? a.bladeRush : mode === 'race' ? a.bladeRace : a.bladeBattle,
      kills: 0,
      date: a.created,
      mode,
    }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

/** Merge a cloud account blob into local storage (keeps the best scores). */
export function mergeAccounts(cloudRaw: string | null) {
  if (!cloudRaw) return;
  try {
    const cloud = JSON.parse(cloudRaw) as Record<string, Account>;
    if (!cloud || typeof cloud !== 'object') return;
    const local = loadAccounts();
    for (const [k, c] of Object.entries(cloud)) {
      const l = local[k];
      if (!l) {
        local[k] = c;
      } else {
        l.bestBattle = Math.max(l.bestBattle || 0, c.bestBattle || 0);
        l.bestRace = Math.max(l.bestRace || 0, c.bestRace || 0);
        l.bestWave = Math.max(l.bestWave || 0, c.bestWave || 0);
        l.bestSector = Math.max(l.bestSector || 0, c.bestSector || 0);
      }
    }
    saveAccounts(local);
  } catch {
    /* ignore */
  }
}
