import { sfx } from './audio';
import { clamp, dist, lerp, rand, randInt, segDist, smooth, TAU } from './core';
import { coinsForScore } from './meta';
import { STR, type Lang } from './i18n';
import { alphabetFor, wordPool, type WordLen } from './words';
import { DEFAULT_POWER, MAP_SKINS, RUSH_BLADES, rushBladeById, type MapSkin, type RushBlade, type SwordPower } from './skins';
import { tgHaptic } from './telegram';
import type { Input } from './input';

export type OrbKind =
  | 'might'
  | 'zap'
  | 'surge'
  | 'tri'
  | 'freeze'
  | 'score2x'
  | 'blink_free'
  | 'speed_boost'
  | 'slow_mo'
  | 'hyper_speed'
  | 'ghost_pass'
  | 'magnet'
  | 'shield_orb';
export interface Orb {
  kind: OrbKind;
  x: number;
  y: number;
  t: number;
  life: number;
}

export type GameState = 'menu' | 'playing' | 'paused' | 'over';
export type EnemyKind =
  | 'snapper'
  | 'hound'
  | 'wisp'
  | 'brute'
  | 'phantom'
  | 'goliath'
  | 'weaver'
  | 'apex'
  | 'boss_warden'
  | 'boss_gargoyle'
  | 'boss_serpent'
  | 'boss_colossus'
  | 'boss_sovereign';

export const isBoss = (k: EnemyKind) =>
  k === 'boss_warden' || k === 'boss_gargoyle' || k === 'boss_serpent' || k === 'boss_colossus' || k === 'boss_sovereign';

export interface Enemy {
  id: number;
  kind: EnemyKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hp: number;
  maxHp: number;
  speed: number;
  dmg: number;
  score: number;
  state: 'spawn' | 'chase' | 'wind' | 'dash' | 'rest';
  t: number;
  cd: number;
  hitFlash: number;
  angle: number;
  wob: number;
  aimX: number;
  aimY: number;
  lastHitId: number;
  contactCd: number;
  squash: number;
  legPhase: number;
  poisonT?: number; // damage over time
  poisonDmg?: number;
  burnT?: number;
  burnDmg?: number;
  chillT?: number; // frost slow
  frozenT?: number; // held completely still by a frost blade
  tickT?: number;
  /** Boss rage phase: stands still, fires patterns, lasts 7s. */
  rage?: boolean;
  rageT?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  drag: number;
  grav: number;
  kind: 0 | 1 | 2; // 0 spark(line) 1 mote(glow) 2 shard(tri)
  rot: number;
  vr: number;
}

export interface Ring {
  x: number;
  y: number;
  r: number;
  maxR: number;
  life: number;
  max: number;
  color: string;
  width: number;
}

export interface Bolt {
  pts: number[];
  life: number;
  max: number;
  color: string;
  width: number;
}

export interface FloatText {
  x: number;
  y: number;
  vy: number;
  life: number;
  max: number;
  text: string;
  color: string;
  size: number;
}

export interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  t: number;
}

export interface Pickup {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  t: number;
}

export interface Proj {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  t: number;
}

export interface SpawnMark {
  x: number;
  y: number;
  t: number;
  dur: number;
  kind: EnemyKind;
}

export interface SideSword {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  travelled: number;
  maxDist: number;
  hits: Set<number>;
  trail: { x: number; y: number; a: number }[];
}

export type ObstacleKind = 'wall_gap' | 'laser_gate' | 'spike_block' | 'crusher_row';
export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  x: number;
  y: number;
  w: number;
  h: number;
  gapX: number;
  gapW: number;
  gateOpen?: boolean;
  gateT?: number;
  gatePeriod?: number;
  passed: boolean;
  hp?: number;
  maxHp?: number;
  flash?: number;
  dead?: boolean;
}

/** A rare gem pickup — premium currency, spawns in every mode. */
export interface Gem {
  x: number;
  y: number;
  t: number;
  life: number;
}

/** Burning lava left behind when a magma blade blinks. */
export interface LavaPool {
  x: number;
  y: number;
  r: number;
  life: number;
  max: number;
  tick: number;
  color: string;
}

/** A floating letter you teleport onto in Lexicon mode. */
export interface LetterPickup {
  id: number;
  ch: string;
  x: number;
  y: number;
  t: number;
  wanted: boolean; // part of the target word (decoys are false)
  taken: boolean;
  /** Imposter: looks like a needed letter but costs HP and burns the clock. */
  imposter?: boolean;
}

/** A blade lying in the lane in Blade Rush — grab it to swap weapons. */
export interface BladeDrop {
  id: string;
  x: number;
  y: number;
  t: number;
}

export interface Hud {
  mode: 'battle' | 'race' | 'rush' | 'word';
  phase?: number;
  target?: string;
  typed?: string;
  wordsDone?: number;
  wordsFailed?: number;
  wordTime?: number;
  wordTimeMax?: number;
  gems?: number;
  streak?: number;
  streakT?: number;
  combos?: number;
  score: number;
  wave: number;
  hp: number;
  maxHp: number;
  combo: number;
  mult: number;
  kills: number;
  charge: number;
  overcharge: number;
  might: number;
  tri: number;
  freeze: number;
  score2x: number;
  blinkFree: number;
  speedBoost: number;
  slowMo: number;
  hyperSpeed: number;
  ghostPass: number;
  magnet: number;
  shieldOrb: number;
  swordOut: boolean;
  sector?: number;
  dodged?: number;
}

const DEFS: Record<EnemyKind, { r: number; hp: number; speed: number; score: number; dmg: number }> = {
  snapper: { r: 17, hp: 3, speed: 138, score: 100, dmg: 1 },
  hound: { r: 21, hp: 6, speed: 104, score: 180, dmg: 1 },
  wisp: { r: 16, hp: 4, speed: 108, score: 210, dmg: 1 },
  brute: { r: 34, hp: 24, speed: 66, score: 520, dmg: 2 },
  phantom: { r: 18, hp: 8, speed: 152, score: 340, dmg: 2 },
  goliath: { r: 38, hp: 48, speed: 55, score: 850, dmg: 3 },
  weaver: { r: 20, hp: 14, speed: 96, score: 480, dmg: 2 },
  apex: { r: 32, hp: 85, speed: 112, score: 1400, dmg: 4 },
  // Boss base HP is LOW — it gets multiplied by the player's sword damage
  // so every fight takes ~25-35 hits regardless of weapon tier.
  boss_warden: { r: 44, hp: 45, speed: 82, score: 5000, dmg: 3 },
  boss_gargoyle: { r: 48, hp: 55, speed: 96, score: 12000, dmg: 4 },
  boss_serpent: { r: 52, hp: 65, speed: 110, score: 25000, dmg: 5 },
  boss_colossus: { r: 58, hp: 80, speed: 72, score: 50000, dmg: 6 },
  boss_sovereign: { r: 64, hp: 100, speed: 120, score: 100000, dmg: 7 },
};

const MAX_PARTICLES = 480;

export class Game {
  W = 1000;
  H = 700;
  state: GameState = 'menu';
  time = 0;

  // player
  px = 500;
  py = 350;
  pvx = 0;
  pvy = 0;
  pr = 18;
  facing = -Math.PI / 2;
  aimX = 0;
  aimY = -1;
  hp = 5;
  maxHp = 5;
  iframes = 0;
  slashT = 0;
  slashDir = 0;
  slashCd = 0;
  slashHits = new Set<number>();
  blinkCd = 0;
  blinkCdMax = 1.0;
  dustColor = '#5b7bff';
  lang: Lang = 'en';

  // pickups & gear
  orbs: Orb[] = [];
  orbCd = 3.5;
  mightT = 0;
  triT = 0;
  freezeT = 0;
  score2xT = 0;
  blinkFreeT = 0;
  speedBoostT = 0;
  slowMoT = 0;
  hyperSpeedT = 0;
  ghostPassT = 0;
  magnetT = 0;
  shieldOrbT = 0;
  sideSwords: SideSword[] = [];
  armor = 0;
  extraHp = 0;
  speedMult = 1.0;
  swordPower: SwordPower = DEFAULT_POWER;
  mapSkin: MapSkin = MAP_SKINS[0];
  mode: 'battle' | 'race' | 'rush' | 'word' = 'battle';
  obstacles: Obstacle[] = [];
  obstacleCd = 1.5;
  raceSpeed = 260;
  scrollOffset = 0;
  sector = 1;
  obstaclesDodged = 0;
  onMapChange?: (ms: MapSkin) => void;

  // --- Blade Rush
  rushBlade: RushBlade = RUSH_BLADES[0];
  bladeDrops: BladeDrop[] = [];
  lavaPools: LavaPool[] = [];
  bladeDropCd = 6;

  // --- Lexicon (wordplay) mode
  wordPhase = 1;
  wordTarget = '';
  wordTyped = '';
  wordsDone = 0;
  wordsInPhase = 0;
  letters: LetterPickup[] = [];
  usedWords = new Set<string>();
  eraser = { x: 0, y: 0, r: 34, t: 0, flash: 0 };
  wordBanner = 0;
  wordBannerText = '';
  wordBannerColor = '#79f2ff';
  wordTimer = 0;
  wordsFailed = 0;

  // --- gems (premium currency) + kill-combo streaks
  gems: Gem[] = [];
  gemCd = 14;
  gemsCollected = 0;
  streak = 0; // kills inside the streak window
  streakT = 0;
  combosHit = 0; // how many 5-kill combos this run
  bossKills = 0;
  onCombo?: (level: number) => void;
  obstaclesBroken = 0;
  onBladeChange?: (b: RushBlade) => void;

  /** true for both scrolling modes (race + rush) */
  get scrolling() {
    return this.mode === 'race' || this.mode === 'rush';
  }

  private t() {
    return STR[this.lang];
  }

  /** All outgoing damage, scaled by blade power and the MIGHT buff (fractional, so small bonuses stack across hits). */
  private dmg(n: number) {
    return Math.max(1, n * this.swordPower.dmg * (this.mightT > 0 ? 1.5 : 1));
  }
  legPhase = 0;
  blinkGhosts: { x: number; y: number; life: number; a: number }[] = [];
  hurtFlash = 0;

  // sword
  sw: {
    state: 'held' | 'flying' | 'stuck' | 'returning';
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    spin: number;
    travelled: number;
    maxDist: number;
    id: number;
    stuckT: number;
    trail: { x: number; y: number; a: number }[];
    hits: Set<number>;
  } = {
    state: 'held',
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    spin: 0,
    travelled: 0,
    maxDist: 380,
    id: 0,
    stuckT: 0,
    trail: [],
    hits: new Set(),
  };

  enemies: Enemy[] = [];
  projs: Proj[] = [];
  particles: Particle[] = [];
  rings: Ring[] = [];
  bolts: Bolt[] = [];
  texts: FloatText[] = [];
  shards: Shard[] = [];
  pickups: Pickup[] = [];
  marks: SpawnMark[] = [];

  // meta
  score = 0;
  kills = 0;
  wave = 0;
  combo = 0;
  comboTimer = 0;
  charge = 0;
  overcharge = 0;
  bestCombo = 0;

  // wave flow
  queue: EnemyKind[] = [];
  spawnCd = 0;
  waveBanner = 0;
  waveBannerText = '';
  intermission = 0;

  // fx
  trauma = 0;
  shakeX = 0;
  shakeY = 0;
  hitStop = 0;
  timeScale = 1;
  flash = 0;
  flashColor = '#9ff';
  vignettePulse = 0;

  // tutorial
  hintT = 0;
  hintStage = 0;

  private nextId = 1;
  private hudTimer = 0;
  onHud?: (h: Hud) => void;
  onGameOver?: (score: number, wave: number, kills: number) => void;

  resize(w: number, h: number) {
    const oldW = this.W;
    const oldH = this.H;
    this.W = w;
    this.H = h;
    if (this.state === 'menu') {
      this.px = w / 2;
      this.py = h / 2;
    } else if (oldW > 0 && oldH > 0) {
      const sx = w / oldW;
      const sy = h / oldH;
      this.px *= sx;
      this.py *= sy;
      for (const e of this.enemies) {
        e.x *= sx;
        e.y *= sy;
      }
      this.sw.x *= sx;
      this.sw.y *= sy;
    }
    this.sw.maxDist = this.baseReach() * (this.mode === 'rush' ? this.rushBlade.reach : this.swordPower.reach ?? 1);
  }

  /** Base throw distance before the blade's reach multiplier. */
  baseReach() {
    return clamp(Math.min(this.W, this.H) * 0.62, 260, 520);
  }

  reset() {
    this.px = this.W / 2;
    this.py = this.H / 2;
    this.pvx = this.pvy = 0;
    this.maxHp = 5 + this.extraHp;
    this.hp = this.maxHp;
    this.iframes = 0;
    this.slashT = this.slashCd = 0;
    this.blinkCd = 0;
    this.orbs.length = 0;
    this.orbCd = 3.5;
    this.mightT = 0;
    this.triT = 0;
    this.freezeT = 0;
    this.score2xT = 0;
    this.blinkFreeT = 0;
    this.speedBoostT = 0;
    this.slowMoT = 0;
    this.hyperSpeedT = 0;
    this.ghostPassT = 0;
    this.magnetT = 0;
    this.shieldOrbT = 0;
    this.sideSwords.length = 0;
    this.facing = -Math.PI / 2;
    this.aimX = 0;
    this.aimY = -1;
    this.sw.state = 'held';
    this.sw.trail.length = 0;
    this.sw.hits.clear();
    this.enemies.length = 0;
    this.projs.length = 0;
    this.particles.length = 0;
    this.rings.length = 0;
    this.bolts.length = 0;
    this.texts.length = 0;
    this.shards.length = 0;
    this.pickups.length = 0;
    this.marks.length = 0;
    this.blinkGhosts.length = 0;
    this.queue.length = 0;
    this.score = 0;
    this.kills = 0;
    this.wave = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.comboTimer = 0;
    this.charge = 0;
    this.overcharge = 0;
    this.trauma = 0;
    this.hitStop = 0;
    this.timeScale = 1;
    this.flash = 0;
    this.hurtFlash = 0;
    this.intermission = 0.4;
    this.waveBanner = 0;
    this.hintT = 0;
    this.hintStage = 0;
    this.obstacles.length = 0;
    this.obstacleCd = 1.5;
    this.raceSpeed = 260;
    this.scrollOffset = 0;
    this.sector = 1;
    this.obstaclesDodged = 0;
    this.obstaclesBroken = 0;
    this.gems.length = 0;
    this.gemCd = rand(28, 14);
    this.gemsCollected = 0;
    this.streak = 0;
    this.streakT = 0;
    this.combosHit = 0;
    this.bossKills = 0;
    this.canRevive = true;
    this.bladeDrops.length = 0;
    this.lavaPools.length = 0;
    this.bladeDropCd = 6;
    if (this.mode === 'word') {
      // Lexicon: pure puzzle — no gear, no orbs, no damage
      this.swordPower = DEFAULT_POWER;
      this.armor = 0;
      this.speedMult = 1.0;
      this.maxHp = 5;
      this.hp = 5;
      this.charge = 0;
      this.overcharge = 0;
      this.wordPhase = 1;
      this.wordsDone = 0;
      this.wordsInPhase = 0;
      this.wordTarget = '';
      this.wordTyped = '';
      this.wordTimer = 0;
      this.wordsFailed = 0;
      this.letters.length = 0;
      this.usedWords.clear();
      this.eraser.x = this.W / 2;
      this.eraser.y = this.H - 110;
      this.eraser.flash = 0;
      this.startWordPhase();
    }
    if (this.mode === 'rush') {
      // Blade Rush: no Overcharge, no purchased gear — everyone starts on the Stormblade
      this.swordPower = DEFAULT_POWER;
      this.armor = 0;
      this.extraHp = 0;
      this.speedMult = 1.0;
      this.maxHp = 5;
      this.hp = 5;
      this.charge = 0;
      this.overcharge = 0;
      this.rushBlade = RUSH_BLADES[0];
      this.onBladeChange?.(this.rushBlade);
      this.mapSkin = MAP_SKINS[0];
      this.onMapChange?.(this.mapSkin);
    }
    if (this.mode === 'race') {
      this.swordPower = DEFAULT_POWER;
      this.armor = 0;
      this.extraHp = 0;
      this.speedMult = 1.0;
      this.maxHp = 5;
      this.hp = 5;
      this.mapSkin = MAP_SKINS[0];
      this.onMapChange?.(this.mapSkin);
    }
    // apply the equipped blade's reach for this run
    this.sw.maxDist = this.baseReach() * (this.mode === 'rush' ? this.rushBlade.reach : this.swordPower.reach ?? 1);
    this.state = 'playing';
    this.emitHud();
  }

