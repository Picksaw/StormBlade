/**
 * Optional Telegram Mini App integration.
 * Every function is a safe no-op outside Telegram, so the same build
 * runs in a normal browser and inside Telegram unchanged.
 */

interface HapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
}
interface CloudStorage {
  setItem(key: string, value: string, cb?: (err: unknown, ok?: boolean) => void): void;
  getItem(key: string, cb: (err: unknown, value?: string) => void): void;
}
interface BackButton {
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
}
interface WebAppUser {
  first_name?: string;
  username?: string;
}
interface TelegramWebApp {
  ready(): void;
  expand(): void;
  initDataUnsafe?: { user?: WebAppUser };
  platform?: string;
  viewportStableHeight?: number;
  HapticFeedback?: HapticFeedback;
  CloudStorage?: CloudStorage;
  BackButton?: BackButton;
  onEvent(ev: string, cb: () => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export const tg = (): TelegramWebApp | null => window.Telegram?.WebApp ?? null;
export const isTelegram = () => tg() != null;

let ready = false;
/** Call once on boot. Expands the mini app and reports the stable viewport height. */
export function tgInit(onViewport?: (heightPx: number) => void) {
  const w = tg();
  if (!w || ready) return;
  ready = true;
  try {
    w.ready();
    w.expand();
    const emit = () => {
      const h = w.viewportStableHeight ?? window.innerHeight;
      if (h > 0) onViewport?.(h);
    };
    emit();
    w.onEvent('viewportChanged', emit);
  } catch {
    /* older clients — ignore */
  }
}

let lastHaptic = 0;
/** Throttled haptic feedback (Telegram rate-limits anyway). */
export function tgHaptic(kind: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'error') {
  const h = tg()?.HapticFeedback;
  if (!h) return;
  const now = performance.now();
  if (now - lastHaptic < 45) return;
  lastHaptic = now;
  try {
    if (kind === 'success' || kind === 'error') h.notificationOccurred(kind);
    else h.impactOccurred(kind);
  } catch {
    /* ignore */
  }
}

export function tgUserName(): string | null {
  try {
    return tg()?.initDataUnsafe?.user?.first_name ?? null;
  } catch {
    return null;
  }
}

/** Generic CloudStorage get (per-user, survives app clears, syncs across devices). */
export function tgCloudGet(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    const cs = tg()?.CloudStorage;
    if (!cs) return resolve(null);
    try {
      cs.getItem(key, (err, val) => resolve(err ? null : val ?? null));
    } catch {
      resolve(null);
    }
  });
}

export function tgCloudSet(key: string, json: string) {
  const cs = tg()?.CloudStorage;
  if (!cs) return;
  try {
    cs.setItem(key, json);
  } catch {
    /* ignore */
  }
}

const SCORE_KEY_BATTLE = 'stormblade.scores.v1';
const SCORE_KEY_RACE = 'stormblade.scores.race.v1';

/** Load high scores from Telegram CloudStorage. */
export function tgLoadScores(mode: 'battle' | 'race' | 'rush' | 'word' = 'battle'): Promise<string | null> {
  return tgCloudGet(mode === 'battle' ? SCORE_KEY_BATTLE : `${SCORE_KEY_RACE}.${mode}`);
}

export function tgSaveScores(json: string, mode: 'battle' | 'race' | 'rush' | 'word' = 'battle') {
  tgCloudSet(mode === 'battle' ? SCORE_KEY_BATTLE : `${SCORE_KEY_RACE}.${mode}`, json);
}

let backCb: (() => void) | null = null;
let backAttached = false;
const backHandler = () => backCb?.();

/** Show Telegram's hardware/software Back button while playing; it fires `cb` (pause). */
export function tgBackButton(show: boolean, cb?: () => void) {
  const b = tg()?.BackButton;
  if (!b) return;
  if (!backAttached) {
    try {
      b.onClick(backHandler);
      backAttached = true;
    } catch {
      return;
    }
  }
  backCb = cb ?? null;
  try {
    if (show) b.show();
    else b.hide();
  } catch {
    /* ignore */
  }
}
