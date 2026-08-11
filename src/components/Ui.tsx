import { useState, type ReactNode } from 'react';
import type { Hud } from '../game/engine';
import { clamp, formatScore, type HighScore } from '../game/core';
import { bladeLabel, STR, type Lang, type Strings } from '../game/i18n';
import {
  altGemCostOf,
  coinCostOf,
  gemPriceOf,
  HERO_SKINS,
  MAP_SKINS,
  RUSH_BLADES,
  SWORD_SKINS,
  type HeroSkin,
  type MapSkin,
  type SwordSkin,
} from '../game/skins';
import type { Profile } from '../game/meta';
import { challengeById, type ChallengeId, type DailyState } from '../game/daily';
import { SHURIKEN_PATH, SHURIKEN_CENTRE } from '../game/axe-path';

/* ------------------------------------------------------------------ atoms */

function Heart({ full }: { full: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 sm:h-6 sm:w-6 ${full ? '' : 'opacity-25'}`}>
      <path
        d="M12 21s-8-5.1-8-10.4C4 7.3 6.3 5 9.2 5c1.7 0 3 .8 2.8 2 .2-1.2 1.1-2 2.8-2C17.7 5 20 7.3 20 10.6 20 15.9 12 21 12 21z"
        fill={full ? '#ff4d6d' : '#2a3350'}
        stroke={full ? '#ffb3c4' : '#3d4870'}
        strokeWidth="1.4"
      />
    </svg>
  );
}

function Bolt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
    </svg>
  );
}

export function CoinIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="9" fill="#ffd166" stroke="#8a6a1c" strokeWidth="2" />
      <path d="M12.6 6.5 8.8 13h2.9l-1.1 4.5L14.4 11h-2.9l1.1-4.5z" fill="#7a4c0c" />
    </svg>
  );
}

function GlobeIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.7 2.6 4 5.6 4 9s-1.3 6.4-4 9c-2.7-2.6-4-5.6-4-9s1.3-6.4 4-9z" />
    </svg>
  );
}

export function GemIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 2 20 9l-8 13L4 9z" fill="#7af5ff" stroke="#1b6c80" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 9h16M12 2v20" stroke="#d6fbff" strokeWidth="1.1" opacity="0.85" />
    </svg>
  );
}

export function GemPurse({ gems }: { gems: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold text-cyan-200">
      <GemIcon className="h-3.5 w-3.5" />
      <span className="tabnum">{formatScore(gems)}</span>
    </span>
  );
}

export function Wallet({ coins }: { coins: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/25 bg-amber-300/10 px-2.5 py-1 text-xs font-bold text-amber-300">
      <CoinIcon className="h-3.5 w-3.5" />
      <span className="tabnum">{formatScore(coins)}</span>
    </span>
  );
}

export function LangBtn({ lang, onLang, className = '' }: { lang: Lang; onLang: () => void; className?: string }) {
  return (
    <button
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onLang();
      }}
      className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-violet-300/30 bg-violet-300/10 px-3 py-1.5 text-xs font-bold text-violet-100 transition active:scale-95 ${className}`}
    >
      <GlobeIcon />
      {lang === 'en' ? 'فارسی' : 'English'}
    </button>
  );
}

export function PublisherMark({ publisherWord, className = '' }: { publisherWord: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 48 48" className="h-10 w-10">
        <rect
          x="11"
          y="11"
          width="26"
          height="26"
          rx="6"
          transform="rotate(45 24 24)"
          fill="rgba(169,123,255,0.12)"
          stroke="#a97bff"
          strokeWidth="2"
        />
        <path d="M26.5 12 16 26.5h6.2L20 36l10.5-14.5h-6.2L26.5 12z" fill="#79f2ff" />
      </svg>
      <div className="text-center leading-tight">
        <div className="text-[10px] font-bold tracking-[0.4em] text-cyan-100/85">PICKSAW STUDIO</div>
        <div className="text-[8px] tracking-[0.34em] text-cyan-200/35">{publisherWord}</div>
      </div>
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'ghost';
  className?: string;
}) {
  return (
    <button
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      className={`${variant === 'primary' ? 'btn-primary' : 'btn-ghost'} pointer-events-auto rounded-xl px-6 py-3 text-sm font-bold tracking-[0.18em] uppercase transition-transform duration-100 select-none ${className}`}
    >
      {children}
    </button>
  );
}

export function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 transition active:scale-95 sm:h-10 sm:w-10"
    >
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- previews */

function HeroPreview({ skin }: { skin: HeroSkin }) {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" style={{ filter: `drop-shadow(0 0 7px ${skin.main})` }}>
      <circle cx="32" cy="32" r="27" fill={skin.main} opacity="0.14" />
      <path d="M32 13 44 30 39.5 51 24.5 51 20 30 Z" fill={skin.body} stroke={skin.main} strokeWidth="2" />
      <path d="M32 8 41.5 25 22.5 25 Z" fill={skin.hood} stroke={skin.main} strokeWidth="1.4" />
      <rect x="25.5" y="27" width="4.4" height="3" fill={skin.eyes} />
      <rect x="34" y="27" width="4.4" height="3" fill={skin.eyes} />
      <path d="M28 35 34.5 41 30 42 35 48" stroke={skin.sigil} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BladePreview({ skin }: { skin: SwordSkin }) {
  const { glow, blade, core, guard, grip, type } = skin;
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" style={{ filter: `drop-shadow(0 0 7px ${glow})` }}>
      <g transform="rotate(-45 32 32)">
        {type === 'katana' && (
          <>
            <path d="M58 32 Q36 25.5 15 29 L15 33.5 Q36 35.5 58 32 Z" fill={blade} stroke={glow} strokeWidth="1.5" />
            <line x1="18" y1="31.6" x2="52" y2="31.6" stroke={core} strokeWidth="1.1" />
            <circle cx="15" cy="31.2" r="5" fill={guard} />
            <rect x="3" y="29" width="11" height="4.6" rx="1" fill={grip} />
          </>
        )}
        {type === 'great' && (
          <>
            <path d="M55 25.5 55 38.5 16 41 16 23 Z" fill={blade} stroke={glow} strokeWidth="1.6" />
            <line x1="19" y1="32" x2="50" y2="32" stroke={core} strokeWidth="1.6" />
            <rect x="11" y="20" width="5" height="24" rx="1" fill={guard} />
            <rect x="3" y="29" width="9" height="6" rx="1" fill={grip} />
          </>
        )}
        {type === 'saber' && (
          <>
            <path d="M57 30.5 Q34 22 15 27.5 L15 33 Q34 34.5 57 30.5 Z" fill={blade} stroke={glow} strokeWidth="1.5" />
            <line x1="18" y1="30" x2="50" y2="30" stroke={core} strokeWidth="1.1" />
            <path d="M15 24a8.5 8.5 0 0 0 0 16" stroke={guard} strokeWidth="2.6" fill="none" />
            <rect x="4" y="29" width="10" height="5.4" rx="1" fill={grip} />
          </>
        )}
        {type === 'long' && (
          <>
            <path d="M56 32 38 26.8 16 28.4 16 35.6 38 37.2 Z" fill={blade} stroke={glow} strokeWidth="1.6" />
            <line x1="19" y1="32" x2="50" y2="32" stroke={core} strokeWidth="1.2" />
            <rect x="12" y="24" width="4.4" height="16" rx="1" fill={guard} />
            <rect x="4" y="29.4" width="9" height="5.2" rx="1" fill={grip} />
          </>
        )}
        {type === 'dagger' && (
          <>
            <path d="M49 32 30 28.5 18 29.5 18 34.5 30 35.5 Z" fill={blade} stroke={glow} strokeWidth="1.6" />
            <line x1="20" y1="32" x2="45" y2="32" stroke={core} strokeWidth="1.2" />
            <rect x="15" y="27" width="3.6" height="10" rx="1" fill={guard} />
            <rect x="7" y="29.5" width="8" height="5" rx="1" fill={grip} />
          </>
        )}
        {type === 'axe' && (
          <>
            <path d={SHURIKEN_PATH} fill={blade} stroke={glow} strokeWidth="1.6" strokeLinejoin="miter" />
            <circle cx={SHURIKEN_CENTRE.cx} cy={SHURIKEN_CENTRE.cy} r={SHURIKEN_CENTRE.r} fill={guard} stroke={glow} strokeWidth="1" />
          </>
        )}
        {type === 'spear' && (
          <>
            <path d="M60 32 44 28 34 30.5 34 33.5 44 36 Z" fill={blade} stroke={glow} strokeWidth="1.5" />
            <line x1="36" y1="32" x2="56" y2="32" stroke={core} strokeWidth="1.2" />
            <circle cx="34" cy="32" r="3.5" fill={guard} />
            <rect x="4" y="30.2" width="30" height="3.6" rx="1" fill={grip} />
          </>
        )}
      </g>
    </svg>
  );
}