  emitHud() {
    this.onHud?.({
      mode: this.mode,
      score: Math.floor(this.score),
      wave: Math.max(1, this.wave),
      hp: this.hp,
      maxHp: this.maxHp,
      combo: this.combo,
      mult: this.mult(),
      kills: this.kills,
      charge: this.charge,
      overcharge: this.overcharge,
      might: this.mightT,
      tri: this.triT,
      freeze: this.freezeT,
      score2x: this.score2xT,
      blinkFree: this.blinkFreeT,
      speedBoost: this.speedBoostT,
      slowMo: this.slowMoT,
      hyperSpeed: this.hyperSpeedT,
      ghostPass: this.ghostPassT,
      magnet: this.magnetT,
      shieldOrb: this.shieldOrbT,
      swordOut: this.sw.state !== 'held',
      sector: this.sector,
      dodged: this.obstaclesDodged,
      phase: this.wordPhase,
      target: this.wordTarget,
      typed: this.wordTyped,
      wordsDone: this.wordsDone,
      wordsFailed: this.wordsFailed,
      wordTime: Math.max(0, this.wordLimit() - this.wordTimer),
      wordTimeMax: this.wordLimit(),
      gems: this.gemsCollected,
      streak: this.streak,
      streakT: this.streakT,
      combos: this.combosHit,
    });
  }

  mult() {
    return clamp(1 + Math.floor(this.combo / 4), 1, 12);
  }

  shake(a: number) {
    this.trauma = Math.min(1, this.trauma + a);
  }

