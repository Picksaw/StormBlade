import { useState, type ReactNode } from 'react';
import { clamp, formatScore, type HighScore } from '../game/core';
import { STR, type Lang } from '../game/i18n';
import { challengeById, type ChallengeId, type DailyState } from '../game/daily';
import { BladeBadge, Btn, CoinIcon, GemIcon, IconBtn, LangBtn, ScoreTable } from './Ui';

/* ------------------------------------------------------------ mode icons */

/** Distinct silhouette per mode so they read instantly. */
function ModeIcon({ id, className = 'h-5 w-5' }: { id: string; className?: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (id === 'battle') {
    // crossed swords
    return (
      <svg viewBox="0 0 24 24" className={className} {...p}>
        <path d="M3.5 3.5 14 14M20.5 3.5 10 14" />
        <path d="M2.6 19.2 6 15.8l2.2 2.2-3.4 3.4a1.55 1.55 0 0 1-2.2-2.2z" />
        <path d="M21.4 19.2 18 15.8l-2.2 2.2 3.4 3.4a1.55 1.55 0 0 0 2.2-2.2z" />
      </svg>
    );
  }
  if (id === 'race') {
    // downward chevrons = oncoming lanes
    return (
      <svg viewBox="0 0 24 24" className={className} {...p}>
        <path d="M5 4h14M5 20h14" />
        <path d="m7.5 9 4.5 4 4.5-4" />
        <path d="m7.5 14 4.5 4 4.5-4" opacity=".55" />
      </svg>
    );
  }
  if (id === 'rush') {
    // axe cleaving a block
    return (
      <svg viewBox="0 0 24 24" className={className} {...p}>
        <path d="M14.5 3.5a6.5 6.5 0 0 1 0 8c1.9-.7 3.6-.7 5 0a8.5 8.5 0 0 0 0-8c-1.4.8-3.1.8-5 0z" />
        <path d="M13 10 4.2 18.8a1.7 1.7 0 0 0 2.4 2.4L15.4 12.4" />
      </svg>
    );
  }
  // word: letter tiles
  return (
    <svg viewBox="0 0 24 24" className={className} {...p}>
      <rect x="2.5" y="6" width="8" height="8" rx="1.4" />
      <rect x="13.5" y="6" width="8" height="8" rx="1.4" />
      <path d="M5.4 11.4h2.2M6.5 8.9v2.5M16.4 8.9v4.2M16.4 8.9h1.6a1.2 1.2 0 0 1 0 2.4h-1.6" />
      <path d="M4 18.5h16" opacity=".5" />
    </svg>
  );
}

/* ------------------------------------------------------------------ atoms */

/** Thin section heading with a hairline rule — used across all panels. */
function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-[10px] font-semibold tracking-[0.28em] text-slate-400 uppercase">{children}</h3>
      {right}
      <div className="h-px flex-1 bg-slate-700/50" />
    </div>
  );
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-slate-700/60 bg-slate-900/60 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex min-w-[24px] items-center justify-center rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-200">
      {children}
    </kbd>
  );
}

/* ------------------------------------------------------------ guide modal */