function MapPreview({ skin }: { skin: MapSkin }) {
  const { floorCenter, floorEdge, borderOuter, borderInner, enemyAccent } = skin;
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14" style={{ filter: `drop-shadow(0 0 7px ${borderOuter})` }}>
      <rect x="4" y="4" width="56" height="56" rx="8" fill={floorCenter} stroke={borderInner} strokeWidth="3" />
      <circle cx="32" cy="32" r="18" fill="none" stroke={borderOuter} strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="32" cy="32" r="8" fill={floorEdge} />
      <circle cx="22" cy="22" r="4" fill={enemyAccent} />
      <circle cx="42" cy="42" r="4" fill={borderOuter} />
    </svg>
  );
}

/* -------------------------------------------------------------------- HUD */

function ShieldIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2 4 5.5V11c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5.5L12 2z" />
    </svg>
  );
}

export function HudLayer({
  hud,
  coins,
  lang,
  armor,
  onPause,
  muted,
  onMute,
}: {
  hud: Hud;
  coins: number;
  lang: Lang;
  armor: number;
  onPause: () => void;
  muted: boolean;
  onMute: () => void;
}) {
  const t = STR[lang];
  const chargePct = hud.overcharge > 0 ? (hud.overcharge / 8) * 100 : hud.charge;
  const oc = hud.overcharge > 0;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none p-3 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        {/* score + hp */}
        <div className="min-w-0">
          <div className="flex items-end gap-2">
            <div className="tabnum text-3xl leading-none font-bold text-cyan-100 glow-cyan sm:text-5xl">
              {formatScore(hud.score)}
            </div>
            {hud.mult > 1 && (
              <div
                key={hud.mult}
                className="animate-pop rounded-md bg-amber-300/15 px-1.5 py-0.5 text-xs font-bold text-amber-300 glow-gold sm:text-sm"
              >
                ×{hud.mult}
              </div>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-0.5">
            {Array.from({ length: hud.maxHp }).map((_, i) => (
              <Heart key={i} full={i < hud.hp} />
            ))}
            {armor > 0 && (
              <span className="ms-1.5 inline-flex items-center gap-0.5 rounded-md bg-sky-300/15 px-1 py-0.5 text-[10px] font-bold text-sky-200">
                <ShieldIcon className="h-3 w-3" />
                {armor}
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-white/10 sm:w-44">
            <div
              className={`h-full rounded-full transition-[width] duration-100 ${
                oc ? 'bg-gradient-to-r from-amber-200 to-orange-400' : 'bg-gradient-to-r from-cyan-300 to-violet-400'
              }`}
              style={{ width: `${chargePct}%` }}
            />
          </div>
          <div className={`mt-0.5 text-[9px] font-bold tracking-[0.22em] ${oc ? 'text-amber-300' : 'text-cyan-200/50'}`}>
            {oc ? t.overcharged : t.stormCharge}
          </div>
          {/* LEXICON: word countdown + solved/failed tally */}
          {hud.mode === 'word' && (
            <div className="mt-2">
              {(() => {
                const left = hud.wordTime ?? 0;
                const max = hud.wordTimeMax || 1;
                const k = clamp(left / max, 0, 1);
                const low = left <= 4;
                return (
                  <>
                    <div className="flex items-center justify-between text-[9px] font-bold tracking-[0.16em] uppercase">
                      <span className={low ? 'text-rose-300' : 'text-emerald-300'}>
                        {t.timeLabel}
                        {(hud.wordsDone || 0) >= 10 && <span className="ms-1 text-rose-400">⚡{t.halvedTag}</span>}
                      </span>
                      <span className={`tabnum ${low ? 'text-rose-300' : 'text-emerald-300'}`}>{left.toFixed(1)}s</span>
                    </div>
                    <div className="mt-0.5 h-2 w-36 overflow-hidden rounded-full bg-white/10 sm:w-48">
                      <div
                        className={`h-full rounded-full transition-[width] duration-100 ${
                          low
                            ? 'bg-gradient-to-r from-rose-400 to-red-500'
                            : k < 0.5
                              ? 'bg-gradient-to-r from-amber-300 to-orange-400'
                              : 'bg-gradient-to-r from-emerald-300 to-green-400'
                        } ${low ? 'animate-pulse' : ''}`}
                        style={{ width: `${k * 100}%` }}
                      />
                    </div>
                  </>
                );
              })()}
              <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold tracking-[0.14em]">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/12 px-1.5 py-0.5 text-emerald-300">
                  ✓ <span className="tabnum">{hud.wordsDone || 0}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-400/12 px-1.5 py-0.5 text-rose-300">
                  ✕ <span className="tabnum">{hud.wordsFailed || 0}</span>
                </span>
              </div>
            </div>
          )}

          {/* Active Buffs Stack underneath HP & Charge */}
          <div className="mt-1.5 flex flex-col gap-1.5">
            {[
              { val: hud.might, max: 4, label: t.hud_might, from: 'from-orange-400', to: 'to-rose-500', textCol: 'text-orange-300' },
              { val: hud.tri, max: 5, label: t.hud_tri, from: 'from-cyan-400', to: 'to-sky-500', textCol: 'text-cyan-300' },
              { val: hud.freeze, max: 5, label: t.hud_freeze, from: 'from-sky-300', to: 'to-blue-400', textCol: 'text-sky-200' },
              { val: hud.score2x, max: 5, label: t.hud_score2x, from: 'from-amber-300', to: 'to-yellow-500', textCol: 'text-amber-300' },
              { val: hud.blinkFree, max: 5, label: t.hud_blink_free, from: 'from-teal-300', to: 'to-cyan-400', textCol: 'text-teal-200' },
              { val: hud.speedBoost, max: 5, label: t.hud_speed_boost, from: 'from-emerald-300', to: 'to-green-500', textCol: 'text-emerald-300' },
              { val: hud.slowMo, max: 5, label: t.hud_slow_mo, from: 'from-purple-400', to: 'to-violet-500', textCol: 'text-purple-300' },
              { val: hud.hyperSpeed, max: 5, label: t.hud_hyper_speed, from: 'from-red-400', to: 'to-rose-600', textCol: 'text-red-300' },
              { val: hud.ghostPass, max: 5, label: t.hud_ghost_pass, from: 'from-fuchsia-300', to: 'to-pink-500', textCol: 'text-fuchsia-300' },
              { val: hud.magnet, max: 6, label: t.hud_magnet, from: 'from-lime-300', to: 'to-green-400', textCol: 'text-lime-300' },
              { val: hud.shieldOrb, max: 6, label: t.hud_shield, from: 'from-cyan-300', to: 'to-indigo-400', textCol: 'text-cyan-200' },
            ].map(
              (b, idx) =>
                b.val > 0 && (
                  <div key={idx} className="w-36 sm:w-44">
                    <div className="flex items-center justify-between text-[9px] font-bold tracking-[0.16em] uppercase">
                      <span className={b.textCol}>{b.label}</span>
                      <span className={`tabnum opacity-85 ${b.textCol}`}>{b.val.toFixed(1)}s</span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${b.from} ${b.to} transition-[width] duration-100`}
                        style={{ width: `${clamp((b.val / b.max) * 100, 0, 100)}%` }}
                      />
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>

        {/* wallet, buttons, wave */}
        <div className="flex flex-col items-end gap-1.5">
          <span className="flex items-center gap-1.5">
            {(hud.gems || 0) > 0 && (
              <span
                key={hud.gems}
                className="animate-pop inline-flex items-center gap-1 rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs font-bold text-cyan-200"
              >
                <GemIcon className="h-3.5 w-3.5" />
                <span className="tabnum">{hud.gems}</span>
              </span>
            )}
            <Wallet coins={coins} />
          </span>
          <div className="flex items-center gap-2">
            <IconBtn onClick={onMute} label="sound">
              {muted ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5 6 9H3v6h3l5 4V5z" />
                  <path d="m17 9 4 6M21 9l-4 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5 6 9H3v6h3l5 4V5z" />
                  <path d="M16 8.5a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12" />
                </svg>
              )}
            </IconBtn>
            <IconBtn onClick={onPause} label="pause">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            </IconBtn>
          </div>
          <div className="text-right">
            {hud.mode === 'word' ? (
              <>
                <div
                  key={hud.phase}
                  className="animate-slide text-xl font-bold tracking-[0.14em] text-emerald-200 sm:text-2xl"
                >
                  {t.phaseLabel} {hud.phase || 1}
                </div>
                <div className="tabnum text-[10px] tracking-[0.2em] text-emerald-200/50">
                  {hud.wordsDone || 0} {t.wordsLabel}
                </div>
              </>
            ) : (
              <>
                <div
                  key={hud.wave}
                  className="animate-slide text-xl font-bold tracking-[0.14em] text-violet-200 sm:text-2xl"
                >
                  {t.waveLabel} {hud.wave}
                </div>
                <div className="tabnum text-[10px] tracking-[0.2em] text-cyan-200/45">
                  {hud.kills} {t.slain}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* kill-streak combo meter */}
      {(hud.streak || 0) > 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-40 flex justify-center sm:top-44">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 w-6 rounded-full transition-all duration-150 ${
                    i < (hud.streak || 0) ? 'bg-amber-300 shadow-[0_0_10px_rgba(255,209,102,0.8)]' : 'bg-white/12'
                  }`}
                />
              ))}
            </div>
            <div className="mt-1 text-[10px] font-bold tracking-[0.22em] text-amber-300/80">
              {(hud.streak || 0)}/5 · {((hud.streakT || 0)).toFixed(1)}s
            </div>
          </div>
        </div>
      )}

      {/* combo tally */}
      {(hud.combos || 0) > 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-56 flex justify-center sm:top-60">
          <div key={hud.combos} className="animate-pop text-2xl font-bold text-amber-300 glow-gold sm:text-3xl">
            {t.comboWord} ×{hud.combos}
          </div>
        </div>
      )}

      {/* combo */}
      {hud.combo > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center sm:top-28">
          <div key={hud.combo} className="animate-pop text-center">
            <div className="text-2xl font-bold text-amber-300 glow-gold sm:text-3xl">
              {hud.combo} {t.chain}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- screens */

/** Device the run was played on — PC or Android. */
function PlatformIcon({ p }: { p?: 'pc' | 'android' }) {
  const android = p === 'android';
  return (
    <span title={android ? 'Android' : 'PC'} className="inline-flex items-center">
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        style={{ color: android ? '#6dffb0' : '#79f2ff' }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
      >
        {android ? (
          <>
            {/* android robot head */}
            <path d="M5 11a7 7 0 0 1 14 0" />
            <path d="M5 11v6.2a1.4 1.4 0 0 0 1.4 1.4h11.2A1.4 1.4 0 0 0 19 17.2V11" />
            <path d="m7.4 5.4-1.1-1.7M16.6 5.4l1.1-1.7" />
            <circle cx="9.4" cy="8.6" r=".9" fill="currentColor" stroke="none" />
            <circle cx="14.6" cy="8.6" r=".9" fill="currentColor" stroke="none" />
          </>
        ) : (
          <>
            <rect x="2.5" y="4" width="19" height="12.5" rx="1.6" />
            <path d="M8.5 20h7M12 16.5V20" />
          </>
        )}
      </svg>
    </span>
  );
}

/** Tiny blade badge showing which weapon a run was finished with. */
export function BladeBadge({ id }: { id?: string }) {
  if (!id) return <span className="inline-block h-6 w-6" />;
  const rush = RUSH_BLADES.find((b) => b.id === id);
  const shop = SWORD_SKINS.find((s) => s.id === id);
  const src = rush ?? shop;
  if (!src) return <span className="inline-block h-6 w-6" />;
  const { glow, blade, guard, grip, type, name } = src;
  return (
    <span title={name} className="inline-flex items-center">
      <svg viewBox="0 0 64 64" className="h-6 w-6" style={{ filter: `drop-shadow(0 0 4px ${glow})` }}>
        <g transform="rotate(-45 32 32)">
          {type === 'katana' && (
            <path d="M58 32 Q36 25.5 15 29 L15 33.5 Q36 35.5 58 32 Z" fill={blade} stroke={glow} strokeWidth="2.5" />
          )}
          {type === 'great' && <path d="M55 25.5 55 38.5 16 41 16 23 Z" fill={blade} stroke={glow} strokeWidth="2.5" />}
          {type === 'saber' && (
            <path d="M57 30.5 Q34 22 15 27.5 L15 33 Q34 34.5 57 30.5 Z" fill={blade} stroke={glow} strokeWidth="2.5" />
          )}
          {type === 'dagger' && (
            <path d="M49 32 30 28.5 18 29.5 18 34.5 30 35.5 Z" fill={blade} stroke={glow} strokeWidth="2.5" />
          )}
        {type === 'axe' && (
          <>
            <path d={SHURIKEN_PATH} fill={blade} stroke={glow} strokeWidth="1.6" strokeLinejoin="miter" />
            <circle cx={SHURIKEN_CENTRE.cx} cy={SHURIKEN_CENTRE.cy} r={SHURIKEN_CENTRE.r} fill={guard} stroke={glow} strokeWidth="1" />
          </>
        )}
        {type === 'spear' && <path d="M60 32 44 28 34 30.5 34 33.5 44 36 Z" fill={blade} stroke={glow} strokeWidth="2.5" />}
          {type === 'long' && (
            <path d="M56 32 38 26.8 16 28.4 16 35.6 38 37.2 Z" fill={blade} stroke={glow} strokeWidth="2.5" />
          )}
          <rect x="12" y="25" width="4" height="14" rx="1" fill={guard} />
          <rect x="4" y="29.5" width="9" height="5" rx="1" fill={grip} />
        </g>
      </svg>
    </span>
  );
}

export function ScoreTable({
  scores,
  highlight,
  noLegends,
  showBlade,
  wordMode,
  lang,
}: {
  scores: HighScore[];
  highlight?: number;
  noLegends: string;
  showBlade?: boolean;
  wordMode?: boolean;
  lang?: Lang;
}) {
  const tt = STR[lang || 'en'];
  if (!scores.length) {
    return (
      <div className="rounded-xl border border-cyan-300/15 bg-black/30 px-4 py-5 text-center text-xs tracking-[0.18em] text-cyan-200/40">
        {noLegends}
      </div>
    );
  }
  return (
    <div className="scrollthin max-h-52 overflow-y-auto rounded-xl border border-cyan-300/15 bg-black/30">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead>
          <tr className="text-[9px] tracking-[0.2em] text-cyan-200/40">
            <th className="px-3 py-2 font-semibold">#</th>
            <th className="px-2 py-2 font-semibold">NAME</th>
            {showBlade && <th className="px-1 py-2 text-center font-semibold">BLADE</th>}
            {wordMode && <th className="px-1 py-2 text-center font-semibold text-emerald-300/60">✓</th>}
            {wordMode && <th className="px-1 py-2 text-center font-semibold text-rose-300/60">✕</th>}
            <th className="px-2 py-2 text-right font-semibold">{tt.finalScore}</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr
              key={i}
              className={`border-t border-white/5 ${
                highlight === i ? 'bg-amber-300/10 text-amber-200' : i === 0 ? 'text-cyan-100' : 'text-cyan-200/70'
              }`}
            >
              <td className="px-3 py-1.5 font-bold opacity-60">{i + 1}</td>
              <td className="max-w-[110px] px-2 py-1.5">
                <span className="flex items-center gap-1.5">
                  <PlatformIcon p={s.platform} />
                  <span className="truncate font-semibold">{s.name}</span>
                </span>
              </td>
              {showBlade && (
                <td className="px-1 py-1">
                  <span className="flex justify-center">
                    <BladeBadge id={s.blade} />
                  </span>
                </td>
              )}
              {wordMode && (
                <td className="tabnum px-1 py-1.5 text-center font-bold text-emerald-300">{s.wave ?? 0}</td>
              )}
              {wordMode && (
                <td className="tabnum px-1 py-1.5 text-center font-bold text-rose-300">{s.kills ?? 0}</td>
              )}
              <td className="tabnum px-2 py-1.5 text-right font-bold">{formatScore(s.score)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyCap({ children }: { children: ReactNode }) {
  return (
    <span className="mx-0.5 inline-block min-w-[22px] rounded-md border border-cyan-300/30 bg-cyan-300/10 px-1.5 py-0.5 text-center text-[10px] font-bold text-cyan-100">
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
      <span className="text-[10px] tracking-[0.18em] text-violet-200/70">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

export function StartScreen({
  onStart,
  onArmory,
  mode,
  onMode,
  scores,
  isTouch,
  coins,
  gems,
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
  mode: 'battle' | 'race' | 'rush' | 'word';
  onMode: (m: 'battle' | 'race' | 'rush' | 'word') => void;
  scores: HighScore[];
  isTouch: boolean;
  coins: number;
  gems: number;
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
  return (
    <div
      className="overlay-scroll absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-gradient-to-b from-[#05060f]/85 via-[#070b1e]/80 to-[#05060f]/92 p-4"
      data-uiblock
    >
      <div className="pointer-events-none fixed inset-x-0 top-3 z-10 flex justify-end px-3">
        <LangBtn lang={lang} onLang={onLang} />
      </div>
      <div className="animate-pop w-full max-w-md pb-2">
        <div className="mb-5 text-center">
          <div className="text-[9px] font-semibold tracking-[0.5em] text-violet-200/60">{t.presents}</div>
          <div className="animate-floaty mt-2 mb-2 flex justify-center">
            <Bolt className="h-14 w-14 text-cyan-300 drop-shadow-[0_0_18px_rgba(121,242,255,0.9)]" />
          </div>
          <h1 className="animate-flicker text-5xl leading-none font-bold tracking-[0.1em] text-cyan-100 glow-cyan sm:text-6xl">
            STORM<span className="text-violet-300">BLADE</span>
          </h1>
          <p className="mt-2 text-[11px] tracking-[0.24em] text-cyan-200/55 sm:text-xs">{t.tagline}</p>
        </div>

        <div className="panel rounded-2xl p-4 sm:p-5">
          {/* mode selector tab */}
          <div className="mb-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {(
              [
                ['battle', t.modeBattle, 'cyan'],
                ['race', t.modeRace, 'violet'],
                ['rush', t.modeRush, 'amber'],
                ['word', t.modeWord, 'green'],
              ] as const
            ).map(([m, label, tone]) => {
              const on = mode === m;
              const cls = on
                ? tone === 'cyan'
                  ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100 shadow-[0_0_16px_rgba(121,242,255,0.25)]'
                  : tone === 'violet'
                    ? 'border-violet-300/60 bg-violet-300/15 text-violet-100 shadow-[0_0_16px_rgba(169,123,255,0.25)]'
                    : tone === 'amber'
                      ? 'border-amber-300/60 bg-amber-300/15 text-amber-100 shadow-[0_0_16px_rgba(255,209,102,0.25)]'
                      : 'border-emerald-300/60 bg-emerald-300/15 text-emerald-100 shadow-[0_0_16px_rgba(109,255,176,0.25)]'
                : 'border-white/10 bg-white/[0.03] text-cyan-200/40';
              return (
                <button
                  key={m}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onMode(m);
                  }}
                  className={`rounded-xl border px-1 py-2.5 text-[10px] leading-tight font-bold tracking-[0.1em] uppercase transition ${cls}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* account */}
          {account ? (
            <div className="mb-2.5 flex items-center justify-between gap-3 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-2">
              <div className="min-w-0">
                <div className="text-[9px] tracking-[0.2em] text-emerald-300/70">{t.authSignedAs}</div>
                <div className="truncate text-sm font-bold text-emerald-200">{account}</div>
              </div>
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onLogout();
                }}
                className="shrink-0 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.16em] text-rose-300 uppercase"
              >
                {t.authLogout}
              </button>
            </div>
          ) : (
            <button
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onAuth();
              }}
              className="animate-ring mb-2.5 flex w-full items-center justify-between gap-3 rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2.5 text-left"
            >
              <div>
                <div className="text-[11px] font-bold tracking-[0.14em] text-amber-300 uppercase">{t.authSignIn}</div>
                <div className="text-[9px] tracking-[0.14em] text-amber-200/55">{t.boardGuestNote}</div>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          )}

          {/* callsign + wallet */}
          {!account && (
            <div className="mb-2.5 flex items-center justify-between gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
              <span className="text-[10px] tracking-[0.18em] text-violet-200/70">{t.callsign}</span>
              {nameLocked ? (
                <span className="max-w-[160px] truncate text-xs font-bold text-cyan-100">{name}</span>
              ) : (
                <input
                  value={name}
                  maxLength={14}
                  onChange={(e) => onName(e.target.value.replace(/[<>]/g, ''))}
                  placeholder="Wanderer"
                  className="w-36 rounded-md border border-cyan-300/25 bg-black/40 px-2 py-1 text-right text-xs font-bold text-cyan-100 outline-none placeholder:text-cyan-200/25 focus:border-cyan-300/60"
                />
              )}
            </div>
          )}
          <div className="mb-3 flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
            <span className="text-[10px] tracking-[0.18em] text-violet-200/70">{t.purse}</span>
            <span className="flex items-center gap-1.5">
              <Wallet coins={coins} />
              <GemPurse gems={gems} />
            </span>
          </div>

          <div className="grid gap-2 text-[11px] text-cyan-100/80 sm:text-xs">
            {isTouch ? (
              <>
                <Row label={t.move} value={t.moveTouch} />
                <Row label={t.throwBlinkLabel} value={t.throwBlinkTouch} />
                <Row label={t.slashLabel} value={t.slashTouch} />
              </>
            ) : (
              <>
                <Row
                  label={t.move}
                  value={
                    <>
                      <KeyCap>W</KeyCap>
                      <KeyCap>A</KeyCap>
                      <KeyCap>S</KeyCap>
                      <KeyCap>D</KeyCap> {t.moveKeysTail}
                    </>
                  }
                />
                <Row
                  label={t.throwBlinkLabel}
                  value={
                    <>
                      <KeyCap>SPACE</KeyCap> / <KeyCap>LMB</KeyCap>
                    </>
                  }
                />
                <Row
                  label={t.slashLabel}
                  value={
                    <>
                      <KeyCap>J</KeyCap> / <KeyCap>RMB</KeyCap>
                    </>
                  }
                />
                <Row
                  label={t.pauseLabel}
                  value={
                    <>
                      <KeyCap>ESC</KeyCap>
                    </>
                  }
                />
              </>
            )}
          </div>

          <div className="my-4 h-px bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />

          <p className="text-center text-[11px] leading-relaxed text-cyan-200/60">
            {mode === 'word'
              ? t.wordStrategy
              : mode === 'rush'
                ? t.rushStrategy
                : mode === 'race'
                  ? t.raceStrategy
                  : t.strategy}
          </p>

          <div className="mt-5 grid grid-cols-[1fr_auto] gap-2.5">
            <Btn onClick={onStart} className="animate-ring w-full py-4 text-base">
              <span className="inline-flex items-center justify-center gap-2">
                <Bolt className="h-4 w-4" />
                {t.enter}
              </span>
            </Btn>
            <Btn onClick={onArmory} variant="ghost" className="px-5">
              {t.armoryBtn}
            </Btn>
          </div>
          <div className="mt-2.5">
            <Btn
              onClick={onDaily}
              variant="ghost"
              className={`w-full !border-cyan-300/40 !bg-cyan-300/10 !text-cyan-200 ${
                dailyReady > 0 ? 'animate-ring' : ''
              }`}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <GemIcon className="h-4 w-4" />
                {t.dailyBtn}
                {dailyReady > 0 && (
                  <span className="ms-1 rounded-full bg-amber-300 px-1.5 text-[10px] font-black text-black">
                    {dailyReady}
                  </span>
                )}
              </span>
            </Btn>
          </div>
          {!isTouch && (
            <div className="mt-2 text-center text-[10px] tracking-[0.2em] text-cyan-200/35">{t.pressSpace}</div>
          )}
        </div>

        <div className="mt-4">
          <div className="mb-2 text-center text-[10px] tracking-[0.28em] text-violet-200/50">
            {t.hall} ·{' '}
            {mode === 'word' ? t.modeWord : mode === 'rush' ? t.modeRush : mode === 'race' ? t.modeRace : t.modeBattle}
          </div>
          <ScoreTable
            scores={scores.slice(0, 5)}
            noLegends={t.noLegends}
            showBlade={mode !== 'word'}
            wordMode={mode === 'word'}
            lang={lang}
          />
        </div>

        <PublisherMark publisherWord={t.publisher} className="mt-6" />
      </div>
    </div>
  );
}

export function PauseScreen({
  onResume,
  onRestart,
  onQuit,
  muted,
  onMute,
  lang,
  onLang,
}: {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  muted: boolean;
  onMute: () => void;
  lang: Lang;
  onLang: () => void;
}) {
  const t = STR[lang];
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#05060f]/75 p-4 backdrop-blur-sm">
      <div className="panel animate-pop w-full max-w-xs rounded-2xl p-6 text-center">
        <h2 className="text-3xl font-bold tracking-[0.2em] text-cyan-100 glow-cyan">{t.paused}</h2>
        <p className="mt-1 text-[10px] tracking-[0.24em] text-cyan-200/40">{t.stormWaits}</p>
        <div className="mt-6 grid gap-2.5">
          <Btn onClick={onResume} className="w-full">
            {t.resume}
          </Btn>
          <Btn onClick={onRestart} variant="ghost" className="w-full">
            {t.restart}
          </Btn>
          <Btn onClick={onMute} variant="ghost" className="w-full">
            {t.sound}: {muted ? t.soundOff : t.soundOn}
          </Btn>
          <Btn onClick={onLang} variant="ghost" className="w-full">
            <span className="inline-flex items-center justify-center gap-2">
              <GlobeIcon className="h-4 w-4" />
              {lang === 'en' ? 'فارسی' : 'English'}
            </span>
          </Btn>
          <Btn onClick={onQuit} variant="ghost" className="w-full">
            {t.mainMenu}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function GameOverScreen({
  score,
  wave,
  kills,
  bestCombo,
  rank,
  scores,
  coinsEarned,
  coinsTotal,
  onRestart,
  onQuit,
  onRevive,
  reviveCost,
  canRevive,
  playerCoins,
  isTouch,
  lang,
  mode,
  sector,
  dodged,
}: {
  score: number;
  wave: number;
  kills: number;
  bestCombo: number;
  rank: number;
  scores: HighScore[];
  coinsEarned: number;
  coinsTotal: number;
  onRestart: () => void;
  onRevive?: () => void;
  reviveCost?: number;
  canRevive?: boolean;
  playerCoins?: number;
  onQuit: () => void;
  isTouch: boolean;
  lang: Lang;
  mode?: 'battle' | 'race' | 'rush' | 'word';
  sector?: number;
  dodged?: number;
}) {
  const t = STR[lang];
  return (
    <div className="overlay-scroll absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-gradient-to-b from-[#12030a]/80 via-[#05060f]/88 to-[#05060f]/95 p-4">
      <div className="animate-pop w-full max-w-sm pb-2">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-[0.16em] text-rose-300 glow-red sm:text-5xl">{t.youFell}</h2>
          {rank === 0 && (
            <div className="mt-2 inline-block rounded-full bg-amber-300/15 px-3 py-1 text-[10px] font-bold tracking-[0.24em] text-amber-300 glow-gold">
              {t.newRecord}
            </div>
          )}
        </div>

        <div className="panel mt-4 rounded-2xl p-5">
          <div className="text-center">
            <div className="text-[10px] tracking-[0.28em] text-cyan-200/45">{t.finalScore}</div>
            <div className="tabnum text-5xl font-bold text-cyan-100 glow-cyan">{formatScore(score)}</div>
            <div className="mt-2 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-300 glow-gold">
                <CoinIcon className="h-3.5 w-3.5" />+{formatScore(coinsEarned)} {t.earnedWord}
              </span>
            </div>
            <div className="mt-1.5 text-[10px] tracking-[0.2em] text-cyan-200/40">
              {t.wallet} · {formatScore(coinsTotal)}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {mode === 'word' ? (
              <>
                <Stat label={t.phaseLabel} value={sector || 1} />
                <Stat label={t.wordsLabel} value={dodged || 0} />
                <Stat label={t.statChain} value={bestCombo} />
              </>
            ) : mode === 'rush' ? (
              <>
                <Stat label={t.raceSectorLabel} value={sector || 1} />
                <Stat label={t.rushBrokenLabel} value={dodged || 0} />
                <Stat label={t.statChain} value={bestCombo} />
              </>
            ) : mode === 'race' ? (
              <>
                <Stat label={t.raceSectorLabel} value={sector || 1} />
                <Stat label={t.raceObstaclesLabel} value={dodged || 0} />
                <Stat label={t.statChain} value={bestCombo} />
              </>
            ) : (
              <>
                <Stat label={t.statWave} value={wave} />
                <Stat label={t.statKills} value={kills} />
                <Stat label={t.statChain} value={bestCombo} />
              </>
            )}
          </div>
          {/* Revive option — once per run, costs 1/4 of earned coins */}
          {canRevive && onRevive && (reviveCost ?? 0) > 0 && (playerCoins ?? 0) >= (reviveCost ?? 0) && (
            <div className="mt-4">
              <button
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRevive();
                }}
                className="w-full rounded-xl border-2 border-emerald-400/60 bg-emerald-400/15 py-3 text-sm font-bold tracking-[0.12em] text-emerald-300 uppercase transition active:scale-[0.97]"
              >
                <span className="flex items-center justify-center gap-2">
                  ❤️ {t.reviveBtn}
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-300/15 px-2 py-0.5 text-xs text-amber-300">
                    <CoinIcon className="h-3 w-3" />
                    {formatScore(reviveCost ?? 0)}
                  </span>
                </span>
              </button>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Btn onClick={onRestart} className="w-full">
              {t.retry}
            </Btn>
            <Btn onClick={onQuit} variant="ghost" className="w-full">
              {t.menuBtn}
            </Btn>
          </div>
          {!isTouch && (
            <div className="mt-2 text-center text-[10px] tracking-[0.2em] text-cyan-200/35">{t.retryHint}</div>
          )}
        </div>

        <div className="mt-4">
          <div className="mb-2 text-center text-[10px] tracking-[0.28em] text-violet-200/50">
            {t.hall} · {mode === 'rush' ? t.modeRush : mode === 'race' ? t.modeRace : t.modeBattle}
          </div>
          <ScoreTable
            scores={scores}
            highlight={rank >= 0 ? rank : undefined}
            noLegends={t.noLegends}
            showBlade={mode !== 'word'}
            wordMode={mode === 'word'}
            lang={lang}
          />
        </div>

        <PublisherMark publisherWord={t.publisher} className="mt-6" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] py-2">
      <div className="tabnum text-lg font-bold text-violet-200">{value}</div>
      <div className="text-[9px] tracking-[0.16em] text-cyan-200/40">{label}</div>
    </div>
  );
}

/* ----------------------------------------------------------------- armory */

function SkinCard({
  name,
  tag,
  cost,
  owned,
  equipped,
  coins,
  preview,
  onAction,
  equipBtn,
  equippedWord,
  desc,
  gemCost,
  gems,
  altGemCost,
  onAltAction,
}: {
  name: string;
  tag: string;
  cost: number;
  owned: boolean;
  equipped: boolean;
  coins: number;
  preview: ReactNode;
  onAction: () => void;
  equipBtn: string;
  equippedWord: string;
  desc?: string;
  gemCost?: number;
  gems?: number;
  /** gem price for items that ALSO accept coins */
  altGemCost?: number;
  onAltAction?: () => void;
}) {
  const gc = gemCost ?? 0;
  const altGem = altGemCost ?? 0;
  const affordable = gc > 0 ? (gems || 0) >= gc : coins >= cost || (gems || 0) >= altGem;
  return (
    <div
      className={`rounded-xl border p-3 text-center transition ${
        equipped
          ? 'border-amber-300/60 bg-amber-300/[0.07]'
          : owned
            ? 'border-cyan-300/30 bg-cyan-300/[0.04]'
            : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      <div className="flex h-16 items-center justify-center">{preview}</div>
      <div className="mt-1 truncate text-xs font-bold text-cyan-50">{name}</div>
      <div className="text-[8px] tracking-[0.22em] text-cyan-200/40">{tag}</div>
      {desc && <div className="mt-0.5 text-[9px] leading-tight font-semibold text-amber-200/75">{desc}</div>}
      <div className="mt-2">
        {equipped ? (
          <div className="rounded-lg bg-amber-300/15 py-1.5 text-[10px] font-bold tracking-[0.18em] text-amber-300">
            {equippedWord}
          </div>
        ) : owned ? (
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onAction();
            }}
            className="btn-ghost w-full rounded-lg py-1.5 text-[10px] font-bold tracking-[0.18em]"
          >
            {equipBtn}
          </button>
        ) : (
          gc > 0 ? (
            // gem-exclusive item
            <button
              onPointerDown={(e) => {
                if (!affordable) return;
                e.stopPropagation();
                e.preventDefault();
                onAction();
              }}
              disabled={!affordable}
              className={`w-full rounded-lg py-1.5 text-[10px] font-bold tracking-[0.16em] transition ${
                affordable
                  ? 'border border-cyan-300/60 bg-cyan-300/20 text-cyan-100'
                  : 'cursor-not-allowed border border-white/10 bg-white/5 text-cyan-200/30'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <GemIcon className="h-3 w-3" />
                {formatScore(gc)}
              </span>
            </button>
          ) : (
            // buy with EITHER coins or gems
            <div className="grid grid-cols-2 gap-1">
              <button
                onPointerDown={(e) => {
                  if (coins < cost) return;
                  e.stopPropagation();
                  e.preventDefault();
                  onAction();
                }}
                disabled={coins < cost}
                className={`rounded-lg py-1.5 text-[9px] font-bold tracking-[0.1em] transition ${
                  coins >= cost ? 'btn-primary' : 'cursor-not-allowed border border-white/10 bg-white/5 text-cyan-200/30'
                }`}
              >
                <span className="inline-flex items-center gap-0.5">
                  <CoinIcon className="h-3 w-3" />
                  {formatScore(cost)}
                </span>
              </button>
              <button
                onPointerDown={(e) => {
                  if ((gems || 0) < altGem) return;
                  e.stopPropagation();
                  e.preventDefault();
                  onAltAction?.();
                }}
                disabled={(gems || 0) < altGem}
                className={`rounded-lg py-1.5 text-[9px] font-bold tracking-[0.1em] transition ${
                  (gems || 0) >= altGem
                    ? 'border border-cyan-300/60 bg-cyan-300/20 text-cyan-100'
                    : 'cursor-not-allowed border border-white/10 bg-white/5 text-cyan-200/30'
                }`}
              >
                <span className="inline-flex items-center gap-0.5">
                  <GemIcon className="h-3 w-3" />
                  {formatScore(altGem)}
                </span>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export function ArmoryScreen({
  profile,
  onClose,
  onBuy,
  onEquip,
  lang,
}: {
  profile: Profile;
  onClose: () => void;
  onBuy: (kind: 'hero' | 'sword' | 'map', id: string, withGems?: boolean) => void;
  onEquip: (kind: 'hero' | 'sword' | 'map', id: string) => void;
  lang: Lang;
}) {
  const t = STR[lang];
  const [tab, setTab] = useState<'hero' | 'sword' | 'map'>('sword');
  return (
    <div className="absolute inset-0 z-30 overflow-hidden bg-[#05060f]/95 backdrop-blur-sm" data-uiblock>
      <div className="overlay-scroll h-full overflow-y-auto p-4">
        <div className="animate-pop mx-auto w-full max-w-md pb-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-[0.18em] text-cyan-100 glow-cyan">{t.armoryTitle}</h2>
              <p className="text-[9px] tracking-[0.3em] text-cyan-200/40">{t.armorySub}</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <Wallet coins={profile.coins} />
              <GemPurse gems={profile.gems || 0} />
              <IconBtn onClick={onClose} label="close">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </IconBtn>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {(
              [
                ['sword', t.tabBlades],
                ['hero', t.tabHero],
                ['map', t.tabArenas],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setTab(k);
                }}
                className={`rounded-xl border py-2.5 text-xs font-bold tracking-[0.2em] uppercase transition ${
                  tab === k
                    ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100'
                    : 'border-white/10 bg-white/[0.03] text-cyan-200/45'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'sword' ? (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {SWORD_SKINS.map((s: SwordSkin) => (
                <SkinCard
                  key={s.id}
                  name={s.name}
                  tag={bladeLabel(t, s.type)}
                  cost={coinCostOf(s.id)}
                  owned={profile.ownedSwords.includes(s.id)}
                  equipped={profile.sword === s.id}
                  coins={profile.coins}
                  preview={<BladePreview skin={s} />}
                  onAction={() => (profile.ownedSwords.includes(s.id) ? onEquip('sword', s.id) : onBuy('sword', s.id))}
                  equipBtn={t.equipBtn}
                  equippedWord={t.equipped}
                  desc={t[s.powerKey as keyof Strings]}
                  gemCost={gemPriceOf(s.id)}
                  gems={profile.gems || 0}
                  altGemCost={altGemCostOf(s.id)}
                  onAltAction={() => onBuy('sword', s.id, true)}
                />
              ))}
            </div>
          ) : tab === 'hero' ? (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {HERO_SKINS.map((s: HeroSkin) => (
                <SkinCard
                  key={s.id}
                  name={s.name}
                  tag={t.heroTag}
                  cost={coinCostOf(s.id)}
                  owned={profile.ownedHeroes.includes(s.id)}
                  equipped={profile.hero === s.id}
                  coins={profile.coins}
                  preview={<HeroPreview skin={s} />}
                  onAction={() => (profile.ownedHeroes.includes(s.id) ? onEquip('hero', s.id) : onBuy('hero', s.id))}
                  equipBtn={t.equipBtn}
                  equippedWord={t.equipped}
                  desc={[
                    s.armor > 0 ? `${t.armorWord} +${s.armor}` : '',
                    s.extraHp > 0 ? `+${s.extraHp} HP` : '',
                    s.speedMult !== 1.0 ? `${s.speedMult > 1 ? '+' : ''}${Math.round((s.speedMult - 1) * 100)}% SPD` : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  gemCost={gemPriceOf(s.id)}
                  gems={profile.gems || 0}
                  altGemCost={altGemCostOf(s.id)}
                  onAltAction={() => onBuy('hero', s.id, true)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              {MAP_SKINS.map((m: MapSkin) => (
                <SkinCard
                  key={m.id}
                  name={m.name}
                  tag={m.tag}
                  cost={m.cost}
                  owned={profile.ownedMaps.includes(m.id)}
                  equipped={profile.map === m.id}
                  coins={profile.coins}
                  preview={<MapPreview skin={m} />}
                  onAction={() => (profile.ownedMaps.includes(m.id) ? onEquip('map', m.id) : onBuy('map', m.id))}
                  equipBtn={t.equipBtn}
                  equippedWord={t.equipped}
                />
              ))}
            </div>
          )}

          <p className="mt-4 text-center text-[10px] leading-relaxed tracking-[0.08em] text-cyan-200/40">
            {t.armoryNote}
          </p>
          <PublisherMark publisherWord={t.publisher} className="mt-6" />
        </div>
      </div>
    </div>
  );
}

export function DailyScreen({
  state,
  onClose,
  onClaim,
  lang,
  gems,
}: {
  state: DailyState;
  onClose: () => void;
  onClaim: (id: ChallengeId) => void;
  lang: Lang;
  gems: number;
}) {
  const t = STR[lang];
  const dict = t as unknown as Record<string, string>;
  // time until local midnight
  const now = new Date();
  const mid = new Date(now);
  mid.setHours(24, 0, 0, 0);
  const ms = mid.getTime() - now.getTime();
  const hrs = Math.floor(ms / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  const allDone = state.picks.every((id) => state.claimed[id]);

  return (
    <div
      className="overlay-scroll absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#05060f]/95 p-4 backdrop-blur-sm"
      data-uiblock
    >
      <div className="panel animate-pop w-full max-w-md rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-[0.14em] text-cyan-100 glow-cyan">{t.dailyTitle}</h2>
            <p className="mt-0.5 text-[9px] tracking-[0.24em] text-cyan-200/45">{t.dailySub}</p>
            <p className="mt-1 text-[10px] font-semibold text-amber-200/70">
              {t.dailyResets.replace('{n}', `${hrs}h ${mins}m`)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <GemPurse gems={gems} />
            <IconBtn onClick={onClose} label="close">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </IconBtn>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          {state.picks.map((id) => {
            const c = challengeById(id);
            const prog = Math.min(state.progress[id] ?? 0, c.target);
            const done = prog >= c.target;
            const claimed = !!state.claimed[id];
            const k = clamp(prog / c.target, 0, 1);
            return (
              <div
                key={id}
                className={`rounded-xl border p-3 transition ${
                  claimed
                    ? 'border-white/10 bg-white/[0.02] opacity-60'
                    : done
                      ? 'border-emerald-400/50 bg-emerald-400/[0.07]'
                      : 'border-cyan-300/20 bg-cyan-300/[0.03]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] leading-snug font-bold text-cyan-50">{dict[c.key] || c.key}</div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full transition-[width] duration-300 ${
                          done ? 'bg-gradient-to-r from-emerald-300 to-green-400' : 'bg-gradient-to-r from-cyan-300 to-violet-400'
                        }`}
                        style={{ width: `${k * 100}%` }}
                      />
                    </div>
                    <div className="tabnum mt-0.5 text-[9px] text-cyan-200/50">
                      {formatScore(prog)} / {formatScore(c.target)}
                    </div>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-cyan-200">
                      <GemIcon className="h-3.5 w-3.5" />
                      {c.gems}
                    </div>
                    <div className="mt-1.5">
                      {claimed ? (
                        <div className="rounded-lg bg-white/5 px-2 py-1 text-[9px] font-bold tracking-[0.14em] text-cyan-200/40">
                          {t.dailyClaimed}
                        </div>
                      ) : done ? (
                        <button
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onClaim(id);
                          }}
                          className="btn-primary rounded-lg px-3 py-1 text-[10px] font-bold tracking-[0.14em]"
                        >
                          {t.dailyClaim}
                        </button>
                      ) : (
                        <div className="rounded-lg border border-white/10 px-2 py-1 text-[9px] font-bold tracking-[0.14em] text-cyan-200/30">
                          {Math.round(k * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {allDone && (
          <p className="mt-4 text-center text-[11px] font-bold tracking-[0.14em] text-emerald-300">{t.dailyAllDone}</p>
        )}

        <div className="mt-5">
          <Btn onClick={onClose} className="w-full">
            {t.apkClose}
          </Btn>
        </div>
        <PublisherMark publisherWord={t.publisher} className="mt-6" />
      </div>
    </div>
  );
}

export function AuthScreen({
  onClose,
  onLogin,
  onRegister,
  lang,
  online,
}: {
  onClose: () => void;
  onLogin: (u: string, p: string) => Promise<string | null>;
  onRegister: (u: string, p: string) => Promise<string | null>;
  lang: Lang;
  online?: boolean;
}) {
  const t = STR[lang];
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    const code = tab === 'login' ? await onLogin(user, pass) : await onRegister(user, pass);
    setBusy(false);
    if (code) setErr((t as unknown as Record<string, string>)[`err_${code}`] || code);
  };

  return (
    <div
      className="overlay-scroll absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#05060f]/95 p-4 backdrop-blur-sm"
      data-uiblock
    >
      <div className="panel animate-pop w-full max-w-sm rounded-2xl p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-[0.16em] text-cyan-100 glow-cyan">{t.authTitle}</h2>
            <p className="mt-0.5 text-[9px] tracking-[0.24em] text-cyan-200/45">{t.authSub}</p>
          </div>
          <IconBtn onClick={onClose} label="close">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </IconBtn>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {(
            [
              ['login', t.authLogin],
              ['register', t.authRegister],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onPointerDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setTab(k);
                setErr(null);
              }}
              className={`rounded-xl border py-2.5 text-xs font-bold tracking-[0.16em] uppercase transition ${
                tab === k
                  ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100'
                  : 'border-white/10 bg-white/[0.03] text-cyan-200/45'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1 text-[10px] tracking-[0.2em] text-violet-200/70">{t.authUser}</div>
            <input
              value={user}
              maxLength={14}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              // strip anything that isn't an English letter/number/_/- as you type
              onChange={(e) => setUser(e.target.value.replace(/[^A-Za-z0-9_-]/g, ''))}
              placeholder={t.authUserPh}
              className="w-full rounded-lg border border-cyan-300/25 bg-black/45 px-3 py-2 text-sm font-bold tracking-wide text-cyan-100 outline-none placeholder:font-normal placeholder:text-cyan-200/25 focus:border-cyan-300/60"
            />
          </div>
          <div>
            <div className="mb-1 text-[10px] tracking-[0.2em] text-violet-200/70">{t.authPass}</div>
            <input
              value={pass}
              type="password"
              maxLength={32}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit();
              }}
              placeholder={t.authPassPh}
              className="w-full rounded-lg border border-cyan-300/25 bg-black/45 px-3 py-2 text-sm font-bold tracking-wide text-cyan-100 outline-none placeholder:font-normal placeholder:text-cyan-200/25 focus:border-cyan-300/60"
            />
          </div>
          <p className="text-[9px] leading-relaxed tracking-[0.06em] text-cyan-200/40">{t.authRule}</p>
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold ${
              online
                ? 'border-emerald-400/30 bg-emerald-400/[0.07] text-emerald-300'
                : 'border-amber-400/30 bg-amber-400/[0.07] text-amber-300'
            }`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${online ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {online ? t.authOnline : t.authOffline}
          </div>
          {err && (
            <div className="animate-pop rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[11px] font-semibold text-rose-300">
              {err}
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-2.5">
          <Btn onClick={() => void submit()} className="w-full">
            {tab === 'login' ? t.authSubmitLogin : t.authSubmitRegister}
          </Btn>
          <Btn onClick={onClose} variant="ghost" className="w-full">
            {t.authGuest}
          </Btn>
        </div>

        <PublisherMark publisherWord={t.publisher} className="mt-6" />
      </div>
    </div>
  );
}

export function ApkGuideScreen({ onClose, lang }: { onClose: () => void; lang: Lang }) {
  const t = STR[lang];
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-[#05060f]/95 p-4 backdrop-blur-sm" data-uiblock>
      <div className="panel animate-pop w-full max-w-md rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-[0.14em] text-emerald-300 glow-cyan">{t.apkTitle}</h2>
            <p className="text-[9px] tracking-[0.26em] text-cyan-200/50">{t.apkSub}</p>
          </div>
          <IconBtn onClick={onClose} label="close">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </IconBtn>
        </div>

        <div className="mt-4 space-y-3 text-left text-xs text-cyan-100/90">
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] p-3">
            <div className="font-bold text-emerald-300">{t.apkStep1Title}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-cyan-100/75">{t.apkStep1Desc}</p>
          </div>

          <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.04] p-3">
            <div className="font-bold text-cyan-300">{t.apkStep2Title}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-cyan-100/75">{t.apkStep2Desc}</p>
          </div>

          <div className="rounded-xl border border-violet-400/25 bg-violet-400/[0.04] p-3">
            <div className="font-bold text-violet-300">{t.apkStep3Title}</div>
            <p className="mt-1 text-[11px] leading-relaxed text-cyan-100/75">{t.apkStep3Desc}</p>
          </div>
        </div>

        <div className="mt-5">
          <Btn onClick={onClose} className="w-full">
            {t.apkClose}
          </Btn>
        </div>
      </div>
    </div>
  );
}