  // ---------------------------------------------------------------- particles
  spark(x: number, y: number, n: number, color: string, speed = 260, size = 2.4, spread = TAU, dir = 0) {
    for (let i = 0; i < n; i++) {
      if (this.particles.length >= MAX_PARTICLES) return;
      const a = dir + (Math.random() - 0.5) * spread;
      const s = speed * (0.35 + Math.random() * 0.9);
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.25 + Math.random() * 0.4,
        max: 0.65,
        size: size * (0.6 + Math.random() * 0.8),
        color,
        drag: 3.2,
        grav: 0,
        kind: 0,
        rot: a,
        vr: 0,
      });
    }
  }

  motes(x: number, y: number, n: number, color: string, speed = 90, size = 6) {
    for (let i = 0; i < n; i++) {
      if (this.particles.length >= MAX_PARTICLES) return;
      const a = Math.random() * TAU;
      const s = speed * Math.random();
      this.particles.push({
        x: x + Math.cos(a) * 6,
        y: y + Math.sin(a) * 6,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s - 20,
        life: 0.5 + Math.random() * 0.6,
        max: 1.1,
        size: size * (0.5 + Math.random()),
        color,
        drag: 1.6,
        grav: -18,
        kind: 1,
        rot: 0,
        vr: 0,
      });
    }
  }

  chunks(x: number, y: number, n: number, color: string, speed = 260) {
    for (let i = 0; i < n; i++) {
      if (this.particles.length >= MAX_PARTICLES) return;
      const a = Math.random() * TAU;
      const s = speed * (0.3 + Math.random());
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.5 + Math.random() * 0.5,
        max: 1,
        size: 3 + Math.random() * 5,
        color,
        drag: 2.4,
        grav: 0,
        kind: 2,
        rot: Math.random() * TAU,
        vr: rand(9, -9),
      });
    }
  }

  ring(x: number, y: number, maxR: number, color: string, life = 0.4, width = 4) {
    this.rings.push({ x, y, r: 0, maxR, life, max: life, color, width });
  }

  bolt(x1: number, y1: number, x2: number, y2: number, color = '#bff6ff', width = 3, jitter = 22, life = 0.18) {
    const segs = clamp(Math.floor(dist(x1, y1, x2, y2) / 26) + 2, 3, 16);
    const pts: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const j = i === 0 || i === segs ? 0 : (Math.random() - 0.5) * jitter;
      const nx = -(y2 - y1);
      const ny = x2 - x1;
      const l = Math.hypot(nx, ny) || 1;
      pts.push(lerp(x1, x2, t) + (nx / l) * j, lerp(y1, y2, t) + (ny / l) * j);
    }
    this.bolts.push({ pts, life, max: life, color, width });
  }

  text(x: number, y: number, t: string, color: string, size = 16) {
    if (this.texts.length > 26) this.texts.shift();
    this.texts.push({ x, y, vy: -46, life: 0.75, max: 0.75, text: t, color, size });
  }

  // ---------------------------------------------------------------- waves
  buildWave(n: number) {
    // Boss every 5 waves. 10 bosses cycle: waves 5-50, then repeat with scaling.
    if (n % 5 === 0) {
      const bossList: EnemyKind[] = [
        'boss_warden',    // wave 5, 55, 105...
        'boss_gargoyle',  // wave 10, 60, 110...
        'boss_warden',    // wave 15
        'boss_serpent',   // wave 20
        'boss_gargoyle',  // wave 25
        'boss_colossus',  // wave 30
        'boss_serpent',   // wave 35
        'boss_sovereign', // wave 40
        'boss_colossus',  // wave 45
        'boss_sovereign', // wave 50
      ];
      const idx = (Math.floor(n / 5) - 1) % bossList.length;
      return [bossList[idx]];
    }
    let budget = 4 + n * 3.4 + Math.pow(n, 1.25) * 1.5;
    const pool: { k: EnemyKind; c: number }[] = [{ k: 'snapper', c: 1 }];
    if (n >= 2) pool.push({ k: 'hound', c: 2 });
    if (n >= 3) pool.push({ k: 'wisp', c: 2 });
    if (n >= 4) pool.push({ k: 'phantom', c: 4 });
    if (n >= 5) pool.push({ k: 'brute', c: 6 });
    if (n >= 6) pool.push({ k: 'goliath', c: 10 });
    if (n >= 8) pool.push({ k: 'weaver', c: 7 });
    if (n >= 10) pool.push({ k: 'apex', c: 20 });
    const out: EnemyKind[] = [];
    let guard = 0;
    while (budget > 0 && guard++ < 350) {
      const opts = pool.filter((p) => p.c <= budget);
      if (!opts.length) break;
      const p = opts[randInt(0, opts.length - 1)];
      out.push(p.k);
      budget -= p.c;
    }
    // shuffle
    for (let i = out.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  startWave() {
    this.wave++;
    this.queue = this.buildWave(this.wave);
    this.spawnCd = 0.15;
    const isBossWave = this.wave % 10 === 0;
    if (isBossWave) {
      this.waveBannerText = `${this.t().bossAlert} — ${this.t().waveLabel} ${this.wave}`;
      this.waveBanner = 3.2;
      sfx.overcharge();
      this.shake(0.5);
      this.flash = 0.4;
      this.flashColor = '#ff4d6d';
    } else {
      this.waveBannerText = `${this.t().waveLabel} ${this.wave}`;
      this.waveBanner = 2;
      sfx.wave();
    }
    if (this.wave > 1 && this.wave % 3 === 1 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + 1);
      this.text(this.px, this.py - 34, this.t().plusHp, '#7dffb2', 18);
      sfx.heal();
    }
    this.emitHud();
  }

  queueSpawn(kind: EnemyKind) {
    const m = 46;
    let x = 0;
    let y = 0;
    const side = randInt(0, 3);
    if (side === 0) {
      x = rand(this.W - m, m);
      y = m;
    } else if (side === 1) {
      x = this.W - m;
      y = rand(this.H - m, m);
    } else if (side === 2) {
      x = rand(this.W - m, m);
      y = this.H - m;
    } else {
      x = m;
      y = rand(this.H - m, m);
    }
    // keep away from the player
    if (dist(x, y, this.px, this.py) < 200) {
      x = this.W - x;
      y = this.H - y;
    }
    this.marks.push({ x, y, t: 0, dur: 0.7, kind });
  }

  spawnEnemy(kind: EnemyKind, x: number, y: number) {
    const d = DEFS[kind];
    const boss = isBoss(kind);
    // Boss HP = baseHp × swordDmg × cycleBonus.
    // baseHp is tuned so a 1x sword needs ~25-35 hits (each hit does ~2-3 dmg).
    // A 5x sword means boss gets 5× HP but you also hit 5× harder → same fight length.
    // Cycle adds +40% per full 50-wave loop so repeat bosses stay challenging.
    const cycle = boss ? Math.max(0, Math.floor((this.wave - 1) / 50)) : 0;
    const scale = boss
      ? this.swordPower.dmg * (1 + cycle * 0.4)
      : 1 + (this.wave - 1) * 0.1 + Math.pow(this.wave - 1, 1.1) * 0.03;
    const extraDmg = Math.floor((this.wave - 1) / 10);
    const e: Enemy = {
      id: this.nextId++,
      kind,
      x,
      y,
      vx: 0,
      vy: 0,
      r: d.r,
      hp: Math.round(d.hp * scale),
      maxHp: Math.round(d.hp * scale),
      speed: d.speed * clamp(1 + (this.wave - 1) * 0.02, 1, 1.65),
      dmg: d.dmg + extraDmg,
      score: d.score,
      state: 'spawn',
      t: 0,
      cd: rand(1.4, 0.4),
      hitFlash: 0,
      angle: Math.atan2(this.py - y, this.px - x),
      wob: Math.random() * TAU,
      aimX: 0,
      aimY: 0,
      lastHitId: -1,
      contactCd: 0,
      squash: 0,
      legPhase: Math.random() * TAU,
    };
    this.enemies.push(e);
    this.ring(x, y, d.r * (boss ? 5.5 : 3.4), this.mapSkin.ringColor, boss ? 0.6 : 0.4, boss ? 6 : 3);
    this.motes(x, y, boss ? 20 : 8, this.mapSkin.sparkColor, 90, 7);
    if (boss) {
      this.shake(0.65);
      sfx.overcharge();
    }
  }

  // ---------------------------------------------------------------- combat
  hurtEnemy(e: Enemy, dmg: number, fromX: number, fromY: number, kb: number, big = false) {
    if (e.hp <= 0) return;
    e.hp -= dmg;
    e.hitFlash = 1;
    e.squash = 0.55;
    const a = Math.atan2(e.y - fromY, e.x - fromX);
    e.vx += Math.cos(a) * kb;
    e.vy += Math.sin(a) * kb;
    this.spark(e.x, e.y, big ? 12 : 6, '#bff6ff', big ? 340 : 240, 2.6);
    this.spark(e.x, e.y, 4, '#ff9ec4', 200, 2);
    this.applyElement(e, dmg);
    if (e.hp <= 0) this.killEnemy(e);
    else {
      sfx.hit();
      this.shake(big ? 0.16 : 0.07);
      this.hitStop = Math.max(this.hitStop, big ? 0.035 : 0.018);
    }
  }

  killEnemy(e: Enemy) {
    e.hp = 0;
    this.kills++;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.comboTimer = 2.6;
    this.bumpStreak();
    const m = this.mult() * (this.score2xT > 0 ? 2 : 1);
    const gained = e.score * m;
    this.score += gained;
    this.text(e.x, e.y - e.r, `${gained}`, m > 1 ? '#ffd166' : '#bff6ff', m > 3 ? 22 : 16);
    const isBossEnemy = isBoss(e.kind);
    const isHeavy = e.kind === 'brute' || e.kind === 'goliath' || e.kind === 'apex' || isBossEnemy;
    sfx.kill();
    tgHaptic(isHeavy ? 'rigid' : 'light');
    this.shake(isBossEnemy ? 1.0 : e.kind === 'apex' ? 0.75 : isHeavy ? 0.55 : 0.22);
    this.hitStop = Math.max(this.hitStop, isBossEnemy ? 0.18 : e.kind === 'apex' ? 0.12 : isHeavy ? 0.09 : 0.04);
    this.ring(e.x, e.y, e.r * 4.5, this.mapSkin.ringColor, 0.42, 4);
    this.ring(e.x, e.y, e.r * 2.4, '#ffffff', 0.22, 2);
    this.chunks(e.x, e.y, isBossEnemy ? 28 : isHeavy ? 18 : 9, this.mapSkin.chunkColor, 300);
    this.motes(e.x, e.y, isBossEnemy ? 24 : isHeavy ? 16 : 8, this.mapSkin.sparkColor, 130, 8);
    this.spark(e.x, e.y, isBossEnemy ? 35 : isHeavy ? 20 : 10, this.mapSkin.ringColor, 340, 3);
    const nShards = isBossEnemy ? 25 : e.kind === 'apex' ? 12 : e.kind === 'goliath' ? 9 : e.kind === 'brute' ? 7 : e.kind === 'snapper' ? 2 : 3;
    for (let i = 0; i < nShards; i++) {
      const a = Math.random() * TAU;
      this.shards.push({ x: e.x, y: e.y, vx: Math.cos(a) * rand(220, 60), vy: Math.sin(a) * rand(220, 60), life: 9, t: 0 });
    }
    const dropChance = isBossEnemy ? 1.0 : e.kind === 'apex' ? 0.8 : e.kind === 'goliath' ? 0.65 : e.kind === 'brute' ? 0.55 : 0.045;
    if (this.hp < this.maxHp && Math.random() < dropChance) {
      this.pickups.push({ x: e.x, y: e.y, vx: rand(60, -60), vy: rand(60, -60), life: 12, t: 0 });
    }
    if (isBossEnemy) {
      this.bossKills++;
      this.text(e.x, e.y - 48, this.t().bossDefeated.replace('{n}', `${gained}`), '#ffd166', 28);
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        if (!isBoss(this.enemies[i].kind) && this.enemies[i].id !== e.id) {
          this.enemies.splice(i, 1);
        }
      }
    }
    this.emitHud();
  }

  hurtPlayer(dmg: number, fromX: number, fromY: number) {
    if (this.iframes > 0 || this.state !== 'playing') return;
    // GHOST FORM: phase straight through everything
    if (this.ghostPassT > 0) return;
    // CHRONO SHIELD: absorbs the hit and shatters
    if (this.shieldOrbT > 0) {
      this.shieldOrbT = 0;
      this.iframes = Math.max(this.iframes, 0.9);
      this.ring(this.px, this.py, 150, '#7af5ff', 0.5, 6);
      this.ring(this.px, this.py, 80, '#ffffff', 0.35, 3);
      this.spark(this.px, this.py, 26, '#d6fbff', 380, 3.2);
      this.flash = 0.35;
      this.flashColor = '#7af5ff';
      this.shake(0.4);
      sfx.catchSword();
      tgHaptic('rigid');
      this.emitHud();
      return;
    }
    // Royal blades: invulnerable while Overcharged
    if (this.overcharge > 0 && this.swordPower.ocShield) {
      this.spark(this.px, this.py, 10, '#ffd166', 280, 2.6);
      this.ring(this.px, this.py, 62, '#ffd166', 0.3, 3);
      this.iframes = Math.max(this.iframes, 0.25);
      sfx.catchSword();
      return;
    }
    // hero armor absorbs part of the blow
    dmg = Math.max(1, dmg - this.armor);
    this.hp -= dmg;
    this.iframes = 0.9;
    this.hurtFlash = 1;
    const a = Math.atan2(this.py - fromY, this.px - fromX);
    this.pvx += Math.cos(a) * 420;
    this.pvy += Math.sin(a) * 420;
    this.combo = 0;
    this.comboTimer = 0;
    this.shake(0.7);
    this.hitStop = Math.max(this.hitStop, 0.1);
    this.flash = 0.5;
    this.flashColor = '#ff4d6d';
    this.spark(this.px, this.py, 18, '#ff4d6d', 320, 3);
    this.ring(this.px, this.py, 90, '#ff4d6d', 0.4, 5);
    sfx.hurt();
    tgHaptic('heavy');
    this.emitHud();
    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  /** How many coins a revive costs (1/4 of coins earned this run). */
  reviveCost() {
    return Math.floor(coinsForScore(this.score) / 4);
  }

  /** Whether the player can afford to revive. */
  canRevive = true; // only one revive per run

  die() {
    this.state = 'over';
    this.timeScale = 0.25;
    this.shake(1);
    this.flash = 0.7;
    this.flashColor = '#ff4d6d';
    this.chunks(this.px, this.py, 26, '#9ff', 380);
    this.spark(this.px, this.py, 40, '#bff6ff', 460, 3.4);
    this.ring(this.px, this.py, 260, '#79f2ff', 0.9, 6);
    sfx.gameOver();
    tgHaptic('error');
    this.emitHud();
    // the game-over callback is delayed so the revive prompt can intercept
    this.onGameOver?.(Math.floor(this.score), this.wave, this.kills);
  }

  /** Revive the player: costs coins, restores 2 HP, clears nearby threats. */
  revive() {
    if (!this.canRevive) return false;
    this.canRevive = false;
    this.hp = 2;
    this.iframes = 2.0;
    this.state = 'playing';
    this.timeScale = 1;
    // clear all projectiles so you don't die instantly
    this.projs.length = 0;
    // push nearby enemies away
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      const d = dist(e.x, e.y, this.px, this.py) || 1;
      if (d < 260) {
        const a = Math.atan2(e.y - this.py, e.x - this.px);
        e.vx = Math.cos(a) * 440;
        e.vy = Math.sin(a) * 440;
      }
    }
    this.ring(this.px, this.py, 300, '#7dffb2', 0.7, 7);
    this.ring(this.px, this.py, 150, '#ffffff', 0.4, 4);
    this.spark(this.px, this.py, 40, '#bfffe0', 420, 3.2);
    this.flash = 0.5;
    this.flashColor = '#7dffb2';
    this.shake(0.6);
    sfx.overcharge();
    tgHaptic('success');
    this.emitHud();
    return true;
  }

  // ---------------------------------------------------------------- actions
  throwSword() {
    const s = this.sw;
    if (s.state !== 'held') return;
    s.state = 'flying';
    s.id++;
    s.hits.clear();
    s.trail.length = 0;
    s.x = this.px + this.aimX * 20;
    s.y = this.py + this.aimY * 20;
    // long blades are heavier through the air, short ones are darts
    const reachNow = this.mode === 'rush' ? this.rushBlade.reach : this.swordPower.reach ?? 1;
    const speed =
      this.mode === 'rush' ? 1150 * this.rushBlade.throwSpeed : 1150 * (1.25 - Math.min(0.5, reachNow * 0.28));
    s.vx = this.aimX * speed;
    s.vy = this.aimY * speed;
    s.angle = Math.atan2(this.aimY, this.aimX);
    s.travelled = 0;
    this.pvx -= this.aimX * 90;
    this.pvy -= this.aimY * 90;
    this.shake(0.14);
    this.spark(s.x, s.y, 10, '#bff6ff', 300, 2.6, 1.4, s.angle);
    if (this.triT > 0) {
      const sideSpeed = 1150;
      for (const offset of [-0.3, 0.3]) {
        const ang = s.angle + offset;
        const vx = Math.cos(ang) * sideSpeed;
        const vy = Math.sin(ang) * sideSpeed;
        this.sideSwords.push({
          x: s.x,
          y: s.y,
          vx,
          vy,
          angle: ang,
          travelled: 0,
          maxDist: s.maxDist * 0.95,
          hits: new Set(),
          trail: [],
        });
      }
    }
    // AOE blades release a shockwave the moment they leave your hand
    const aoe = this.mode === 'rush' ? 0 : this.swordPower.throwAoe ?? 0;
    if (aoe > 0) this.throwBurst(s.x, s.y, aoe);
    sfx.throwSword();
    tgHaptic('light');
    this.emitHud();
    if (this.hintStage === 0) {
      this.hintStage = 1;
      this.hintT = 0;
    }
  }

  recallSword() {
    const s = this.sw;
    if (s.state === 'held' || s.state === 'returning') return;
    s.state = 'returning';
    s.hits.clear();
    this.bolt(this.px, this.py, s.x, s.y, '#9be9ff', 3, 26, 0.16);
    sfx.recall();
  }

  private blinkLockout = 0;

  blink() {
    // prevent double-fire when Space and LMB are pressed simultaneously
    if (this.blinkLockout > 0) return;
    const s = this.sw;
    if (s.state === 'held') {
      this.throwSword();
      this.blinkLockout = 0.05;
      return;
    }
    // Lexicon has NO teleport cooldown — the challenge is the words, not the timer
    if (this.mode !== 'word' && this.blinkCd > 0 && this.blinkFreeT <= 0 && !(this.mode === 'race' && this.score >= 20000)) {
      // blink is recharging — pull the blade back instead of teleporting
      this.recallSword();
      return;
    }
    const fromX = this.px;
    const fromY = this.py;
    const tx = clamp(s.x, this.pr + 6, this.W - this.pr - 6);
    const ty = clamp(s.y, this.pr + 6, this.H - this.pr - 6);
    const d = dist(fromX, fromY, tx, ty);
    // afterimages
    const steps = clamp(Math.floor(d / 26), 3, 22);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.blinkGhosts.push({ x: lerp(fromX, tx, t), y: lerp(fromY, ty, t), life: 0.34, a: 1 - t * 0.45 });
    }
    this.bolt(fromX, fromY, tx, ty, '#ffffff', 5, 30, 0.22);
    this.bolt(fromX, fromY, tx, ty, '#79f2ff', 10, 46, 0.18);
    this.px = tx;
    this.py = ty;
    const keep = 0.35;
    this.pvx = this.pvx * keep + (tx - fromX) * 0.6;
    this.pvy = this.pvy * keep + (ty - fromY) * 0.6;
    const sp = Math.hypot(this.pvx, this.pvy);
    if (sp > 520) {
      this.pvx = (this.pvx / sp) * 520;
      this.pvy = (this.pvy / sp) * 520;
    }
    s.state = 'held';
    s.trail.length = 0;
    // only a committed long jump buys real invulnerability — micro-hops don't
    this.iframes = Math.max(this.iframes, d > 90 ? 0.24 : 0.06);

    // MAGMA blades scorch the ground where you land
    const lavaSecs = this.mode === 'rush' ? 0 : this.swordPower.lava ?? 0;
    if (lavaSecs > 0) this.spawnLava(tx, ty, lavaSecs);

    // landing on a power orb consumes it
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const o = this.orbs[i];
      if (dist(o.x, o.y, tx, ty) < 90) {
        this.consumeOrb(o);
        this.orbs.splice(i, 1);
      }
    }

    // nova
    const R = this.overcharge > 0 ? 175 : 120;
    this.ring(tx, ty, R * 1.25, '#ffffff', 0.3, 5);
    this.ring(tx, ty, R * 1.7, '#79f2ff', 0.5, 3);
    this.ring(fromX, fromY, 70, '#a97bff', 0.35, 3);
    this.spark(tx, ty, 26, '#bff6ff', 460, 3);
    this.spark(fromX, fromY, 14, '#a97bff', 300, 2.6);
    this.motes(tx, ty, 10, '#79f2ff', 150, 8);
    let hitAny = 0;
    const dmg = this.dmg(2 + (this.overcharge > 0 ? 2 : 0));
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.state === 'spawn') continue;
      if (dist(e.x, e.y, tx, ty) < R + e.r) {
        this.hurtEnemy(e, dmg, tx, ty, 420, true);
        this.bolt(tx, ty, e.x, e.y, '#dffaff', 2.5, 16, 0.16);
        hitAny++;
      }
    }
    let baseCd = this.blinkCdMax;
    if (this.mode === 'race') {
      baseCd = this.score >= 20000 ? 0 : Math.max(0, 1.0 - (this.score / 20000) * 1.0);
    }
    const gearCd = this.mode === 'rush' ? this.rushBlade.blinkCd : this.swordPower.blinkCd;
    this.blinkCd =
      this.mode === 'word' || this.blinkFreeT > 0 || (this.mode === 'race' && this.score >= 20000)
        ? 0
        : (this.overcharge > 0 ? 0.55 : baseCd) * gearCd;
    if (hitAny >= 3 && this.blinkFreeT <= 0) {
      this.text(tx, ty - 40, this.t().strike.replace('{n}', `${hitAny}`), '#ffd166', 20);
      // skill reward: landing inside a pack refunds most of the cooldown
      this.blinkCd = Math.max(0.3, this.blinkCd * 0.45);
    }
    this.shake(0.55);
    this.hitStop = Math.max(this.hitStop, 0.07);
    this.flash = 0.45;
    this.flashColor = '#c9f6ff';
    this.vignettePulse = 1;
    sfx.blink();
    tgHaptic('medium');
    this.emitHud();
    if (this.hintStage === 1) {
      this.hintStage = 2;
      this.hintT = 0;
    }
  }

  slash() {
    // LEXICON: recall first (same as every other mode), else slash the eraser rune
    if (this.mode === 'word') {
      if (this.sw.state !== 'held') {
        this.recallSword();
        return;
      }
      if (this.slashCd > 0) return;
      this.slashT = 0.24;
      this.slashCd = 0.24;
      this.slashDir = Math.atan2(this.aimY, this.aimX);
      const reach = 96 + this.pr;
      if (dist(this.px, this.py, this.eraser.x, this.eraser.y) < reach + this.eraser.r) {
        this.eraseLetter();
      } else {
        sfx.slash();
      }
      return;
    }
    // Right-click / SLASH recalls a thrown blade in every mode
    if (this.sw.state !== 'held') {
      this.recallSword();
      return;
    }
    if (this.slashCd > 0) return;
    this.slashT = 0.24;
    this.slashCd = 0.28 * this.swordPower.slashCd;
    this.slashDir = Math.atan2(this.aimY, this.aimX);
    this.slashHits.clear();
    this.pvx += this.aimX * 130;
    this.pvy += this.aimY * 130;
    sfx.slash();
    tgHaptic('light');
    this.shake(0.05);
  }

  // ---------------------------------------------------------------- update
  update(dt: number, input: Input) {
    this.time += dt;

    // fx timers (real time)
    this.trauma = Math.max(0, this.trauma - dt * 1.7);
    const tt = this.trauma * this.trauma;
    const amp = 21 * tt;
    this.shakeX = (Math.random() - 0.5) * amp;
    this.shakeY = (Math.random() - 0.5) * amp;
    this.flash = Math.max(0, this.flash - dt * 3.1);
    this.hurtFlash = Math.max(0, this.hurtFlash - dt * 1.6);
    this.vignettePulse = Math.max(0, this.vignettePulse - dt * 2.2);

    if (this.state === 'menu') {
      this.ambient(dt);
      this.stepFx(dt);
      return;
    }
    if (this.state !== 'playing') {
      if (this.state !== 'paused') this.stepFx(dt);
      return;
    }

    this.hintT += dt;
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0 && this.combo > 0) {
        this.combo = 0;
        this.emitHud();
      }
    }
    if (this.overcharge > 0) {
      this.overcharge -= dt;
      if (this.overcharge <= 0) {
        this.overcharge = 0;
        this.charge = 0;
        this.emitHud();
      }
      if (Math.random() < 0.5) this.motes(this.px + rand(20, -20), this.py + rand(20, -20), 1, '#ffd166', 60, 6);
    }
    if (this.triT > 0) {
      this.triT -= dt;
      if (this.triT <= 0) {
        this.triT = 0;
        this.emitHud();
      }
    }
    if (this.freezeT > 0) {
      this.freezeT -= dt;
      if (this.freezeT <= 0) {
        this.freezeT = 0;
        this.emitHud();
      }
    }
    if (this.score2xT > 0) {
      this.score2xT -= dt;
      if (this.score2xT <= 0) {
        this.score2xT = 0;
        this.emitHud();
      }
    }
    if (this.blinkFreeT > 0) {
      this.blinkFreeT -= dt;
      if (this.blinkFreeT <= 0) {
        this.blinkFreeT = 0;
        this.emitHud();
      }
    }
    if (this.speedBoostT > 0) {
      this.speedBoostT -= dt;
      if (this.speedBoostT <= 0) {
        this.speedBoostT = 0;
        this.emitHud();
      }
    }
    if (this.slowMoT > 0) {
      this.slowMoT -= dt;
      if (this.slowMoT <= 0) {
        this.slowMoT = 0;
        this.emitHud();
      }
    }
    if (this.hyperSpeedT > 0) {
      this.hyperSpeedT -= dt;
      if (this.hyperSpeedT <= 0) {
        this.hyperSpeedT = 0;
        this.emitHud();
      }
    }
    if (this.ghostPassT > 0) {
      this.ghostPassT -= dt;
      if (Math.random() < dt * 22) this.motes(this.px + rand(20, -20), this.py + rand(22, -22), 1, '#f0a0ff', 50, 7);
      if (this.ghostPassT <= 0) {
        this.ghostPassT = 0;
        this.emitHud();
      }
    }
    if (this.magnetT > 0) {
      this.magnetT -= dt;
      if (Math.random() < dt * 14) this.motes(this.px + rand(26, -26), this.py + rand(26, -26), 1, '#b6ff5c', 60, 6);
      if (this.magnetT <= 0) {
        this.magnetT = 0;
        this.emitHud();
      }
    }
    if (this.shieldOrbT > 0) {
      this.shieldOrbT -= dt;
      if (this.shieldOrbT <= 0) {
        this.shieldOrbT = 0;
        this.emitHud();
      }
    }

    this.updatePlayer(dt, input);
    this.updateSword(dt);
    this.updateSideSwords(dt);
    if (this.mode === 'word') {
      // NOTE: updatePlayer/updateSword already ran above — calling them again
      // here double-stepped movement and broke the feel. Just run word logic.
      this.updateWordMode(dt);
      this.stepFx(dt);
      this.hudTimer += dt;
      if (this.hudTimer > 0.1) {
        this.hudTimer = 0;
        this.emitHud();
      }
      return;
    }
    this.updateGems(dt);
    if (this.streakT > 0) {
      this.streakT -= dt;
      if (this.streakT <= 0) this.streak = 0;
    }
    this.updateLava(dt);
    if (this.scrolling) {
      this.updateRace(dt);
      if (this.mode === 'rush') this.updateBladeDrops(dt);
    } else {
      this.updateEnemies(dt);
      this.updateElemental(dt);
      this.updateProjectiles(dt);
      this.updatePickups(dt);
      this.updateOrbs(dt);
      this.updateWaves(dt);
    }
    this.stepFx(dt);

    this.hudTimer += dt;
    if (this.hudTimer > 0.1) {
      this.hudTimer = 0;
      this.emitHud();
    }
  }

  private ambient(dt: number) {
    if (Math.random() < dt * 6) {
      this.motes(rand(this.W), rand(this.H), 1, Math.random() < 0.5 ? '#79f2ff' : '#a97bff', 30, 7);
    }
    if (Math.random() < dt * 0.5) {
      const x = rand(this.W);
      this.bolt(x, -20, x + rand(160, -160), this.H + 20, 'rgba(150,220,255,0.5)', 2, 60, 0.22);
      this.flash = Math.max(this.flash, 0.12);
      this.flashColor = '#9fd8ff';
    }
  }

  private updatePlayer(dt: number, input: Input) {
    // aim
    let ax = this.aimX;
    let ay = this.aimY;
    let aimSet = false;
    if (input.usingMouse && input.hasAim) {
      const dx = input.mouseX - this.px;
      const dy = input.mouseY - this.py;
      const l = Math.hypot(dx, dy);
      if (l > 4) {
        ax = dx / l;
        ay = dy / l;
        aimSet = true;
      }
    } else if (input.aim.active && input.aim.mag > 0.25) {
      ax = input.aim.dx;
      ay = input.aim.dy;
      aimSet = true;
    }
    if (!aimSet && (input.moveX || input.moveY)) {
      const l = Math.hypot(input.moveX, input.moveY) || 1;
      ax = input.moveX / l;
      ay = input.moveY / l;
      aimSet = true;
    }
    // touch aim assist: snap toward the nearest enemy in a cone
    if (input.isTouch) {
      let best: Enemy | null = null;
      let bestScore = Infinity;
      for (const e of this.enemies) {
        if (e.hp <= 0) continue;
        const d = dist(e.x, e.y, this.px, this.py);
        if (d > 520) continue;
        const dx = (e.x - this.px) / d;
        const dy = (e.y - this.py) / d;
        const dot = dx * ax + dy * ay;
        const sc = d * (1.5 - dot);
        if (dot > 0.45 && sc < bestScore) {
          bestScore = sc;
          best = e;
        }
      }
      if (best) {
        const d = dist(best.x, best.y, this.px, this.py) || 1;
        const tx = (best.x - this.px) / d;
        const ty = (best.y - this.py) / d;
        const k = smooth(14, dt);
        ax = lerp(ax, tx, k);
        ay = lerp(ay, ty, k);
      }
    }
    const al = Math.hypot(ax, ay) || 1;
    this.aimX = ax / al;
    this.aimY = ay / al;
    this.facing = Math.atan2(this.aimY, this.aimX);

    // movement
    const unarmed = this.sw.state !== 'held' ? 1.12 : 1;
    const oc = this.overcharge > 0 ? 1.14 : 1;
    const boost = this.speedBoostT > 0 ? 1.35 : 1;
    // Race/Rush: the swordsman speeds up alongside the obstacles, hitting max at 20k
    const raceAgility = this.scrolling ? lerp(1.0, 1.45, this.raceRamp()) : 1;
    const bladeAgility = this.mode === 'rush' ? this.rushBlade.agility : 1;
    const maxSpd = 292 * unarmed * oc * this.speedMult * boost * raceAgility * bladeAgility;
    const tvx = input.moveX * maxSpd;
    const tvy = input.moveY * maxSpd;
    const k = smooth(input.moveX || input.moveY ? 15 : 9, dt);
    this.pvx = lerp(this.pvx, tvx, k);
    this.pvy = lerp(this.pvy, tvy, k);
    this.px += this.pvx * dt;
    this.py += this.pvy * dt;

    const pad = this.pr + 4;
    if (this.px < pad) {
      this.px = pad;
      this.pvx = Math.abs(this.pvx) * 0.3;
    }
    if (this.px > this.W - pad) {
      this.px = this.W - pad;
      this.pvx = -Math.abs(this.pvx) * 0.3;
    }
    if (this.py < pad) {
      this.py = pad;
      this.pvy = Math.abs(this.pvy) * 0.3;
    }
    if (this.py > this.H - pad) {
      this.py = this.H - pad;
      this.pvy = -Math.abs(this.pvy) * 0.3;
    }

    const spd = Math.hypot(this.pvx, this.pvy);
    this.legPhase += dt * (4 + spd * 0.035);
    if (spd > 60 && Math.random() < dt * 18) {
      this.particles.push({
        x: this.px + rand(8, -8),
        y: this.py + this.pr * 0.7,
        vx: rand(20, -20),
        vy: rand(-10, -40),
        life: 0.4,
        max: 0.4,
        size: 3 + Math.random() * 3,
        color: this.overcharge > 0 ? '#ffd166' : this.dustColor,
        drag: 2,
        grav: 0,
        kind: 1,
        rot: 0,
        vr: 0,
      });
    }

    if (this.iframes > 0) this.iframes -= dt;
    if (this.slashCd > 0) this.slashCd -= dt;
    if (this.blinkCd > 0) this.blinkCd -= dt;
    if (this.blinkLockout > 0) this.blinkLockout -= dt;
    if (this.mightT > 0) {
      this.mightT -= dt;
      if (this.mightT <= 0) {
        this.mightT = 0;
        this.emitHud();
      } else if (Math.random() < dt * 12) {
        this.motes(this.px + rand(24, -24), this.py + rand(24, -24), 1, '#ff8a3d', 60, 6);
      }
    }

    // slash damage window
    if (this.slashT > 0) {
      const prev = this.slashT;
      this.slashT -= dt;
      const range = (78 + this.pr) * (this.overcharge > 0 ? 1.3 : 1);
      if (prev > 0.06) {
        for (const e of this.enemies) {
          if (e.hp <= 0 || e.state === 'spawn' || this.slashHits.has(e.id)) continue;
          const d = dist(e.x, e.y, this.px, this.py);
          if (d > range + e.r) continue;
          const ang = Math.atan2(e.y - this.py, e.x - this.px);
          let diff = Math.abs(((ang - this.slashDir + Math.PI * 3) % TAU) - Math.PI);
          diff = Math.abs(diff);
          if (diff < 1.15) {
            this.slashHits.add(e.id);
            this.hurtEnemy(e, this.dmg(2 + (this.overcharge > 0 ? 1 : 0)), this.px, this.py, 300);
            this.spark(e.x, e.y, 5, '#ffffff', 260, 2.4);
          }
        }
      }
      if (this.slashT <= 0) this.slashT = 0;
    }

    // shards
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.t += dt;
      s.life -= dt;
      const d = dist(s.x, s.y, this.px, this.py);
      if (s.t > 0.25) {
        const pull = clamp(1400 / Math.max(40, d), 1, 26) * 60;
        s.vx += ((this.px - s.x) / (d || 1)) * pull * dt;
        s.vy += ((this.py - s.y) / (d || 1)) * pull * dt;
      }
      s.vx *= 1 - 1.6 * dt;
      s.vy *= 1 - 1.6 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (d < this.pr + 12 || s.life <= 0) {
        if (s.life > 0) {
          this.score += 15 * this.mult() * (this.score2xT > 0 ? 2 : 1);
          if (this.overcharge <= 0) {
            this.charge = Math.min(100, this.charge + 2.9);
            if (this.charge >= 100) this.triggerOvercharge();
          }
          sfx.pickup();
          this.spark(s.x, s.y, 3, '#79f2ff', 160, 2);
        }
        this.shards.splice(i, 1);
      }
    }
  }

  triggerOvercharge() {
    this.overcharge = 8 * this.swordPower.ocDur;
    this.charge = 100;
    this.flash = 0.6;
    this.flashColor = '#ffd166';
    this.shake(0.5);
    this.ring(this.px, this.py, 320, '#ffd166', 0.7, 6);
    this.ring(this.px, this.py, 180, '#ffffff', 0.4, 4);
    this.text(this.px, this.py - 50, this.t().overchargeText, '#ffd166', 26);
    this.spark(this.px, this.py, 40, '#ffd166', 420, 3);
    sfx.overcharge();
    tgHaptic('success');
  }

  private updateSword(dt: number) {
    const s = this.sw;
    if (s.state === 'held') {
      s.x = this.px;
      s.y = this.py;
      s.spin = 0;
      return;
    }
    s.spin += dt * 24;
    if (s.state === 'flying') {
      const px = s.x;
      const py = s.y;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.travelled += Math.hypot(s.vx, s.vy) * dt;
      s.trail.push({ x: s.x, y: s.y, a: 1 });
      if (s.trail.length > 16) s.trail.shift();
      if (Math.random() < dt * 40) this.spark(s.x, s.y, 1, '#bff6ff', 120, 2);
      // hit enemies along the segment
      for (const e of this.enemies) {
        if (e.hp <= 0 || s.hits.has(e.id)) continue;
        if (segDist(e.x, e.y, px, py, s.x, s.y) < e.r + 16) {
          s.hits.add(e.id);
          this.hurtEnemy(e, this.dmg(3 + (this.overcharge > 0 ? 2 : 0)), px, py, 170, true);
          if (this.overcharge > 0) this.chain(e, 3);
        }
      }
      // Blade Rush: shatter obstacles the blade flies through
      if (this.mode === 'rush') this.bladeHitObstacles(px, py, s.x, s.y, s.hits);
      let stop = false;
      const pad = 14;
      if (s.x < pad || s.x > this.W - pad || s.y < pad || s.y > this.H - pad) {
        s.x = clamp(s.x, pad, this.W - pad);
        s.y = clamp(s.y, pad, this.H - pad);
        stop = true;
      }
      if (s.travelled >= s.maxDist) stop = true;
      if (stop) {
        s.state = 'stuck';
        s.stuckT = 0;
        this.ring(s.x, s.y, 74, '#79f2ff', 0.4, 3);
        this.spark(s.x, s.y, 14, '#bff6ff', 280, 2.6);
        this.shake(0.12);
      }
    } else if (s.state === 'stuck') {
      s.stuckT += dt;
      s.spin = 0;
      if (Math.random() < dt * 3) this.bolt(s.x, s.y, s.x + rand(40, -40), s.y + rand(40, -40), '#9be9ff', 1.6, 10, 0.12);
      if (Math.random() < dt * 8) this.spark(s.x, s.y, 1, '#bff6ff', 90, 2);
    } else if (s.state === 'returning') {
      const dx = this.px - s.x;
      const dy = this.py - s.y;
      const d = Math.hypot(dx, dy) || 1;
      // SHORT blades snap back fast, LONG blades are sluggish to recover.
      // This is what actually makes reach a trade-off rather than pure upside.
      const reach = this.mode === 'rush' ? this.rushBlade.reach : this.swordPower.reach ?? 1;
      const speed = 1250 / Math.max(0.6, reach);
      const px = s.x;
      const py = s.y;
      s.x += (dx / d) * speed * dt;
      s.y += (dy / d) * speed * dt;
      s.trail.push({ x: s.x, y: s.y, a: 1 });
      if (s.trail.length > 14) s.trail.shift();
      for (const e of this.enemies) {
        if (e.hp <= 0 || s.hits.has(e.id)) continue;
        if (segDist(e.x, e.y, px, py, s.x, s.y) < e.r + 16) {
          s.hits.add(e.id);
          this.hurtEnemy(e, this.dmg(2 + (this.overcharge > 0 ? 1 : 0)), px, py, 150);
        }
      }
      if (d < this.pr + 14) {
        s.state = 'held';
        s.trail.length = 0;
        this.spark(this.px, this.py, 10, '#bff6ff', 220, 2.4);
        this.ring(this.px, this.py, 56, '#79f2ff', 0.28, 3);
        sfx.catchSword();
        this.shake(0.08);
        this.emitHud();
      }
    }
  }

  private updateSideSwords(dt: number) {
    for (let i = this.sideSwords.length - 1; i >= 0; i--) {
      const s = this.sideSwords[i];
      const px = s.x;
      const py = s.y;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.travelled += Math.hypot(s.vx, s.vy) * dt;
      s.trail.push({ x: s.x, y: s.y, a: 1 });
      if (s.trail.length > 14) s.trail.shift();
      if (Math.random() < dt * 35) this.spark(s.x, s.y, 1, '#bff6ff', 120, 2);
      for (const e of this.enemies) {
        if (e.hp <= 0 || s.hits.has(e.id)) continue;
        if (segDist(e.x, e.y, px, py, s.x, s.y) < e.r + 16) {
          s.hits.add(e.id);
          this.hurtEnemy(e, this.dmg(2 + (this.overcharge > 0 ? 1 : 0)), px, py, 140, false);
        }
      }
      let stop = false;
      const pad = 14;
      if (s.x < pad || s.x > this.W - pad || s.y < pad || s.y > this.H - pad) stop = true;
      if (s.travelled >= s.maxDist) stop = true;
      if (stop) {
        this.spark(s.x, s.y, 8, '#79f2ff', 240, 2.2);
        this.sideSwords.splice(i, 1);
      }
    }
  }

  private chain(from: Enemy, count: number) {
    let src = from;
    const used = new Set<number>([from.id]);
    for (let i = 0; i < count; i++) {
      let best: Enemy | null = null;
      let bd = 260;
      for (const e of this.enemies) {
        if (e.hp <= 0 || used.has(e.id)) continue;
        const d = dist(e.x, e.y, src.x, src.y);
        if (d < bd) {
          bd = d;
          best = e;
        }
      }
      if (!best) return;
      used.add(best.id);
      this.bolt(src.x, src.y, best.x, best.y, '#ffe9a8', 2.5, 22, 0.2);
      this.hurtEnemy(best, this.dmg(2), src.x, src.y, 120);
      src = best;
    }
  }

  private updateEnemies(dt: number) {
    const list = this.enemies;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (e.hp <= 0) {
        list.splice(i, 1);
        continue;
      }
      e.t += dt;
      e.hitFlash = Math.max(0, e.hitFlash - dt * 5);
      e.squash = Math.max(0, e.squash - dt * 3);
      e.contactCd = Math.max(0, e.contactCd - dt);
      e.wob += dt * 6;
      const d = dist(e.x, e.y, this.px, this.py) || 1;
      const dx = (this.px - e.x) / d;
      const dy = (this.py - e.y) / d;
      e.angle = lerp(e.angle, Math.atan2(dy, dx), smooth(8, dt));
      const spd = Math.hypot(e.vx, e.vy);
      e.legPhase += dt * (3 + spd * 0.04);

      if (e.state === 'spawn') {
        if (e.t > 0.45) {
          e.state = 'chase';
          e.t = 0;
        }
      } else if (this.freezeT > 0 || (e.frozenT ?? 0) > 0) {
        // frozen enemies stay frozen in place (FROST orb or a frost blade)
        e.vx *= 1 - 10 * dt;
        e.vy *= 1 - 10 * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (Math.random() < dt * 6) this.spark(e.x, e.y, 1, '#a0f0ff', 60, 2);
        continue;
      } else if (e.kind === 'snapper') {
        const wob = Math.sin(e.wob) * 0.35;
        e.vx += (Math.cos(e.angle + wob) * e.speed - e.vx) * smooth(4, dt);
        e.vy += (Math.sin(e.angle + wob) * e.speed - e.vy) * smooth(4, dt);
      } else if (e.kind === 'hound') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(3.5, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(3.5, dt);
          e.cd -= dt;
          if (d < 340 && e.cd <= 0) {
            e.state = 'wind';
            e.t = 0;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 6 * dt;
          e.vy *= 1 - 6 * dt;
          e.aimX = dx;
          e.aimY = dy;
          if (e.t > 0.42) {
            e.state = 'dash';
            e.t = 0;
            e.vx = e.aimX * 790;
            e.vy = e.aimY * 790;
            this.spark(e.x, e.y, 8, '#ff8a3d', 220, 2.4);
          }
        } else if (e.state === 'dash') {
          if (Math.random() < dt * 30) this.motes(e.x, e.y, 1, '#ff8a3d', 40, 6);
          if (e.t > 0.34) {
            e.state = 'rest';
            e.t = 0;
            e.cd = rand(2.4, 1.2);
          }
        } else {
          e.vx *= 1 - 4 * dt;
          e.vy *= 1 - 4 * dt;
          if (e.t > 0.55) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } else if (e.kind === 'wisp') {
        let mx = 0;
        let my = 0;
        if (d < 230) {
          mx = -dx;
          my = -dy;
        } else if (d > 340) {
          mx = dx;
          my = dy;
        }
        const perp = Math.sin(e.wob * 0.35) * 0.9;
        mx += -dy * perp;
        my += dx * perp;
        const ml = Math.hypot(mx, my) || 1;
        e.vx += ((mx / ml) * e.speed - e.vx) * smooth(3, dt);
        e.vy += ((my / ml) * e.speed - e.vy) * smooth(3, dt);
        e.cd -= dt;
        if (e.cd <= 0 && d < 520) {
          e.cd = rand(2.2, 1.35);
          e.state = 'wind';
          e.t = 0;
        }
        if (e.state === 'wind' && e.t > 0.45) {
          e.state = 'chase';
          this.projs.push({ x: e.x, y: e.y, vx: dx * 270, vy: dy * 270, r: 9, life: 5, t: 0 });
          this.spark(e.x, e.y, 6, '#c9a6ff', 180, 2.2);
        }
      } else if (e.kind === 'brute') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(2.4, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(2.4, dt);
          if (d < 150) {
            e.state = 'wind';
            e.t = 0;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 5 * dt;
          e.vy *= 1 - 5 * dt;
          if (e.t > 0.85) {
            e.state = 'rest';
            e.t = 0;
            const R = 175;
            this.ring(e.x, e.y, R, this.mapSkin.enemyAccent, 0.42, 7);
            this.ring(e.x, e.y, R * 0.6, '#ffffff', 0.25, 3);
            this.spark(e.x, e.y, 22, this.mapSkin.sparkColor, 380, 3);
            this.shake(0.35);
            if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
          }
        } else {
          e.vx *= 1 - 3 * dt;
          e.vy *= 1 - 3 * dt;
          if (e.t > 1) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } else if (e.kind === 'phantom') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(4.0, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(4.0, dt);
          e.cd -= dt;
          if (d < 360 && e.cd <= 0) {
            e.state = 'wind';
            e.t = 0;
            e.aimX = dx;
            e.aimY = dy;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 8 * dt;
          e.vy *= 1 - 8 * dt;
          if (e.t > 0.35) {
            e.state = 'dash';
            e.t = 0;
            e.vx = dx * 860;
            e.vy = dy * 860;
            this.spark(e.x, e.y, 10, '#ad87ff', 280, 2.4);
          }
        } else if (e.state === 'dash') {
          if (Math.random() < dt * 30) this.motes(e.x, e.y, 1, '#ad87ff', 50, 6);
          if (e.t > 0.28) {
            e.state = 'rest';
            e.t = 0;
            e.cd = rand(2.2, 1.0);
          }
        } else {
          e.vx *= 1 - 4 * dt;
          e.vy *= 1 - 4 * dt;
          if (e.t > 0.45) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } else if (e.kind === 'goliath') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(2.0, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(2.0, dt);
          if (d < 180) {
            e.state = 'wind';
            e.t = 0;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 6 * dt;
          e.vy *= 1 - 6 * dt;
          if (e.t > 0.9) {
            e.state = 'rest';
            e.t = 0;
            const R = 210;
            this.ring(e.x, e.y, R, this.mapSkin.enemyAccent, 0.5, 8);
            this.ring(e.x, e.y, R * 0.7, '#ffffff', 0.35, 4);
            this.spark(e.x, e.y, 28, this.mapSkin.sparkColor, 420, 3.5);
            this.shake(0.45);
            if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
          }
        } else {
          e.vx *= 1 - 3 * dt;
          e.vy *= 1 - 3 * dt;
          if (e.t > 1.1) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } else if (e.kind === 'weaver') {
        let mx = 0;
        let my = 0;
        if (d < 260) {
          mx = -dx;
          my = -dy;
        } else if (d > 380) {
          mx = dx;
          my = dy;
        }
        const perp = Math.sin(e.wob * 0.4) * 0.9;
        mx += -dy * perp;
        my += dx * perp;
        const ml = Math.hypot(mx, my) || 1;
        e.vx += ((mx / ml) * e.speed - e.vx) * smooth(3, dt);
        e.vy += ((my / ml) * e.speed - e.vy) * smooth(3, dt);
        e.cd -= dt;
        if (e.cd <= 0 && d < 550) {
          e.cd = rand(2.4, 1.5);
          e.state = 'wind';
          e.t = 0;
        }
        if (e.state === 'wind' && e.t > 0.5) {
          e.state = 'chase';
          for (let s = -1; s <= 1; s++) {
            const ang = Math.atan2(dy, dx) + s * 0.28;
            this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * 260, vy: Math.sin(ang) * 260, r: 9, life: 5, t: 0 });
          }
          this.spark(e.x, e.y, 10, '#7af5ff', 220, 2.5);
        }
      } else if (e.kind === 'apex') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(2.8, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(2.8, dt);
          e.cd -= dt;
          if (d < 400 && e.cd <= 0) {
            e.state = 'wind';
            e.t = 0;
            e.aimX = dx;
            e.aimY = dy;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 5 * dt;
          e.vy *= 1 - 5 * dt;
          if (e.t > 0.6) {
            e.state = 'dash';
            e.t = 0;
            e.vx = e.aimX * 820;
            e.vy = e.aimY * 820;
            const R = 180;
            this.ring(e.x, e.y, R, this.mapSkin.enemyAccent, 0.45, 6);
            if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
            this.spark(e.x, e.y, 18, this.mapSkin.enemyAccent, 350, 3);
          }
        } else if (e.state === 'dash') {
          if (Math.random() < dt * 35) this.motes(e.x, e.y, 1, '#7af5ff', 50, 6);
          if (e.t > 0.38) {
            e.state = 'rest';
            e.t = 0;
            e.cd = rand(2.6, 1.4);
            if (this.enemies.length < 24) {
              this.queueSpawn('snapper');
            }
          }
        } else {
          e.vx *= 1 - 4 * dt;
          e.vy *= 1 - 4 * dt;
          if (e.t > 0.8) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } else if (isBoss(e.kind)) {
        // ── RAGE PHASE: at 50% HP the boss freezes and fires patterns for 7s
        if (!e.rage && e.hp <= e.maxHp * 0.5 && e.hp > 0) {
          e.rage = true;
          e.rageT = 7;
          e.vx = 0;
          e.vy = 0;
          e.state = 'wind';
          e.t = 0;
          this.ring(e.x, e.y, 280, '#ff2e55', 0.7, 8);
          this.ring(e.x, e.y, 160, '#ffffff', 0.4, 4);
          this.text(e.x, e.y - e.r - 20, 'RAGE!', '#ff2e55', 28);
          this.flash = 0.5;
          this.flashColor = '#ff2e55';
          this.shake(0.7);
          sfx.overcharge();
          tgHaptic('error');
        }

        if (e.rage && e.rageT && e.rageT > 0) {
          e.rageT -= dt;
          e.vx *= 1 - 8 * dt;
          e.vy *= 1 - 8 * dt;
          e.cd -= dt;

          if (e.cd <= 0) {
            // ── Each boss has a UNIQUE rage attack ──

            if (e.kind === 'boss_warden') {
              // WARDEN: aimed triple-shot bursts directly at the player
              e.cd = 0.55;
              for (const off of [-0.2, 0, 0.2]) {
                const ang = Math.atan2(this.py - e.y, this.px - e.x) + off;
                const spd = 280;
                this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 10, life: 5, t: 0 });
              }

            } else if (e.kind === 'boss_gargoyle') {
              // GARGOYLE: expanding ring that closes in — must blink through
              e.cd = 1.1;
              const nProj = 18;
              const ringR = 320;
              const aimAng = Math.atan2(this.py - e.y, this.px - e.x);
              for (let i = 0; i < nProj; i++) {
                const ang = (i / nProj) * TAU;
                const sx = e.x + Math.cos(ang) * ringR;
                const sy = e.y + Math.sin(ang) * ringR;
                const spd = 180;
                this.projs.push({ x: sx, y: sy, vx: -Math.cos(ang) * spd + Math.cos(aimAng) * 40, vy: -Math.sin(ang) * spd + Math.sin(aimAng) * 40, r: 11, life: 4, t: 0 });
              }
              this.ring(e.x, e.y, ringR, '#ad87ff', 0.45, 5);

            } else if (e.kind === 'boss_serpent') {
              // SERPENT: spiraling snake trail that tracks the player
              e.cd = 0.3;
              const ang = Math.atan2(this.py - e.y, this.px - e.x) + Math.sin((e.rageT ?? 0) * 6) * 0.8;
              const spd = 260;
              this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 9, life: 5, t: 0 });

            } else if (e.kind === 'boss_colossus') {
              // COLOSSUS: growing shockwave rings + debris rain
              e.cd = 1.4;
              const R = 200 + (7 - (e.rageT ?? 0)) * 15;
              this.ring(e.x, e.y, R, '#ff5e3a', 0.55, 8);
              this.ring(e.x, e.y, R * 0.6, '#ffffff', 0.35, 4);
              if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
              this.shake(0.4);
              // debris rain: random projectiles across the arena
              for (let i = 0; i < 6; i++) {
                const rx = rand(this.W - 60, 60);
                this.projs.push({ x: rx, y: -20, vx: rand(30, -30), vy: rand(280, 200), r: 12, life: 5, t: 0 });
              }

            } else {
              // SOVEREIGN: cross-shaped laser walls that rotate + aimed snipes
              e.cd = 0.6;
              const baseAng = (e.rageT ?? 0) * 1.8;
              // 4 laser lines (cross pattern)
              for (let arm = 0; arm < 4; arm++) {
                const ang = baseAng + arm * (Math.PI / 2);
                for (let j = 1; j <= 3; j++) {
                  const spd = 160 + j * 50;
                  this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: 9, life: 4, t: 0 });
                }
              }
              // aimed snipe at the player
              const snipe = Math.atan2(this.py - e.y, this.px - e.x);
              this.projs.push({ x: e.x, y: e.y, vx: Math.cos(snipe) * 340, vy: Math.sin(snipe) * 340, r: 11, life: 5, t: 0 });
            }

            this.spark(e.x, e.y, 12, this.mapSkin.enemyAccent, 280, 2.8);
            sfx.throwSword();
          }
          if (Math.random() < dt * 18) this.motes(e.x + rand(30, -30), e.y + rand(30, -30), 1, '#ff4d6d', 80, 7);
          if (e.rageT <= 0) {
            e.rage = false;
            e.state = 'chase';
            e.t = 0;
            e.cd = rand(2, 1);
          }
          // skip normal AI during rage
        } else if (e.kind === 'boss_warden') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(2.2, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(2.2, dt);
          e.cd -= dt;
          if (d < 450 && e.cd <= 0) {
            e.state = 'wind';
            e.t = 0;
            e.aimX = dx;
            e.aimY = dy;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 6 * dt;
          e.vy *= 1 - 6 * dt;
          if (e.t > 0.8) {
            e.state = 'rest';
            e.t = 0;
            e.cd = rand(2.8, 1.8);
            const R = 220;
            this.ring(e.x, e.y, R, this.mapSkin.enemyAccent, 0.5, 8);
            if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
            this.spark(e.x, e.y, 24, this.mapSkin.enemyAccent, 380, 4);
            this.shake(0.5);
            for (let i = 0; i < 8; i++) {
              const ang = (i / 8) * TAU + e.wob;
              this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * 240, vy: Math.sin(ang) * 240, r: 10, life: 6, t: 0 });
            }
            if (this.enemies.length < 8) this.queueSpawn('snapper');
          }
        } else {
          e.vx *= 1 - 4 * dt;
          e.vy *= 1 - 4 * dt;
          if (e.t > 0.9) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } else if (e.kind === 'boss_gargoyle') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(3.0, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(3.0, dt);
          e.cd -= dt;
          if (d < 480 && e.cd <= 0) {
            e.state = 'wind';
            e.t = 0;
            e.aimX = dx;
            e.aimY = dy;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 6 * dt;
          e.vy *= 1 - 6 * dt;
          if (e.t > 0.6) {
            e.state = 'dash';
            e.t = 0;
            e.vx = e.aimX * 880;
            e.vy = e.aimY * 880;
            const R = 240;
            this.ring(e.x, e.y, R, this.mapSkin.enemyAccent, 0.55, 8);
            if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
            this.spark(e.x, e.y, 28, this.mapSkin.enemyAccent, 400, 4);
            this.shake(0.6);
          }
        } else if (e.state === 'dash') {
          if (Math.random() < dt * 40) this.motes(e.x, e.y, 2, this.mapSkin.enemyAccent, 60, 7);
          if (e.t > 0.4) {
            e.state = 'rest';
            e.t = 0;
            e.cd = rand(2.4, 1.5);
            for (let i = 0; i < 10; i++) {
              const ang = (i / 10) * TAU;
              this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * 260, vy: Math.sin(ang) * 260, r: 10, life: 6, t: 0 });
            }
            if (this.enemies.length < 10) this.queueSpawn('hound');
          }
        } else {
          e.vx *= 1 - 4 * dt;
          e.vy *= 1 - 4 * dt;
          if (e.t > 0.8) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } else if (e.kind === 'boss_serpent') {
        let mx = dx;
        let my = dy;
        const perp = Math.sin(e.wob * 0.5) * 1.1;
        mx += -dy * perp;
        my += dx * perp;
        const ml = Math.hypot(mx, my) || 1;
        e.vx += ((mx / ml) * e.speed - e.vx) * smooth(3.2, dt);
        e.vy += ((my / ml) * e.speed - e.vy) * smooth(3.2, dt);
        e.cd -= dt;
        if (e.cd <= 0 && d < 550) {
          e.cd = rand(2.2, 1.3);
          e.state = 'wind';
          e.t = 0;
        }
        if (e.state === 'wind' && e.t > 0.6) {
          e.state = 'chase';
          const R = 260;
          this.ring(e.x, e.y, R, this.mapSkin.enemyAccent, 0.55, 8);
          if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
          this.shake(0.65);
          for (let i = 0; i < 12; i++) {
            const ang = (i / 12) * TAU + e.wob;
            this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * 280, vy: Math.sin(ang) * 280, r: 11, life: 7, t: 0 });
          }
          this.spark(e.x, e.y, 30, this.mapSkin.enemyAccent, 350, 4);
          if (this.enemies.length < 10) this.queueSpawn('weaver');
        }
      } else if (e.kind === 'boss_colossus') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(1.8, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(1.8, dt);
          if (d < 240) {
            e.state = 'wind';
            e.t = 0;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 6 * dt;
          e.vy *= 1 - 6 * dt;
          if (e.t > 0.95) {
            e.state = 'rest';
            e.t = 0;
            const R = 300;
            this.ring(e.x, e.y, R, this.mapSkin.enemyAccent, 0.6, 10);
            this.ring(e.x, e.y, R * 0.6, '#ffffff', 0.4, 5);
            this.spark(e.x, e.y, 40, this.mapSkin.sparkColor, 450, 4);
            this.shake(0.85);
            if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
            for (let i = 0; i < 14; i++) {
              const ang = (i / 14) * TAU;
              this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * 260, vy: Math.sin(ang) * 260, r: 12, life: 7, t: 0 });
            }
            if (this.enemies.length < 10) {
              this.queueSpawn('brute');
              this.queueSpawn('goliath');
            }
          }
        } else {
          e.vx *= 1 - 3 * dt;
          e.vy *= 1 - 3 * dt;
          if (e.t > 1.2) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } else if (e.kind === 'boss_sovereign') {
        if (e.state === 'chase') {
          e.vx += (dx * e.speed - e.vx) * smooth(3.2, dt);
          e.vy += (dy * e.speed - e.vy) * smooth(3.2, dt);
          e.cd -= dt;
          if (d < 450 && e.cd <= 0) {
            e.state = 'wind';
            e.t = 0;
            e.aimX = dx;
            e.aimY = dy;
          }
        } else if (e.state === 'wind') {
          e.vx *= 1 - 6 * dt;
          e.vy *= 1 - 6 * dt;
          if (e.t > 0.6) {
            e.state = 'dash';
            e.t = 0;
            e.vx = e.aimX * 940;
            e.vy = e.aimY * 940;
            const R = 320;
            this.ring(e.x, e.y, R, this.mapSkin.enemyAccent, 0.6, 10);
            if (dist(e.x, e.y, this.px, this.py) < R) this.hurtPlayer(e.dmg, e.x, e.y);
            this.spark(e.x, e.y, 40, this.mapSkin.enemyAccent, 460, 4);
            this.shake(0.9);
          }
        } else if (e.state === 'dash') {
          if (Math.random() < dt * 45) this.motes(e.x, e.y, 2, '#ffffff', 70, 7);
          if (e.t > 0.38) {
            e.state = 'rest';
            e.t = 0;
            e.cd = rand(2.2, 1.2);
            for (let i = 0; i < 16; i++) {
              const ang = (i / 16) * TAU + e.wob;
              this.projs.push({ x: e.x, y: e.y, vx: Math.cos(ang) * 300, vy: Math.sin(ang) * 300, r: 12, life: 8, t: 0 });
            }
            if (this.enemies.length < 12) {
              this.queueSpawn('apex');
              this.queueSpawn('weaver');
            }
          }
        } else {
          e.vx *= 1 - 4 * dt;
          e.vy *= 1 - 4 * dt;
          if (e.t > 0.7) {
            e.state = 'chase';
            e.t = 0;
          }
        }
      } // closes last boss else-if body
      } // closes isBoss block

      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // bounds
      const pad = e.r;
      if (e.x < pad) {
        e.x = pad;
        e.vx = Math.abs(e.vx) * 0.4;
      }
      if (e.x > this.W - pad) {
        e.x = this.W - pad;
        e.vx = -Math.abs(e.vx) * 0.4;
      }
      if (e.y < pad) {
        e.y = pad;
        e.vy = Math.abs(e.vy) * 0.4;
      }
      if (e.y > this.H - pad) {
        e.y = this.H - pad;
        e.vy = -Math.abs(e.vy) * 0.4;
      }

      // contact damage
      if (e.state !== 'spawn' && d < e.r + this.pr - 2 && e.contactCd <= 0 && e.kind !== 'wisp') {
        e.contactCd = 0.5;
        this.hurtPlayer(e.dmg, e.x, e.y);
        e.vx -= dx * 260;
        e.vy -= dy * 260;
      }
    }

    // separation
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const rr = a.r + b.r;
        const d2 = dx * dx + dy * dy;
        if (d2 < rr * rr && d2 > 0.001) {
          const d = Math.sqrt(d2);
          const push = ((rr - d) / d) * 0.5;
          const mA = b.kind === 'brute' && a.kind !== 'brute' ? 1.6 : 1;
          const mB = a.kind === 'brute' && b.kind !== 'brute' ? 1.6 : 1;
          a.x -= dx * push * mA;
          a.y -= dy * push * mA;
          b.x += dx * push * mB;
          b.y += dy * push * mB;
        }
      }
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projs.length - 1; i >= 0; i--) {
      const p = this.projs[i];
      p.t += dt;
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (Math.random() < dt * 24) this.motes(p.x, p.y, 1, '#a97bff', 20, 5);
      let dead = p.life <= 0 || p.x < -30 || p.y < -30 || p.x > this.W + 30 || p.y > this.H + 30;
      if (!dead && dist(p.x, p.y, this.px, this.py) < p.r + this.pr - 2) {
        this.hurtPlayer(1, p.x, p.y);
        dead = true;
      }
      // sword deflects projectiles
      if (!dead && this.slashT > 0 && dist(p.x, p.y, this.px, this.py) < 96) {
        dead = true;
        this.spark(p.x, p.y, 8, '#bff6ff', 260, 2.4);
        this.score += 25 * (this.score2xT > 0 ? 2 : 1);
      }
      if (dead) {
        this.spark(p.x, p.y, 5, '#a97bff', 180, 2.2);
        this.projs.splice(i, 1);
      }
    }
  }

  private updatePickups(dt: number) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.t += dt;
      p.life -= dt;
      p.vx *= 1 - 2 * dt;
      p.vy *= 1 - 2 * dt;
      const d = dist(p.x, p.y, this.px, this.py);
      if (d < 150) {
        p.vx += ((this.px - p.x) / (d || 1)) * 420 * dt;
        p.vy += ((this.py - p.y) / (d || 1)) * 420 * dt;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (d < this.pr + 16) {
        this.pickups.splice(i, 1);
        this.hp = Math.min(this.maxHp, this.hp + 1);
        this.text(this.px, this.py - 36, this.t().plusHp, '#7dffb2', 20);
        this.ring(this.px, this.py, 90, '#7dffb2', 0.4, 3);
        sfx.heal();
        this.emitHud();
      } else if (p.life <= 0) this.pickups.splice(i, 1);
    }
  }

  // ------------------------------------------------------------------ orbs
  private updateOrbs(dt: number) {
    const race = this.mode === 'race';
    const ramp = race ? this.raceRamp() : 0;
    // late race: orbs arrive much more often (and more can be on-screen)
    const maxOrbs = race ? (this.score >= 20000 ? 4 : 2) : 2;
    this.orbCd -= dt;
    if (this.orbCd <= 0 && this.orbs.length < maxOrbs) {
      this.spawnOrb();
      this.orbCd = race ? lerp(6.5, 2.2, ramp) * rand(1.15, 0.85) : rand(8.5, 5.5);
    }
    for (let i = this.orbs.length - 1; i >= 0; i--) {
      const o = this.orbs[i];
      o.t += dt;
      // in race mode orbs drift down with the scrolling arena
      if (race) {
        o.y += this.raceSpeed * dt;
        if (o.y > this.H + 60) {
          this.orbs.splice(i, 1);
          continue;
        }
      } else {
        o.life -= dt;
        if (o.life <= 0) {
          this.spark(o.x, o.y, 5, '#9fb4d8', 120, 2);
          this.orbs.splice(i, 1);
          continue;
        }
      }
      // MAGNET AURA drags nearby orbs toward the swordsman
      if (this.magnetT > 0) {
        const d = dist(o.x, o.y, this.px, this.py);
        if (d < 340 && d > 1) {
          const pull = 420 * dt;
          o.x += ((this.px - o.x) / d) * pull;
          o.y += ((this.py - o.y) / d) * pull;
        }
      }
      // walking over an orb consumes it too
      if (dist(o.x, o.y, this.px, this.py) < this.pr + 18) {
        this.consumeOrb(o);
        this.orbs.splice(i, 1);
      }
    }
  }

  private spawnOrb() {
    const race = this.mode === 'race';
    const rush = this.mode === 'rush';
    let kinds: OrbKind[];
    if (rush) {
      // Blade Rush: combat orbs matter again because obstacles are destructible
      kinds = ['zap', 'freeze', 'tri', 'might', 'score2x', 'blink_free', 'slow_mo', 'ghost_pass', 'magnet', 'shield_orb'];
      if (this.score < 20000) kinds.push('speed_boost');
    } else if (race) {
      kinds = ['blink_free', 'slow_mo', 'hyper_speed', 'ghost_pass', 'magnet', 'shield_orb', 'freeze', 'score2x'];
      // at 20k the swordsman is already at max speed & zero cooldown — drop those orbs
      if (this.score < 20000) kinds.push('speed_boost', 'blink_free');
    } else {
      kinds = ['might', 'zap', 'surge', 'tri', 'freeze', 'score2x', 'ghost_pass', 'magnet', 'shield_orb'];
    }
    const kind = kinds[randInt(0, kinds.length - 1)];

    let x = this.W / 2;
    let y = race ? -50 : this.H / 2;
    let tries = 0;
    const free = (cx: number, cy: number) => {
      // keep clear of other orbs
      for (const o of this.orbs) if (dist(o.x, o.y, cx, cy) < 130) return false;
      if (race) {
        // and never inside an incoming obstacle / blocked lane
        for (const ob of this.obstacles) {
          if (cy + 40 > ob.y && cy - 40 < ob.y + ob.h) {
            if (ob.kind === 'wall_gap' || ob.kind === 'crusher_row') {
              if (!(cx > ob.gapX + 30 && cx < ob.gapX + ob.gapW - 30)) return false;
            } else if (ob.kind === 'laser_gate') {
              return false;
            } else if (cx + 30 > ob.x && cx - 30 < ob.x + ob.w) {
              return false;
            }
          }
        }
        return true;
      }
      return dist(cx, cy, this.px, this.py) >= 170;
    };
    do {
      x = rand(this.W - 80, 80);
      if (!race) y = rand(this.H - 70, 70);
      else y = -50 - Math.random() * 40;
      tries++;
    } while (!free(x, y) && tries < 24);

    this.orbs.push({ kind, x, y, t: 0, life: race ? 999 : 10 });
    if (!race) this.ring(x, y, 64, '#ffffff', 0.35, 2);
  }

  private consumeOrb(o: Orb) {
    if (o.kind === 'might') {
      this.mightT = 4;
      this.text(o.x, o.y - 24, this.t().mightText, '#ff8a3d', 20);
      this.ring(o.x, o.y, 110, '#ff8a3d', 0.45, 4);
      this.spark(o.x, o.y, 14, '#ffb36b', 300, 2.8);
      sfx.heal();
      this.shake(0.15);
    } else if (o.kind === 'zap') {
      this.text(o.x, o.y - 24, this.t().thunderText, '#79f2ff', 20);
      this.zapNearby(230, this.dmg(4));
    } else if (o.kind === 'surge') {
      this.ring(o.x, o.y, 120, '#ffd166', 0.4, 4);
      this.spark(o.x, o.y, 14, '#ffd166', 300, 2.8);
      this.triggerOvercharge();
    } else if (o.kind === 'tri') {
      this.triT = 5;
      this.text(o.x, o.y - 24, this.t().triText, '#79f2ff', 20);
      this.ring(o.x, o.y, 110, '#79f2ff', 0.45, 4);
      this.spark(o.x, o.y, 14, '#bfe9ff', 300, 2.8);
      sfx.heal();
      this.shake(0.15);
    } else if (o.kind === 'freeze') {
      this.freezeT = 5;
      this.text(o.x, o.y - 24, this.t().freezeText, '#a0f0ff', 20);
      this.ring(o.x, o.y, 180, '#a0f0ff', 0.5, 6);
      this.spark(o.x, o.y, 20, '#e8f8ff', 360, 3.2);
      sfx.blink();
      this.shake(0.25);
    } else if (o.kind === 'score2x') {
      this.score2xT = 5;
      this.text(o.x, o.y - 24, this.t().score2xText, '#ffd166', 20);
      this.ring(o.x, o.y, 110, '#ffd166', 0.45, 4);
      this.spark(o.x, o.y, 14, '#ffeea0', 300, 2.8);
      sfx.heal();
      this.shake(0.15);
    } else if (o.kind === 'blink_free') {
      this.blinkFreeT = 5;
      this.text(o.x, o.y - 24, this.t().orb_blink_free, '#79f2ff', 20);
      this.ring(o.x, o.y, 120, '#79f2ff', 0.45, 4);
      this.spark(o.x, o.y, 16, '#bfe9ff', 320, 3);
      sfx.heal();
      this.shake(0.15);
    } else if (o.kind === 'speed_boost') {
      this.speedBoostT = 5;
      this.text(o.x, o.y - 24, this.t().orb_speed_boost, '#6dffb0', 20);
      this.ring(o.x, o.y, 110, '#6dffb0', 0.45, 4);
      this.spark(o.x, o.y, 16, '#9cffca', 320, 3);
      sfx.heal();
      this.shake(0.15);
    } else if (o.kind === 'slow_mo') {
      this.slowMoT = 5;
      this.text(o.x, o.y - 24, this.t().orb_slow_mo, '#c9a6ff', 20);
      this.ring(o.x, o.y, 130, '#c9a6ff', 0.5, 5);
      this.spark(o.x, o.y, 18, '#ebdfff', 340, 3);
      sfx.blink();
      this.shake(0.2);
    } else if (o.kind === 'hyper_speed') {
      this.hyperSpeedT = 5;
      this.text(o.x, o.y - 24, this.t().orb_hyper_speed, '#ff4d6d', 20);
      this.ring(o.x, o.y, 140, '#ff4d6d', 0.5, 6);
      this.spark(o.x, o.y, 22, '#ff8a8a', 380, 3.5);
      sfx.overcharge();
      this.shake(0.35);
    } else if (o.kind === 'ghost_pass') {
      this.ghostPassT = 5;
      this.text(o.x, o.y - 24, this.t().orb_ghost_pass, '#f0a0ff', 20);
      this.ring(o.x, o.y, 130, '#f0a0ff', 0.5, 5);
      this.spark(o.x, o.y, 20, '#ffd6ff', 340, 3);
      sfx.blink();
      this.shake(0.2);
    } else if (o.kind === 'magnet') {
      this.magnetT = 6;
      this.text(o.x, o.y - 24, this.t().orb_magnet, '#b6ff5c', 20);
      this.ring(o.x, o.y, 150, '#b6ff5c', 0.5, 5);
      this.spark(o.x, o.y, 18, '#e0ffb0', 320, 3);
      sfx.heal();
      this.shake(0.18);
    } else if (o.kind === 'shield_orb') {
      this.shieldOrbT = 6;
      this.text(o.x, o.y - 24, this.t().orb_shield, '#7af5ff', 20);
      this.ring(o.x, o.y, 150, '#7af5ff', 0.55, 6);
      this.ring(o.x, o.y, 90, '#ffffff', 0.35, 3);
      this.spark(o.x, o.y, 22, '#d6fbff', 360, 3.2);
      sfx.overcharge();
      this.shake(0.25);
    }
    this.emitHud();
  }

  private zapNearby(radius: number, dmg: number) {
    let hit = 0;
    // Blade Rush / Race have no beasts — the bolt smashes obstacles instead
    if (this.scrolling) {
      for (const o of this.obstacles) {
        if (o.dead) continue;
        const cy = o.y + o.h / 2;
        if (Math.abs(cy - this.py) > radius + 60) continue;
        const cx = o.kind === 'spike_block' ? o.x + o.w / 2 : this.W / 2;
        this.bolt(this.px, this.py, cx, cy, '#dffaff', 3, 20, 0.22);
        hit++;
        if (this.mode === 'rush') {
          // enough to shatter almost anything in the blast
          this.hurtObstacle(o, 99, '#79f2ff');
        } else {
          // Race mode can't destroy — briefly stun the lane instead
          o.gateOpen = true;
        }
      }
      this.ring(this.px, this.py, radius * 1.15, '#79f2ff', 0.5, 5);
      this.ring(this.px, this.py, radius * 0.55, '#ffffff', 0.25, 3);
      this.flash = Math.max(this.flash, 0.35);
      this.flashColor = '#c9f6ff';
      this.shake(0.45);
      sfx.blink();
      if (hit >= 2) this.text(this.px, this.py - 46, this.t().strike.replace('{n}', `${hit}`), '#ffd166', 20);
      return;
    }
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.state === 'spawn') continue;
      if (dist(e.x, e.y, this.px, this.py) < radius + e.r) {
        this.bolt(this.px, this.py, e.x, e.y, '#dffaff', 3, 20, 0.22);
        this.hurtEnemy(e, dmg, this.px, this.py, 280, true);
        hit++;
      }
    }
    this.ring(this.px, this.py, radius * 1.15, '#79f2ff', 0.5, 5);
    this.ring(this.px, this.py, radius * 0.55, '#ffffff', 0.25, 3);
    this.flash = Math.max(this.flash, 0.35);
    this.flashColor = '#c9f6ff';
    this.shake(0.45);
    this.hitStop = Math.max(this.hitStop, 0.04);
    sfx.blink();
    if (hit >= 3) this.text(this.px, this.py - 46, this.t().strike.replace('{n}', `${hit}`), '#ffd166', 20);
  }

  private updateWaves(dt: number) {
    if (this.waveBanner > 0) this.waveBanner -= dt;

    for (let i = this.marks.length - 1; i >= 0; i--) {
      const m = this.marks[i];
      m.t += dt;
      if (m.t >= m.dur) {
        this.spawnEnemy(m.kind, m.x, m.y);
        this.marks.splice(i, 1);
      }
    }

    if (this.intermission > 0) {
      this.intermission -= dt;
      if (this.intermission <= 0) this.startWave();
      return;
    }

    if (this.queue.length) {
      this.spawnCd -= dt;
      const cap = Math.min(7 + this.wave, 20);
      if (this.spawnCd <= 0 && this.enemies.length + this.marks.length < cap) {
        const kind = this.queue.shift()!;
        this.queueSpawn(kind);
        this.spawnCd = Math.max(0.18, 0.68 - this.wave * 0.028) * rand(1.25, 0.7);
      }
    } else if (!this.enemies.length && !this.marks.length) {
      // wave cleared
      const bonus = 250 * this.wave * (this.score2xT > 0 ? 2 : 1);
      this.score += bonus;
      this.text(this.px, this.py - 54, this.t().waveClear.replace('{n}', `${bonus}`), '#79f2ff', 22);
      this.timeScale = 0.35;
      this.intermission = 2.4;
      this.flash = 0.3;
      this.flashColor = '#79f2ff';
      this.emitHud();
    }
  }

  /**
   * Gems drift in occasionally across every mode. Only ever ONE on screen,
   * with a long enforced cooldown so they stay a treat rather than a shower.
   */
  private updateGems(dt: number) {
    if (this.gems.length === 0) {
      this.gemCd -= dt;
      if (this.gemCd <= 0) {
        let x = rand(this.W - 90, 90);
        let y = this.scrolling ? -50 : rand(this.H - 90, 90);
        for (let i = 0; i < 20 && !this.scrolling && dist(x, y, this.px, this.py) < 200; i++) {
          x = rand(this.W - 90, 90);
          y = rand(this.H - 90, 90);
        }
        this.gems.push({ x, y, t: 0, life: this.scrolling ? 999 : 16 });
        this.ring(x, y, 120, '#7af5ff', 0.5, 4);
        this.spark(x, y, 14, '#d6fbff', 260, 2.6);
        // 25–45s before the next one can even be considered
        this.gemCd = rand(45, 25);
      }
    }
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const g = this.gems[i];
      g.t += dt;
      if (this.scrolling) {
        g.y += this.raceSpeed * dt;
        if (g.y > this.H + 60) {
          this.gems.splice(i, 1);
          continue;
        }
      } else {
        g.life -= dt;
        if (g.life <= 0) {
          this.spark(g.x, g.y, 6, '#9fb4d8', 140, 2);
          this.gems.splice(i, 1);
          continue;
        }
      }
      if (dist(g.x, g.y, this.px, this.py) < this.pr + 30) {
        this.gemsCollected++;
        this.text(g.x, g.y - 34, '+1 GEM', '#7af5ff', 24);
        this.ring(g.x, g.y, 180, '#7af5ff', 0.6, 6);
        this.ring(g.x, g.y, 90, '#ffffff', 0.35, 3);
        this.spark(g.x, g.y, 26, '#d6fbff', 380, 3.2);
        this.flash = 0.3;
        this.flashColor = '#7af5ff';
        this.shake(0.3);
        sfx.gem();
        tgHaptic('success');
        this.gems.splice(i, 1);
        this.emitHud();
      }
    }
  }

  /**
   * Kill-streak combos: 5 kills inside 3s fires a combo, and each further
   * combo escalates the musical sting.
   */
  private bumpStreak() {
    this.streak++;
    this.streakT = 3;
    if (this.streak >= 5) {
      this.streak = 0;
      this.combosHit++;
      const lvl = Math.min(this.combosHit, 8);
      const bonus = 500 * lvl;
      this.score += bonus;
      this.text(this.px, this.py - 62, `${this.t().comboWord} ×${this.combosHit}  +${bonus}`, '#ffd166', 24);
      this.ring(this.px, this.py, 200 + lvl * 18, '#ffd166', 0.55, 5);
      this.ring(this.px, this.py, 110, '#ffffff', 0.3, 3);
      this.spark(this.px, this.py, 24 + lvl * 3, '#fff0b8', 400, 3.2);
      this.flash = 0.35;
      this.flashColor = '#ffd166';
      this.shake(0.45);
      this.onCombo?.(lvl);
      tgHaptic('success');
      this.emitHud();
    }
  }

  /** Race difficulty ramp 0..1 — gentle at the start, maxed around 20k score. */
  raceRamp() {
    return clamp(this.score / 20000, 0, 1);
  }

  /* ------------------------------------------------------- LEXICON MODE */

  /**
   * Per-phase budget: P1 7s · P2 11s · P3 15s · P4 11s.
   * After 10 solved words every timer is HALVED (7→3.5, 11→5.5, 15→7.5).
   * A correct letter refunds +2s, but only when 3s or less remain.
   */
  wordLimit() {
    let base: number;
    switch (this.wordPhase) {
      case 1:
        base = 7;
        break;
      case 2:
        base = 11;
        break;
      case 3:
        base = 15;
        break;
      default:
        base = 11;
    }
    return this.wordsDone >= 10 ? base / 2 : base;
  }

  /** True once the sudden-death halved timers kick in. */
  get wordHalved() {
    return this.wordsDone >= 10;
  }

  /** Pick the next word for the current phase; never repeats within a run. */
  nextWord() {
    const lang: 'en' | 'fa' = this.lang === 'fa' ? 'fa' : 'en';
    // phase 1→3 letters, 2→4, 3→5, 4→mixed 3..5
    const lens: WordLen[] = this.wordPhase >= 4 ? [3, 4, 5] : [(this.wordPhase + 2) as WordLen];
    let pool: string[] = [];
    for (const L of lens) pool.push(...wordPool(lang, L));
    pool = pool.filter((w) => !this.usedWords.has(w));
    if (!pool.length) {
      // exhausted — recycle so the run can continue forever
      this.usedWords.clear();
      for (const L of lens) pool.push(...wordPool(lang, L));
    }
    const word = pool[randInt(0, pool.length - 1)];
    this.usedWords.add(word);
    this.wordTarget = word;
    this.wordTyped = '';
    this.spawnLetters();
    this.wordTimer = 0;
    this.emitHud();
  }

  /** Find a well-spaced spot clear of the centre word, eraser, player and other letters. */
  private freeLetterSpot() {
    const margin = 90;
    let x = rand(this.W - margin, margin);
    let y = rand(this.H - margin, margin);
    for (let tries = 0; tries < 60; tries++) {
      const clearOfCentre = dist(x, y, this.W / 2, this.H / 2) > 170;
      const clearOfEraser = dist(x, y, this.eraser.x, this.eraser.y) > 120;
      const clearOfPlayer = dist(x, y, this.px, this.py) > 120;
      let clearOfLetters = true;
      for (const l of this.letters) {
        if (!l.taken && dist(l.x, l.y, x, y) < 118) {
          clearOfLetters = false;
          break;
        }
      }
      if (clearOfCentre && clearOfEraser && clearOfPlayer && clearOfLetters) break;
      x = rand(this.W - margin, margin);
      y = rand(this.H - margin, margin);
    }
    return { x, y };
  }

  private addLetter(ch: string, wanted: boolean, imposter = false) {
    const { x, y } = this.freeLetterSpot();
    this.letters.push({ id: this.nextId++, ch, x, y, t: 0, wanted, taken: false, imposter });
    this.ring(x, y, 70, imposter ? '#ff4d6d' : wanted ? this.mapSkin.borderOuter : '#9fb4d8', 0.35, 3);
    this.spark(x, y, 6, imposter ? '#ff8fa3' : this.mapSkin.sparkColor, 180, 2.2);
  }

  /** Two imposters are always on the board, mimicking letters the word needs. */
  private replenishImposters() {
    const live = this.letters.filter((l) => !l.taken && l.imposter).length;
    const chars = [...new Set(this.wordTarget.split(''))];
    if (!chars.length) return;
    for (let i = live; i < 2; i++) {
      this.addLetter(chars[randInt(0, chars.length - 1)], false, true);
    }
  }

  /** Scatter the needed letters plus decoys, well spaced and clear of the player. */
  spawnLetters() {
    this.letters.length = 0;
    // spawn one tile per LETTER OCCURRENCE, so "DOOR" gets two O's up front
    const need = this.wordTarget.split('');
    const alpha = alphabetFor(this.lang === 'fa' ? 'fa' : 'en').filter((c) => !this.wordTarget.includes(c));
    const decoyCount = clamp(2 + this.wordPhase, 2, 6);
    const picks: { ch: string; wanted: boolean }[] = [
      ...need.map((ch) => ({ ch, wanted: true })),
      ...Array.from({ length: decoyCount }, () => ({ ch: alpha[randInt(0, alpha.length - 1)], wanted: false })),
    ];
    // shuffle
    for (let i = picks.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }
    for (const p of picks) {
      const { x, y } = this.freeLetterSpot();
      this.letters.push({ id: this.nextId++, ch: p.ch, x, y, t: 0, wanted: p.wanted, taken: false });
    }
  }

  /**
   * Guarantee the board is always solvable.
   *
   * Every letter the word still needs must exist somewhere on the map — if you
   * grabbed the only "O" in DOOR, or erased a letter and its tile was gone,
   * a fresh one is spawned immediately. Also tops the decoys back up.
   */
  private replenishLetters() {
    if (!this.wordTarget) return;
    const remaining = this.wordTarget.slice(this.wordTyped.length);

    // COUNT, don't just check existence. "DOOR" needs TWO O's — a single O on
    // the map used to satisfy the check and soft-lock the board.
    const needCount = new Map<string, number>();
    for (const ch of remaining) needCount.set(ch, (needCount.get(ch) ?? 0) + 1);

    // Imposters must NOT count as available letters — they mimic needed glyphs
    // but can't be used, which was the other way the board dead-ended.
    const haveCount = new Map<string, number>();
    for (const l of this.letters) {
      if (l.taken || l.imposter) continue;
      haveCount.set(l.ch, (haveCount.get(l.ch) ?? 0) + 1);
    }

    for (const [ch, need] of needCount) {
      const have = haveCount.get(ch) ?? 0;
      for (let i = have; i < need && this.letters.length < 22; i++) this.addLetter(ch, true);
    }

    // keep a healthy number of decoys around (never counts imposters)
    const decoyTarget = clamp(2 + this.wordPhase, 2, 6);
    const decoys = this.letters.filter((l) => !l.taken && !l.imposter && !this.wordTarget.includes(l.ch)).length;
    const alpha = alphabetFor(this.lang === 'fa' ? 'fa' : 'en').filter((c) => !this.wordTarget.includes(c));
    for (let i = decoys; i < decoyTarget && this.letters.length < 22; i++) {
      this.addLetter(alpha[randInt(0, alpha.length - 1)], false);
    }
    this.replenishImposters();
  }

  /** Collect a letter — appends it to the attempt. */
  private takeLetter(l: LetterPickup) {
    l.taken = true;

    // IMPOSTER: mimics a needed glyph but punishes you
    if (l.imposter) {
      this.hp -= 1;
      this.hurtFlash = 1;
      this.wordTimer += 2.5; // burn the clock
      this.combo = 0;
      this.flash = 0.5;
      this.flashColor = '#ff4d6d';
      this.shake(0.6);
      this.ring(l.x, l.y, 150, '#ff4d6d', 0.5, 6);
      this.spark(l.x, l.y, 22, '#ff8fa3', 340, 3.2);
      this.chunks(l.x, l.y, 10, '#3d0c15', 260);
      this.text(l.x, l.y - 34, this.t().imposterHit, '#ff4d6d', 22);
      sfx.hurt();
      tgHaptic('error');
      this.emitHud();
      if (this.hp <= 0) {
        this.hp = 0;
        this.die();
      }
      return;
    }

    const correct = this.wordTarget[this.wordTyped.length] === l.ch;
    this.wordTyped += l.ch;
    this.spark(l.x, l.y, 12, correct ? '#7dffb2' : '#ff8a3d', 280, 2.6);
    this.ring(l.x, l.y, 90, correct ? '#7dffb2' : '#ff8a3d', 0.4, 4);
    this.text(l.x, l.y - 30, l.ch, correct ? '#7dffb2' : '#ff8a3d', 26);
    // a correct letter buys 2 more seconds — but ONLY as a clutch save,
    // when 3s or less remain. No stockpiling time on an easy word.
    if (correct) {
      const left = this.wordLimit() - this.wordTimer;
      if (left <= 3) {
        this.wordTimer = Math.max(0, this.wordTimer - 2);
        this.text(l.x, l.y - 58, '+2s', '#7dffb2', 18);
        this.ring(l.x, l.y, 130, '#7dffb2', 0.35, 3);
        sfx.heal();
      }
    }
    sfx.pickup();
    tgHaptic(correct ? 'light' : 'rigid');
    this.shake(correct ? 0.14 : 0.28);
    if (!correct) {
      this.flash = 0.25;
      this.flashColor = '#ff8a3d';
    }

    if (this.wordTyped === this.wordTarget) {
      this.completeWord();
    } else if (this.wordTyped.length >= this.wordTarget.length) {
      // filled every slot but it's wrong — slash the rune to fix it,
      // or run the clock down and a fresh word will be dealt
      this.wordBannerText = this.t().wordWrong;
      this.wordBannerColor = '#ff4d6d';
      this.wordBanner = 1.8;
      this.flash = 0.35;
      this.flashColor = '#ff4d6d';
      this.shake(0.35);
      sfx.hurt();
      tgHaptic('error');
    }
    this.emitHud();
  }

  private completeWord() {
    const len = this.wordTarget.length;
    // score comes only from solving: base by length, bonus for time left, phase bonus
    const left = Math.max(0, this.wordLimit() - this.wordTimer);
    const speedBonus = Math.round(left * 60);
    const gain = 500 * len + speedBonus + this.wordPhase * 250;
    this.score += gain;
    this.wordsDone++;
    this.wordsInPhase++;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.comboTimer = 8;

    this.wordBannerText = `${this.wordTarget}  +${gain}`;
    this.wordBannerColor = '#7dffb2';
    this.wordBanner = 2;

    // hitting 10 solves halves every timer from here on — make it loud
    if (this.wordsDone === 10) {
      this.wordBannerText = this.t().wordHalved;
      this.wordBannerColor = '#ff4d6d';
      this.wordBanner = 2.8;
      this.flash = 0.55;
      this.flashColor = '#ff4d6d';
      this.shake(0.7);
      this.ring(this.W / 2, this.H / 2, 340, '#ff4d6d', 0.7, 7);
      sfx.overcharge();
      tgHaptic('error');
    }
    this.text(this.W / 2, this.H / 2 - 70, this.t().wordSolved, '#7dffb2', 26);
    this.ring(this.W / 2, this.H / 2, 260, '#7dffb2', 0.6, 6);
    this.ring(this.W / 2, this.H / 2, 150, '#ffffff', 0.35, 3);
    this.spark(this.W / 2, this.H / 2, 34, '#bfffe0', 420, 3.2);
    this.flash = 0.4;
    this.flashColor = '#7dffb2';
    this.shake(0.5);
    sfx.overcharge();
    tgHaptic('success');

    // 5 words per phase, then advance (phase 4 loops forever)
    if (this.wordsInPhase >= 5 && this.wordPhase < 4) {
      this.wordPhase++;
      this.wordsInPhase = 0;
      this.startWordPhase();
    } else {
      this.letters.length = 0;
      this.wordTyped = '';
      this.intermission = 1.1;
    }
    this.emitHud();
  }

  /** Enter a phase: each phase has its OWN fixed arena (1→map1, 2→map2, ...). */
  startWordPhase() {
    const map = MAP_SKINS[(this.wordPhase - 1) % MAP_SKINS.length];
    this.mapSkin = map;
    this.onMapChange?.(map);
    this.wordBannerText = this.t().phaseBanner
      .replace('{n}', `${this.wordPhase}`)
      .replace('{len}', this.wordPhase >= 4 ? '3-5' : `${this.wordPhase + 2}`)
      .replace('{map}', map.name);
    this.wordBannerColor = map.borderOuter;
    this.wordBanner = 2.6;
    this.letters.length = 0;
    this.wordTyped = '';
    this.intermission = 1.6;
    sfx.wave();
    this.flash = 0.3;
    this.flashColor = '#79f2ff';
  }

  /** Slash the eraser rune to delete the last collected letter. */
  eraseLetter() {
    if (!this.wordTyped.length) return;
    this.wordTyped = this.wordTyped.slice(0, -1);
    this.eraser.flash = 1;
    this.ring(this.eraser.x, this.eraser.y, 120, '#ff4d6d', 0.45, 5);
    this.spark(this.eraser.x, this.eraser.y, 18, '#ff9ec4', 320, 3);
    this.text(this.eraser.x, this.eraser.y - 46, this.t().wordErased, '#ff4d6d', 20);
    sfx.slash();
    tgHaptic('medium');
    this.shake(0.3);
    this.emitHud();
  }

  private updateWordMode(dt: number) {
    this.wordTimer += dt;
    this.eraser.t += dt;
    this.eraser.flash = Math.max(0, this.eraser.flash - dt * 3);
    if (this.wordBanner > 0) this.wordBanner -= dt;

    if (this.intermission > 0) {
      this.intermission -= dt;
      if (this.intermission <= 0) this.nextWord();
      return;
    }
    if (!this.wordTarget) {
      this.nextWord();
      return;
    }

    // NOTE: no idle score in Lexicon — points come only from solving words.

    // each word is on a timer — running out costs a heart
    const limit = this.wordLimit();
    if (this.wordTimer > limit) {
      this.wordTimer = 0;
      this.wordsFailed++;
      this.hp -= 1;
      this.hurtFlash = 1;
      this.combo = 0;
      this.flash = 0.5;
      this.flashColor = '#ff4d6d';
      this.shake(0.6);
      this.ring(this.W / 2, this.H / 2, 300, '#ff4d6d', 0.5, 6);
      this.wordBannerText = this.t().wordTimeout;
      this.wordBannerColor = '#ff4d6d';
      this.wordBanner = 1.8;
      sfx.hurt();
      tgHaptic('error');
      this.emitHud();
      if (this.hp <= 0) {
        this.hp = 0;
        this.die();
        return;
      }
      // failed — move on to a brand-new word rather than repeating it
      this.letters.length = 0;
      this.wordTyped = '';
      this.wordTarget = '';
      this.intermission = 1.1;
    }

    for (const l of this.letters) {
      if (l.taken) continue;
      l.t += dt;
      if (dist(l.x, l.y, this.px, this.py) < this.pr + 30) this.takeLetter(l);
    }
    // clean up consumed letters
    for (let i = this.letters.length - 1; i >= 0; i--) if (this.letters[i].taken) this.letters.splice(i, 1);
    // and make sure the board can always be finished
    if (this.wordTarget) this.replenishLetters();
  }

  /** Blades rain into the lane in Blade Rush; grab one to swap. */
  private updateBladeDrops(dt: number) {
    this.bladeDropCd -= dt;
    if (this.bladeDropCd <= 0 && this.bladeDrops.length < 2) {
      const pool = RUSH_BLADES.filter((b) => b.id !== this.rushBlade.id);
      const pick = pool[randInt(0, pool.length - 1)];
      let x = rand(this.W - 90, 90);
      let tries = 0;
      // avoid dropping into a wall segment or on top of another blade
      while (tries++ < 20) {
        let ok = true;
        for (const d of this.bladeDrops) if (Math.abs(d.x - x) < 150) ok = false;
        for (const ob of this.obstacles) {
          if (ob.y > -220 && ob.y < 60) {
            if (ob.kind === 'wall_gap' || ob.kind === 'crusher_row') {
              if (!(x > ob.gapX + 30 && x < ob.gapX + ob.gapW - 30)) ok = false;
            } else if (ob.kind === 'spike_block' && x + 26 > ob.x && x - 26 < ob.x + ob.w) ok = false;
          }
        }
        if (ok) break;
        x = rand(this.W - 90, 90);
      }
      this.bladeDrops.push({ id: pick.id, x, y: -60, t: 0 });
      this.bladeDropCd = rand(11, 7);
    }
    for (let i = this.bladeDrops.length - 1; i >= 0; i--) {
      const d = this.bladeDrops[i];
      d.t += dt;
      d.y += this.raceSpeed * dt;
      if (d.y > this.H + 60) {
        this.bladeDrops.splice(i, 1);
        continue;
      }
      if (dist(d.x, d.y, this.px, this.py) < this.pr + 26) {
        this.equipRushBlade(d.id);
        this.bladeDrops.splice(i, 1);
      }
    }
  }

  equipRushBlade(id: string) {
    const b = rushBladeById(id);
    this.rushBlade = b;
    this.onBladeChange?.(b);
    this.sw.maxDist = clamp(Math.min(this.W, this.H) * 0.62, 260, 520) * b.reach;
    this.text(this.px, this.py - 44, this.t().pickedBlade.replace('{n}', b.name), b.glow, 20);
    this.ring(this.px, this.py, 120, b.glow, 0.45, 5);
    this.spark(this.px, this.py, 20, b.glow, 340, 3);
    this.flash = 0.25;
    this.flashColor = b.glow;
    sfx.catchSword();
    tgHaptic('medium');
    this.shake(0.22);
    this.emitHud();
  }

  /**
   * Apply the equipped blade's elemental rider on hit.
   * These previously existed only as flavour text — now they actually fire.
   */
  private applyElement(e: Enemy, dmg: number) {
    const el = this.swordPower.element ?? 'none';
    if (el === 'none') return;
    if (el === 'poison') {
      e.poisonT = this.swordPower.poison || 4;
      e.poisonDmg = Math.max(0.5, dmg * 0.22);
      this.motes(e.x, e.y, 3, '#80ff52', 60, 6);
    } else if (el === 'burn') {
      e.burnT = this.swordPower.burn || 3;
      e.burnDmg = Math.max(0.6, dmg * 0.3);
      this.motes(e.x, e.y, 3, '#ff8a3d', 70, 6);
    } else if (el === 'frost') {
      // FROST blades lock the beast solid for a tiered duration
      const fz = this.swordPower.freeze || 0;
      if (fz > 0) {
        e.frozenT = Math.max(e.frozenT ?? 0, fz);
        e.vx = 0;
        e.vy = 0;
        this.ring(e.x, e.y, e.r * 3, '#bfe9ff', 0.35, 3);
      }
      e.chillT = Math.max(e.chillT ?? 0, fz + 1.2);
      this.spark(e.x, e.y, 6, '#bfe9ff', 150, 2.2);
    } else if (el === 'shock') {
      // arcs to one nearby beast
      let best: Enemy | null = null;
      let bd = 190;
      for (const o of this.enemies) {
        if (o.hp <= 0 || o.id === e.id) continue;
        const d = dist(o.x, o.y, e.x, e.y);
        if (d < bd) {
          bd = d;
          best = o;
        }
      }
      if (best) {
        this.bolt(e.x, e.y, best.x, best.y, '#bff6ff', 2.4, 18, 0.16);
        best.hp -= dmg * 0.45;
        best.hitFlash = 1;
        if (best.hp <= 0) this.killEnemy(best);
      }
    } else if (el === 'void') {
      // VOID SINGULARITY — rips every nearby beast toward the impact point.
      // Knockback is CLEARED first, otherwise it cancelled the pull entirely
      // (that's why this ability appeared to do nothing).
      const cx = e.x;
      const cy = e.y;
      let pulled = 0;
      for (const o of this.enemies) {
        if (o.hp <= 0 || o.state === 'spawn') continue;
        const d = dist(o.x, o.y, cx, cy);
        if (d > 260) continue;
        const a = Math.atan2(cy - o.y, cx - o.x);
        const force = 520 * (1 - d / 260) + 220;
        o.vx = Math.cos(a) * force;
        o.vy = Math.sin(a) * force;
        pulled++;
        if (o.id !== e.id) {
          o.hp -= dmg * 0.3;
          o.hitFlash = 1;
          if (o.hp <= 0) this.killEnemy(o);
        }
      }
      this.ring(cx, cy, 260, '#d46bff', 0.45, 5);
      this.ring(cx, cy, 120, '#ffffff', 0.28, 3);
      this.motes(cx, cy, 8, '#d46bff', 90, 7);
      if (pulled > 1) this.shake(0.2);
    } else if (el === 'holy') {
      // HOLY SMITE — a pillar of light lands on the target for bonus damage,
      // splashing anything beside it. Heals you on a big smite.
      const bonus = dmg * 0.75;
      e.hp -= bonus;
      this.bolt(e.x, e.y - 260, e.x, e.y, '#fff3cd', 6, 8, 0.22);
      this.bolt(e.x, e.y - 260, e.x, e.y, '#ffffff', 2.5, 4, 0.22);
      this.ring(e.x, e.y, 120, '#fff3cd', 0.4, 4);
      this.spark(e.x, e.y, 14, '#fff8dc', 300, 2.8);
      let splashed = 0;
      for (const o of this.enemies) {
        if (o.hp <= 0 || o.id === e.id) continue;
        if (dist(o.x, o.y, e.x, e.y) < 110) {
          o.hp -= bonus * 0.5;
          o.hitFlash = 1;
          splashed++;
          if (o.hp <= 0) this.killEnemy(o);
        }
      }
      if (splashed >= 2 && this.hp < this.maxHp && Math.random() < 0.35) {
        this.hp++;
        this.text(this.px, this.py - 34, this.t().plusHp, '#7dffb2', 16);
        sfx.heal();
        this.emitHud();
      }
      if (e.hp <= 0) this.killEnemy(e);
    }
  }

  /** Shockwave released when an AOE blade is thrown (stacks with TRI-BLADE). */
  throwBurst(x: number, y: number, r: number) {
    const col = this.mapSkin.sparkColor;
    this.ring(x, y, r, '#ffffff', 0.3, 4);
    this.ring(x, y, r * 1.3, col, 0.42, 3);
    this.spark(x, y, 16, col, 320, 2.8);
    this.shake(0.18);
    const dmg = this.dmg(1.5);
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.state === 'spawn') continue;
      if (dist(e.x, e.y, x, y) < r + e.r) this.hurtEnemy(e, dmg, x, y, 180);
    }
  }

  /** Drop a burning lava pool (magma blades, on blink). */
  spawnLava(x: number, y: number, secs: number) {
    this.lavaPools.push({ x, y, r: 82, life: secs, max: secs, tick: 0, color: '#ff5c38' });
    this.ring(x, y, 100, '#ff5c38', 0.45, 5);
    this.spark(x, y, 16, '#ff8a3d', 300, 3);
    sfx.hit();
  }

  private updateLava(dt: number) {
    for (let i = this.lavaPools.length - 1; i >= 0; i--) {
      const p = this.lavaPools[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.lavaPools.splice(i, 1);
        continue;
      }
      if (Math.random() < dt * 22) {
        const a = Math.random() * TAU;
        const rr = Math.random() * p.r;
        this.motes(p.x + Math.cos(a) * rr, p.y + Math.sin(a) * rr, 1, '#ff8a3d', 40, 7);
      }
      p.tick += dt;
      if (p.tick >= 0.35) {
        p.tick = 0;
        const dmg = this.dmg(1.2);
        for (const e of this.enemies) {
          if (e.hp <= 0 || e.state === 'spawn') continue;
          if (dist(e.x, e.y, p.x, p.y) < p.r + e.r) {
            e.hp -= dmg;
            e.hitFlash = Math.max(e.hitFlash, 0.6);
            e.burnT = Math.max(e.burnT ?? 0, 1.5);
            e.burnDmg = Math.max(e.burnDmg ?? 0, dmg * 0.3);
            this.spark(e.x, e.y, 2, '#ff8a3d', 120, 2);
            if (e.hp <= 0) this.killEnemy(e);
          }
        }
        // in Blade Rush the lava chews through obstacles too
        if (this.mode === 'rush') {
          for (const o of this.obstacles) {
            if (o.dead) continue;
            if (p.y + p.r > o.y && p.y - p.r < o.y + o.h) this.hurtObstacle(o, 1, '#ff8a3d');
          }
        }
      }
    }
  }

  /** Tick DoTs + the passive damaging aura of high-end blades. */
  private updateElemental(dt: number) {
    const auraR = this.swordPower.aura ?? 0;
    for (const e of this.enemies) {
      if (e.hp <= 0) continue;
      e.tickT = (e.tickT ?? 0) + dt;
      const tick = e.tickT >= 0.5;
      if (tick) e.tickT = 0;
      if (e.poisonT && e.poisonT > 0) {
        e.poisonT -= dt;
        if (tick) {
          e.hp -= e.poisonDmg ?? 1;
          this.motes(e.x, e.y, 1, '#80ff52', 40, 5);
          if (e.hp <= 0) {
            this.killEnemy(e);
            continue;
          }
        }
      }
      if (e.burnT && e.burnT > 0) {
        e.burnT -= dt;
        if (tick) {
          e.hp -= e.burnDmg ?? 1;
          this.motes(e.x, e.y, 1, '#ff8a3d', 50, 5);
          if (e.hp <= 0) {
            this.killEnemy(e);
            continue;
          }
        }
      }
      if (e.frozenT && e.frozenT > 0) {
        e.frozenT -= dt;
        e.vx = 0;
        e.vy = 0;
        if (Math.random() < dt * 6) this.spark(e.x, e.y, 1, '#dff3ff', 40, 2);
      } else if (e.chillT && e.chillT > 0) {
        e.chillT -= dt;
        e.vx *= 1 - 2.4 * dt;
        e.vy *= 1 - 2.4 * dt;
        if (Math.random() < dt * 3) this.spark(e.x, e.y, 1, '#bfe9ff', 40, 1.8);
      }
      if (auraR > 0 && tick && dist(e.x, e.y, this.px, this.py) < auraR) {
        e.hp -= Math.max(0.5, this.swordPower.dmg * 0.4);
        e.hitFlash = Math.max(e.hitFlash, 0.5);
        this.spark(e.x, e.y, 2, '#ffe9a8', 120, 2);
        if (e.hp <= 0) this.killEnemy(e);
      }
    }
  }

  /** Sweep the thrown blade against every obstacle it crosses. */
  private bladeHitObstacles(_px: number, py: number, sx: number, sy: number, hits: Set<number>) {
    const b = this.rushBlade;
    const fx = b.glow;
    for (const o of this.obstacles) {
      if (o.dead || hits.has(o.id)) continue;
      const top = o.y;
      const bot = o.y + o.h;
      // did the blade sweep across this obstacle's band this frame?
      const crossed = Math.min(py, sy) < bot + 14 && Math.max(py, sy) > top - 14;
      if (!crossed) continue;
      let inside = false;
      if (o.kind === 'wall_gap' || o.kind === 'crusher_row') {
        inside = !(sx > o.gapX + 10 && sx < o.gapX + o.gapW - 10);
      } else if (o.kind === 'laser_gate') {
        inside = !o.gateOpen;
      } else {
        inside = sx + 12 > o.x && sx - 12 < o.x + o.w;
      }
      if (!inside) continue;
      hits.add(o.id);
      // MIGHT orb boosts obstacle damage too
      this.hurtObstacle(o, b.obstacleDmg * (this.mightT > 0 ? 1.5 : 1), fx);
    }
  }

  /** Damage an obstacle in Blade Rush; returns true if it shattered. */
  hurtObstacle(o: Obstacle, dmg: number, fx: string) {
    if (this.mode !== 'rush' || o.dead) return false;
    o.hp = (o.hp ?? 1) - dmg;
    o.flash = 1;
    this.spark((o.kind === 'spike_block' ? o.x + o.w / 2 : this.sw.x), o.y + o.h / 2, 8, fx, 280, 2.6);
    sfx.hit();
    if (o.hp <= 0) {
      o.dead = true;
      this.obstaclesBroken++;
      const mult = (this.score2xT > 0 ? 2 : 1) * (this.hyperSpeedT > 0 ? 2.5 : 1);
      const gain = Math.round(150 * mult);
      this.score += gain;
      this.text(o.kind === 'spike_block' ? o.x + o.w / 2 : this.W / 2, o.y, `${gain}`, fx, 18);
      this.ring(o.kind === 'spike_block' ? o.x + o.w / 2 : this.W / 2, o.y + o.h / 2, 150, fx, 0.45, 5);
      this.chunks(o.kind === 'spike_block' ? o.x + o.w / 2 : this.W / 2, o.y + o.h / 2, 16, this.mapSkin.chunkColor, 320);
      this.spark(o.kind === 'spike_block' ? o.x + o.w / 2 : this.W / 2, o.y + o.h / 2, 22, fx, 380, 3.2);
      this.shake(0.4);
      this.hitStop = Math.max(this.hitStop, 0.05);
      sfx.kill();
      tgHaptic('rigid');
      this.emitHud();
      return true;
    }
    this.shake(0.12);
    return false;
  }

  private updateRace(dt: number) {
    // slow, readable start → very fast at high scores (eased so it builds smoothly)
    const ramp = this.raceRamp();
    const baseSpeed = 150 + Math.pow(ramp, 1.35) * 480 + Math.max(0, this.score - 20000) / 900;
    // FROST orb freezes the whole lane solid; hyper/slow scale it otherwise
    const obsMult = this.freezeT > 0 ? 0 : this.hyperSpeedT > 0 ? 1.6 : this.slowMoT > 0 ? 0.5 : 1.0;
    const scoreMult = (this.score2xT > 0 ? 2 : 1) * (this.hyperSpeedT > 0 ? 2.5 : 1.0);
    this.raceSpeed = baseSpeed * obsMult;
    this.scrollOffset += this.raceSpeed * dt;
    this.score += dt * (190 + baseSpeed * 0.5) * scoreMult;

    const newSector = Math.floor(this.score / 3000) + 1;
    if (newSector > this.sector) {
      this.sector = newSector;
      const otherMaps = MAP_SKINS.filter((m) => m.id !== this.mapSkin.id);
      const nextMap = otherMaps[randInt(0, otherMaps.length - 1)] || MAP_SKINS[0];
      this.mapSkin = nextMap;
      this.onMapChange?.(nextMap);
      this.waveBannerText = this.t().sectorBanner.replace('{n}', `${this.sector}`).replace('{map}', nextMap.name);
      this.waveBanner = 2.4;
      sfx.wave();
      tgHaptic('medium');
    }

    // FROST freezes the lane — pause spawning too, otherwise obstacles pile up
    // off-screen above the view and dump out in a wall when it wears off.
    if (this.freezeT <= 0) {
      this.obstacleCd -= dt;
      if (this.obstacleCd <= 0) {
        // never let more than 2 obstacles sit stacked above the screen
        const offscreen = this.obstacles.filter((o) => !o.dead && o.y < 0).length;
        if (offscreen < 2) {
          this.spawnObstacle();
          // spacing shrinks with the ramp but keeps a safe reaction window
          const gap = lerp(2.1, 0.85, ramp);
          this.obstacleCd = gap * rand(1.15, 0.8);
        } else {
          this.obstacleCd = 0.25;
        }
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i];
      o.y += this.raceSpeed * dt;
      if (o.flash) o.flash = Math.max(0, o.flash - dt * 5);
      // shattered obstacles are inert — clear them out
      if (o.dead) {
        if (o.y > this.H + 120) this.obstacles.splice(i, 1);
        continue;
      }
      if (o.kind === 'laser_gate') {
        o.gateT = (o.gateT! + dt) % o.gatePeriod!;
        o.gateOpen = o.gateT < o.gatePeriod! * 0.48;
      }
      if (!o.passed && o.y > this.py) {
        o.passed = true;
        this.obstaclesDodged++;
        const scoreMult = (this.score2xT > 0 ? 2 : 1) * (this.hyperSpeedT > 0 ? 2.5 : 1.0);
        this.score += 100 * scoreMult;
        sfx.pickup();
      }
      // collision check with player
      if (this.iframes <= 0 && this.state === 'playing') {
        let hit = false;
        if (o.kind === 'wall_gap') {
          if (this.py + this.pr > o.y && this.py - this.pr < o.y + o.h) {
            if (!(this.px > o.gapX + 16 && this.px < o.gapX + o.gapW - 16)) hit = true;
          }
        } else if (o.kind === 'laser_gate') {
          if (!o.gateOpen && this.py + this.pr > o.y && this.py - this.pr < o.y + o.h) hit = true;
        } else {
          // spike_block or crusher_row
          if (
            this.px + this.pr > o.x &&
            this.px - this.pr < o.x + o.w &&
            this.py + this.pr > o.y &&
            this.py - this.pr < o.y + o.h
          ) {
            hit = true;
          }
        }
        if (hit) {
          this.hurtPlayer(1, o.x + o.w / 2, o.y);
          this.shake(0.45);
        }
      }
      if (o.y > this.H + 120) {
        this.obstacles.splice(i, 1);
      }
    }
    this.updateOrbs(dt);
  }

  private spawnObstacle() {
    const kinds: ObstacleKind[] = ['wall_gap', 'laser_gate', 'spike_block', 'crusher_row'];
    const kind = kinds[randInt(0, kinds.length - 1)];
    const id = this.nextId++;
    const y = -80;
    // Blade Rush: obstacles are destructible and toughen as you climb
    const hp = this.mode === 'rush' ? Math.round((kind === 'spike_block' ? 3 : 5) * (1 + this.raceRamp() * 1.6)) : 0;
    if (kind === 'wall_gap') {
      const gapW = rand(240, 170);
      const gapX = rand(this.W - gapW - 80, 80);
      this.obstacles.push({ id, kind, x: 0, y, w: this.W, h: 36, gapX, gapW, passed: false, hp, maxHp: hp, flash: 0 });
    } else if (kind === 'laser_gate') {
      const gatePeriod = rand(2.2, 1.4);
      this.obstacles.push({ id, kind, x: 0, y, w: this.W, h: 28, gapX: 0, gapW: 0, gateOpen: false, gateT: 0, gatePeriod, passed: false, hp, maxHp: hp, flash: 0 });
    } else if (kind === 'spike_block') {
      const w = rand(320, 200);
      const x = rand(this.W - w - 50, 50);
      this.obstacles.push({ id, kind, x, y, w, h: 46, gapX: 0, gapW: 0, passed: false, hp, maxHp: hp, flash: 0 });
    } else {
      // crusher_row (leaves one side open)
      const openLeft = Math.random() < 0.5;
      const gapW = rand(280, 220);
      const gapX = openLeft ? 40 : this.W - gapW - 40;
      this.obstacles.push({ id, kind, x: 0, y, w: this.W, h: 42, gapX, gapW, passed: false, hp, maxHp: hp, flash: 0 });
    }
  }

  private stepFx(dt: number) {
    if (this.timeScale < 1) this.timeScale = Math.min(1, this.timeScale + dt * (this.state === 'over' ? 0.5 : 1.6));

    const ps = this.particles;
    for (let i = ps.length - 1; i >= 0; i--) {
      const p = ps[i];
      p.life -= dt;
      if (p.life <= 0) {
        ps.splice(i, 1);
        continue;
      }
      const dr = 1 - p.drag * dt;
      p.vx *= dr;
      p.vy *= dr;
      p.vy += p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      if (r.life <= 0) this.rings.splice(i, 1);
      else r.r = r.maxR * (1 - Math.pow(1 - (1 - r.life / r.max), 3));
    }
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      this.bolts[i].life -= dt;
      if (this.bolts[i].life <= 0) this.bolts.splice(i, 1);
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y += t.vy * dt;
      t.vy *= 1 - 2.4 * dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
    for (let i = this.blinkGhosts.length - 1; i >= 0; i--) {
      this.blinkGhosts[i].life -= dt;
      if (this.blinkGhosts[i].life <= 0) this.blinkGhosts.splice(i, 1);
    }
  }
}