export function GuideScreen({
  onClose,
  lang,
  isTouch,
}: {
  onClose: () => void;
  lang: Lang;
  isTouch: boolean;
}) {
  const t = STR[lang];
  const row = (label: string, value: ReactNode) => (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 py-2 last:border-0">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="text-right text-[11px] font-medium text-slate-200">{value}</span>
    </div>
  );

  const modes: [string, string][] = [
    [t.modeBattle, t.strategy],
    [t.modeRace, t.raceStrategy],
    [t.modeRush, t.rushStrategy],
    [t.modeWord, t.wordStrategy],
  ];

  const orbs: [string, string, string][] = [
    [t.mightLabel, '#ff8a3d', '×1.5 damage'],
    ['THUNDER', '#79f2ff', 'Chain lightning'],
    ['SURGE', '#ffd166', 'Instant Overcharge'],
    [t.triLabel, '#52e3ff', 'Throw 3 blades'],
    [t.freezeLabel, '#a0f0ff', 'Freeze everything'],
    [t.score2xLabel, '#ffae52', 'Double score'],
    [t.hud_blink_free, '#79f2ff', 'No blink cooldown'],
    [t.hud_speed_boost, '#6dffb0', '+35% move speed'],
    [t.hud_slow_mo, '#c9a6ff', 'Obstacles at 50%'],
    [t.hud_hyper_speed, '#ff4d6d', 'Faster, 2.5× score'],
    [t.hud_ghost_pass, '#f0a0ff', 'Phase through all'],
    [t.hud_magnet, '#b6ff5c', 'Attract orbs'],
    [t.hud_shield, '#7af5ff', 'Absorb one hit'],
  ];

  return (
    <div className="overlay-scroll fixed inset-0 z-[60] overflow-y-auto bg-slate-950/96 backdrop-blur-lg" data-uiblock>
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-100">{t.guideTitle}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t.guideSub}</p>
          </div>
          <IconBtn onClick={onClose} label="close">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </IconBtn>
        </div>

        <Panel className="mb-4 p-4">
          <SectionTitle>{t.guideCore}</SectionTitle>
          <p className="text-[12px] leading-relaxed text-slate-300">{t.guideCoreBody}</p>
        </Panel>

        <Panel className="mb-4 p-4">
          <SectionTitle>{t.guideControls}</SectionTitle>
          {isTouch ? (
            <>
              {row(t.move, t.moveTouch)}
              {row(t.throwBlinkLabel, t.throwBlinkTouch)}
              {row(t.slashLabel, t.slashTouch)}
            </>
          ) : (
            <>
              {row(
                t.move,
                <>
                  <Key>W</Key>
                  <Key>A</Key>
                  <Key>S</Key>
                  <Key>D</Key>
                </>,
              )}
              {row(
                t.throwBlinkLabel,
                <>
                  <Key>Space</Key> / <Key>LMB</Key>
                </>,
              )}
              {row(
                t.slashLabel,
                <>
                  <Key>J</Key> / <Key>RMB</Key>
                </>,
              )}
              {row(
                t.pauseLabel,
                <>
                  <Key>Esc</Key>
                </>,
              )}
              {row(
                t.restart,
                <>
                  <Key>R</Key>
                </>,
              )}
              {row(
                t.sound,
                <>
                  <Key>M</Key>
                </>,
              )}
            </>
          )}
        </Panel>

        <Panel className="mb-4 p-4">
          <SectionTitle>{t.guideModes}</SectionTitle>
          <div className="space-y-3">
            {modes.map(([name, desc]) => (
              <div key={name} className="border-l-2 border-slate-700 pl-3">
                <div className="text-[11px] font-semibold tracking-wide text-slate-200">{name}</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="mb-4 p-4">
          <SectionTitle>{t.guideOrbs}</SectionTitle>
          <div className="grid grid-cols-1 gap-x-5 gap-y-1.5 sm:grid-cols-2">
            {orbs.map(([name, color, desc]) => (
              <div key={name} className="flex items-center gap-2.5 py-1">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
                <span className="text-[11px] font-medium text-slate-200">{name}</span>
                <span className="ms-auto text-[10px] text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="mb-5 p-4">
          <SectionTitle>{t.guideEcon}</SectionTitle>
          <p className="text-[12px] leading-relaxed text-slate-300">{t.guideEconBody}</p>
        </Panel>

        <Btn onClick={onClose} className="w-full">
          {t.guideClose}
        </Btn>
        <div className="mt-6 text-center text-[9px] tracking-[0.35em] text-slate-600">PICKSAW STUDIO</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- main menu */

export function StartScreen({
  onStart,
  onArmory,
  onGuide,
  mode,
  onMode,
  scores,
  isTouch,
  coins,
  gems,
  daily,
  onDaily,
  dailyReady,
  name,
  nameLocked,
  onName,
  lang,
  onLang,
  account,
  onAuth,
  onLogout,
}: {
  onStart: () => void;
  onArmory: () => void;
  onGuide: () => void;
  mode: 'battle' | 'race' | 'rush' | 'word';
  onMode: (m: 'battle' | 'race' | 'rush' | 'word') => void;
  scores: HighScore[];
  isTouch: boolean;
  coins: number;
  gems: number;
  daily: DailyState;
  onDaily: () => void;
  dailyReady: number;
  name: string;
  nameLocked: boolean;
  onName: (n: string) => void;
  lang: Lang;
  onLang: () => void;
  account: string | null;
  onAuth: () => void;
  onLogout: () => void;
}) {
  const t = STR[lang];
  const dict = t as unknown as Record<string, string>;
  const [editName, setEditName] = useState(false);

  const modes = [
    { id: 'battle', label: t.modeBattle, accent: '#79f2ff' },
    { id: 'race', label: t.modeRace, accent: '#a97bff' },
    { id: 'rush', label: t.modeRush, accent: '#ffd166' },
    { id: 'word', label: t.modeWord, accent: '#6dffb0' },
  ] as const;

  const active = modes.find((m) => m.id === mode)!;
  const myRank = account ? scores.findIndex((s) => s.name.toLowerCase() === account.toLowerCase()) : -1;
  const myRow = myRank >= 0 ? scores[myRank] : null;
  const doneToday = daily.picks.filter((id) => (daily.progress[id] ?? 0) >= challengeById(id).target).length;

  return (
    /* The menu IS the full screen. It uses a solid dark base so nothing
       from behind can bleed through, then the CSS aurora sits on top. */
    <div
      className="overlay-scroll fixed inset-0 z-50 overflow-y-auto"
      style={{ background: '#070b16' }}
      data-uiblock
    >
      {/* Background layers rendered as inline divs — avoids relying on
          CSS class application order which failed on some mobile browsers */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1]"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 18% 12%, rgba(34,165,204,0.18) 0%, transparent 60%),' +
            'radial-gradient(ellipse 60% 50% at 85% 20%, rgba(139,92,246,0.15) 0%, transparent 62%),' +
            'radial-gradient(ellipse 80% 60% at 50% 108%, rgba(20,60,90,0.38) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[-1]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, #000 30%, transparent 78%)',
        }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
        {/* ── masthead ─────────────────────────────────────────── */}
        <header className="mb-6 flex items-center justify-between gap-4 border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-cyan-400">
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
            </svg>
            <div>
              <h1 className="text-lg leading-none font-semibold tracking-[0.2em] text-slate-100 sm:text-xl">
                STORMBLADE
              </h1>
              <p className="mt-1 text-[9px] tracking-[0.3em] text-slate-500">PICKSAW STUDIO</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangBtn lang={lang} onLang={onLang} />
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onGuide();
              }}
              className="pointer-events-auto rounded-md border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 active:scale-95"
            >
              {t.guideBtn}
            </button>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          {/* ── LEFT: daily challenges ─────────────────────────── */}
          <Panel className="order-2 p-4 lg:order-1">
            <SectionTitle
              right={
                <span className="tabnum text-[10px] font-semibold text-slate-500">
                  {doneToday}/{daily.picks.length}
                </span>
              }
            >
              {t.dailyProgress}
            </SectionTitle>

            <div className="space-y-2">
              {daily.picks.map((id: ChallengeId) => {
                const c = challengeById(id);
                const prog = Math.min(daily.progress[id] ?? 0, c.target);
                const done = prog >= c.target;
                const claimed = !!daily.claimed[id];
                const k = clamp(prog / c.target, 0, 1);
                return (
                  <div key={id} className={claimed ? 'opacity-40' : ''}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] leading-snug text-slate-300">{dict[c.key] || c.key}</span>
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-cyan-300">
                        <GemIcon className="h-3 w-3" />
                        {c.gems}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${
                            done ? 'bg-emerald-400' : 'bg-cyan-500'
                          }`}
                          style={{ width: `${k * 100}%` }}
                        />
                      </div>
                      <span className="tabnum w-14 text-right text-[9px] text-slate-500">
                        {formatScore(prog)}/{formatScore(c.target)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDaily();
              }}
              className={`pointer-events-auto mt-4 w-full rounded-md border py-2 text-[11px] font-semibold tracking-wide transition active:scale-[0.98] ${
                dailyReady > 0
                  ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                  : 'border-slate-600 bg-slate-800/60 text-slate-300 hover:border-slate-500'
              }`}
            >
              {dailyReady > 0 ? `${t.dailyClaim} (${dailyReady})` : t.dailyBtn}
            </button>
          </Panel>

          {/* ── CENTRE: identity + mode + play ─────────────────── */}
          <div className="order-1 space-y-4 lg:order-2">
            {/* operator ID card */}
            <Panel className="overflow-hidden">
              <div className="flex items-stretch">
                <div
                  className="w-1.5 shrink-0"
                  style={{ background: account ? '#34d399' : '#64748b' }}
                  aria-hidden
                />
                <div className="flex flex-1 flex-wrap items-center gap-4 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-slate-600 bg-slate-800">
                    <span className="text-lg font-bold text-slate-300">
                      {(account || name || 'G').charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] tracking-[0.28em] text-slate-500">{t.playerCard}</div>
                    {account || nameLocked || !editName ? (
                      <div className="flex items-center gap-2">
                        <span className="truncate text-base font-semibold text-slate-100">
                          {account || name || t.unrankedLabel}
                        </span>
                        {!account && !nameLocked && (
                          <button
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setEditName(true);
                            }}
                            className="pointer-events-auto text-[10px] text-slate-500 underline underline-offset-2 hover:text-slate-300"
                          >
                            edit
                          </button>
                        )}
                      </div>
                    ) : (
                      <input
                        autoFocus
                        value={name}
                        maxLength={14}
                        onChange={(e) => onName(e.target.value.replace(/[<>]/g, ''))}
                        onBlur={() => setEditName(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditName(false)}
                        className="w-40 rounded border border-slate-600 bg-slate-950 px-2 py-0.5 text-sm font-semibold text-slate-100 outline-none focus:border-cyan-500"
                      />
                    )}
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      {account ? (
                        myRow ? (
                          <>
                            {t.rankLabel} #{myRank + 1} · {formatScore(myRow.score)}
                          </>
                        ) : (
                          t.noRankYet
                        )
                      ) : (
                        t.boardGuestNote
                      )}
                    </div>
                  </div>

                  {/* currencies */}
                  <div className="flex items-center gap-4 border-s border-slate-700/70 ps-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1.5">
                        <CoinIcon className="h-3.5 w-3.5" />
                        <span className="tabnum text-sm font-semibold text-amber-300">{formatScore(coins)}</span>
                      </div>
                      <div className="mt-0.5 text-[8px] tracking-[0.2em] text-slate-600">COINS</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1.5">
                        <GemIcon className="h-3.5 w-3.5" />
                        <span className="tabnum text-sm font-semibold text-cyan-300">{formatScore(gems)}</span>
                      </div>
                      <div className="mt-0.5 text-[8px] tracking-[0.2em] text-slate-600">{t.gemsLabel}</div>
                    </div>
                  </div>

                  <button
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      account ? onLogout() : onAuth();
                    }}
                    className={`pointer-events-auto rounded-md border px-3 py-1.5 text-[10px] font-semibold tracking-wide transition active:scale-95 ${
                      account
                        ? 'border-slate-600 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                        : 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                    }`}
                  >
                    {account ? t.authLogout : t.authSignIn}
                  </button>
                </div>
              </div>
            </Panel>

            {/* mode selector */}
            <Panel className="p-4">
              <SectionTitle>{t.selectMode}</SectionTitle>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {modes.map((m) => {
                  const on = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onMode(m.id);
                      }}
                      style={on ? { borderColor: m.accent, color: m.accent } : undefined}
                      className={`pointer-events-auto flex flex-col items-center gap-1.5 rounded-md border px-2 py-2.5 text-[10px] font-semibold tracking-[0.08em] uppercase transition active:scale-[0.97] ${
                        on ? 'bg-slate-800' : 'border-slate-700 bg-slate-900/50 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <ModeIcon id={m.id} />
                      {m.label}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 border-t border-slate-800 pt-3 text-[11px] leading-relaxed text-slate-400">
                {mode === 'word'
                  ? t.wordStrategy
                  : mode === 'rush'
                    ? t.rushStrategy
                    : mode === 'race'
                      ? t.raceStrategy
                      : t.strategy}
              </p>
            </Panel>

            {/* actions */}
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onStart();
                }}
                style={{ background: active.accent }}
                className="pointer-events-auto flex items-center justify-center gap-2.5 rounded-md py-3.5 text-sm font-bold tracking-[0.16em] text-slate-950 uppercase transition active:scale-[0.98]"
              >
                <ModeIcon id={active.id} className="h-5 w-5" />
                {t.playBtn} — {active.label}
              </button>
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onArmory();
                }}
                className="pointer-events-auto rounded-md border border-slate-600 bg-slate-800/70 px-6 text-xs font-semibold tracking-wide text-slate-200 transition hover:border-slate-500 active:scale-[0.98]"
              >
                {t.armoryBtn}
              </button>
            </div>
            {!isTouch && (
              <p className="text-center text-[10px] tracking-[0.2em] text-slate-600">{t.pressSpace}</p>
            )}
          </div>

          {/* ── RIGHT: leaderboard ─────────────────────────────── */}
          <Panel className="order-3 overflow-hidden">
            <div className="border-b border-slate-700/60 bg-slate-800/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold tracking-[0.2em] text-slate-200 uppercase">{t.hall}</h3>
                <span
                  className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase"
                  style={{ color: active.accent, background: `${active.accent}18` }}
                >
                  <ModeIcon id={active.id} className="h-3.5 w-3.5" />
                  {active.label}
                </span>
              </div>
            </div>

            {/* podium */}
            {scores.length > 0 && (
              <div className="flex items-end justify-center gap-2 border-b border-slate-800 px-4 py-4">
                {[1, 0, 2].map((idx) => {
                  const s = scores[idx];
                  if (!s) return <div key={idx} className="w-1/3" />;
                  const h = idx === 0 ? 'h-14' : idx === 1 ? 'h-10' : 'h-8';
                  const medal = idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : '#d97706';
                  return (
                    <div key={idx} className="flex w-1/3 flex-col items-center">
                      <div className="truncate text-[10px] font-semibold text-slate-200">{s.name}</div>
                      {s.blade && <BladeBadge id={s.blade} />}
                      <div className="tabnum text-[10px] text-slate-500">{formatScore(s.score)}</div>
                      <div
                        className={`mt-1.5 flex ${h} w-full items-start justify-center rounded-t border-t-2 bg-slate-800/70 pt-1`}
                        style={{ borderColor: medal }}
                      >
                        <span className="text-xs font-bold" style={{ color: medal }}>
                          {idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-3">
              {scores.length > 3 ? (
                <ScoreTable
                  scores={scores.slice(3, 10)}
                  noLegends={t.emptyBoard}
                  showBlade={mode !== 'word'}
                  wordMode={mode === 'word'}
                  lang={lang}
                />
              ) : scores.length === 0 ? (
                <p className="py-6 text-center text-[11px] text-slate-500">{t.emptyBoard}</p>
              ) : null}

              {/* your standing */}
              <div className="mt-3 flex items-center justify-between rounded-md border border-slate-700/70 bg-slate-800/40 px-3 py-2">
                <span className="text-[9px] tracking-[0.2em] text-slate-500">{t.youLabel}</span>
                {myRow ? (
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-slate-400">#{myRank + 1}</span>
                    <span className="tabnum text-xs font-bold text-slate-100">{formatScore(myRow.score)}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">{account ? t.noRankYet : t.unrankedLabel}</span>
                )}
              </div>
            </div>
          </Panel>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-4 text-center text-[9px] tracking-[0.35em] text-slate-600">
          PICKSAW STUDIO
        </div>
      </div>
    </div>
  );
}
