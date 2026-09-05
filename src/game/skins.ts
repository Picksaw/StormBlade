/** Cosmetic + power catalog — heroes (31 skins), blades (31 skins), and arenas (5 maps). */

export interface HeroSkin {
  id: string;
  name: string;
  cost: number;
  armor: number; // incoming damage reduced by this amount
  extraHp: number; // bonus max HP
  speedMult: number; // movement speed multiplier
  main: string; // aura, outline, charge ring
  body: string;
  hood: string;
  cape: string;
  eyes: string;
  sigil: string;
  dust: string;
}

export const HERO_SKINS: HeroSkin[] = [
  { id: 'storm', name: 'Stormborn', cost: 0, armor: 0, extraHp: 0, speedMult: 1.0, main: '#79f2ff', body: '#0f1838', hood: '#1b2a5e', cape: '#16224d', eyes: '#c9fbff', sigil: '#79f2ff', dust: '#5b7bff' },
  { id: 'dune', name: 'Dune Nomad', cost: 90, armor: 0, extraHp: 0, speedMult: 1.08, main: '#ffd166', body: '#2b2110', hood: '#543e18', cape: '#3a2d12', eyes: '#fff1c7', sigil: '#ffca52', dust: '#e5b244' },
  { id: 'ember', name: 'Ember Monk', cost: 160, armor: 1, extraHp: 0, speedMult: 1.0, main: '#ff8a3d', body: '#241009', hood: '#45200f', cape: '#33170c', eyes: '#ffddb0', sigil: '#ffb36b', dust: '#ff7a3d' },
  { id: 'forest-scout', name: 'Forest Scout', cost: 200, armor: 1, extraHp: 0, speedMult: 1.10, main: '#70e060', body: '#112918', hood: '#234d2f', cape: '#1b3b24', eyes: '#ccffe6', sigil: '#89ff73', dust: '#5cd66b' },
  { id: 'verdant', name: 'Verdant Shade', cost: 240, armor: 1, extraHp: 0, speedMult: 1.0, main: '#6dffb0', body: '#0b2015', hood: '#143a26', cape: '#0e2c1d', eyes: '#c8ffe3', sigil: '#7dffb2', dust: '#3ddc84' },
  { id: 'bronze-knight', name: 'Bronze Knight', cost: 290, armor: 2, extraHp: 0, speedMult: 1.0, main: '#ffae52', body: '#2e1c0d', hood: '#543317', cape: '#3d2613', eyes: '#ffeacc', sigil: '#ffca73', dust: '#d98638' },
  { id: 'crimson', name: 'Crimson Oath', cost: 340, armor: 2, extraHp: 0, speedMult: 1.05, main: '#ff4d6d', body: '#240912', hood: '#43101f', cape: '#320c18', eyes: '#ffc9d6', sigil: '#ff6b8a', dust: '#ff2e55' },
  { id: 'azure-ronin', name: 'Azure Ronin', cost: 390, armor: 2, extraHp: 0, speedMult: 1.06, main: '#4da6ff', body: '#0d1e33', hood: '#1d395c', cape: '#152b47', eyes: '#d6f0ff', sigil: '#73c2ff', dust: '#3388e6' },
  { id: 'frost', name: 'Frost Warden', cost: 450, armor: 2, extraHp: 0, speedMult: 1.0, main: '#bfe9ff', body: '#101c2c', hood: '#1e3350', cape: '#172a42', eyes: '#eaf7ff', sigil: '#cfeeff', dust: '#7fc4ff' },
  { id: 'desert-falcon', name: 'Desert Falcon', cost: 510, armor: 2, extraHp: 0, speedMult: 1.12, main: '#ffe066', body: '#2d2512', hood: '#574823', cape: '#40351a', eyes: '#ffffff', sigil: '#fff299', dust: '#d9bd38' },
  { id: 'shadow', name: 'Shadow Stalker', cost: 580, armor: 2, extraHp: 0, speedMult: 1.14, main: '#ad87ff', body: '#110b24', hood: '#24164a', cape: '#1a1036', eyes: '#ebdfff', sigil: '#c5a8ff', dust: '#8f68e8' },
  { id: 'jade-warrior', name: 'Jade Warrior', cost: 650, armor: 3, extraHp: 0, speedMult: 1.02, main: '#4df59f', body: '#0a2618', hood: '#184f33', cape: '#123824', eyes: '#d1ffe8', sigil: '#7effbe', dust: '#39c77d' },
  { id: 'royal', name: 'Royal Arcanist', cost: 720, armor: 3, extraHp: 0, speedMult: 1.0, main: '#c9a6ff', body: '#190f33', hood: '#2d1a5c', cape: '#221346', eyes: '#efe2ff', sigil: '#d8baff', dust: '#a97bff' },
  { id: 'cyber-ninja', name: 'Cyber Ninja', cost: 800, armor: 3, extraHp: 0, speedMult: 1.15, main: '#00ffcc', body: '#071f26', hood: '#123e4a', cape: '#0d2b33', eyes: '#c2ffff', sigil: '#5effe3', dust: '#00cc99' },
  { id: 'valkyrie', name: 'Storm Valkyrie', cost: 880, armor: 3, extraHp: 0, speedMult: 1.08, main: '#7af5ff', body: '#10223b', hood: '#1e406b', cape: '#152d4c', eyes: '#ffffff', sigil: '#a3fcff', dust: '#4dbfd9' },
  { id: 'magma-lord', name: 'Magma Lord', cost: 990, armor: 3, extraHp: 0, speedMult: 1.04, main: '#ff482b', body: '#2b0d08', hood: '#571c12', cape: '#3d140d', eyes: '#ffdcd6', sigil: '#ff7761', dust: '#d93116' },
  { id: 'titan', name: 'Obsidian Titan', cost: 1100, armor: 4, extraHp: 0, speedMult: 0.98, main: '#ff5e3a', body: '#171110', hood: '#332320', cape: '#241816', eyes: '#ffcdb8', sigil: '#ff7859', dust: '#cc4629' },
  { id: 'phantom-king', name: 'Phantom King', cost: 1250, armor: 4, extraHp: 0, speedMult: 1.10, main: '#b86bff', body: '#1c0f2b', hood: '#381e57', cape: '#2b1642', eyes: '#f4e8ff', sigil: '#d29bff', dust: '#974dd9' },
  { id: 'sovereign', name: 'Astral Sovereign', cost: 1400, armor: 4, extraHp: 0, speedMult: 1.12, main: '#ffe17d', body: '#1f1636', hood: '#453178', cape: '#312354', eyes: '#ffffff', sigil: '#ffea9f', dust: '#d9a738' },
  { id: 'solar-paladin', name: 'Solar Paladin', cost: 1580, armor: 4, extraHp: 0, speedMult: 1.08, main: '#ffb833', body: '#332107', hood: '#66440f', cape: '#4d330b', eyes: '#fff6e6', sigil: '#ffcf73', dust: '#d9941a' },
  // Mix-colored & High-end Heroes
  { id: 'prism-monk', name: 'Prism Monk', cost: 1780, armor: 4, extraHp: 0, speedMult: 1.15, main: '#00f7ff', body: '#1a0d2b', hood: '#ff4d88', cape: '#1b3b5e', eyes: '#ffe66d', sigil: '#7aff8a', dust: '#b86bff' },
  { id: 'aurora-strider', name: 'Aurora Strider', cost: 2000, armor: 5, extraHp: 0, speedMult: 1.12, main: '#5effb3', body: '#0a1d2b', hood: '#855eff', cape: '#1a3d42', eyes: '#ffffff', sigil: '#ff66c4', dust: '#5effb3' },
  { id: 'chaos-wraith', name: 'Chaos Wraith', cost: 2250, armor: 5, extraHp: 0, speedMult: 1.18, main: '#ff3d6e', body: '#1a0c10', hood: '#ffaa00', cape: '#33111b', eyes: '#00ffcc', sigil: '#ff3d6e', dust: '#ffaa00' },
  { id: 'nebula-templar', name: 'Nebula Templar', cost: 2500, armor: 5, extraHp: 0, speedMult: 1.10, main: '#be66ff', body: '#0f1133', hood: '#66e2ff', cape: '#22184f', eyes: '#ffea9f', sigil: '#ff66b3', dust: '#66e2ff' },
  { id: 'hyper-vanguard', name: 'Hyper Vanguard', cost: 2780, armor: 5, extraHp: 0, speedMult: 1.15, main: '#00ffd5', body: '#1c1c1c', hood: '#ffcc00', cape: '#2c1e40', eyes: '#ff406e', sigil: '#00ffd5', dust: '#ffcc00' },
  { id: 'dragon-slayer', name: 'Dragon Slayer', cost: 3080, armor: 6, extraHp: 0, speedMult: 1.12, main: '#ff5522', body: '#29130d', hood: '#ffbb33', cape: '#421d14', eyes: '#aaff66', sigil: '#ff5522', dust: '#ffbb33' },
  { id: 'eclipse-master', name: 'Eclipse Master', cost: 3400, armor: 6, extraHp: 0, speedMult: 1.14, main: '#9e5eff', body: '#0e0b17', hood: '#ff5e5e', cape: '#1f1633', eyes: '#fff0a8', sigil: '#5effcf', dust: '#9e5eff' },
  { id: 'omega-sentinel', name: 'Omega Sentinel', cost: 3750, armor: 6, extraHp: 0, speedMult: 1.16, main: '#4fff75', body: '#0f1f1a', hood: '#ff59b3', cape: '#1b3b33', eyes: '#ffffff', sigil: '#7eeeff', dust: '#ff59b3' },
  { id: 'infinity-guardian', name: 'Infinity Guardian', cost: 4100, armor: 7, extraHp: 1, speedMult: 1.15, main: '#ffcf40', body: '#1c1330', hood: '#4fffbd', cape: '#301c4a', eyes: '#ff7bf0', sigil: '#ffcf40', dust: '#4fffbd' },
  { id: 'celestial-avatar', name: 'Celestial Avatar', cost: 4500, armor: 7, extraHp: 2, speedMult: 1.18, main: '#80eeff', body: '#141433', hood: '#ffa34d', cape: '#282159', eyes: '#ffffff', sigil: '#ff66c4', dust: '#80eeff' },
  { id: 'god-of-storms', name: 'God of Storms', cost: 5000, armor: 8, extraHp: 0, speedMult: 1.20, main: '#ffffff', body: '#101736', hood: '#79f2ff', cape: '#1c285e', eyes: '#ffd166', sigil: '#ff4d6d', dust: '#79f2ff' },
];

export type BladeType = 'long' | 'katana' | 'great' | 'saber' | 'dagger' | 'axe' | 'spear';

/** Battle-mode elemental effect actually applied on hit (previously cosmetic only). */
export type BladeElement = 'none' | 'poison' | 'burn' | 'frost' | 'shock' | 'void' | 'holy';

export interface SwordPower {
  dmg: number; // damage multiplier
  blinkCd: number; // blink cooldown multiplier (lower = faster)
  slashCd: number; // slash cooldown multiplier
  ocShield: boolean; // invulnerable while Overcharged
  ocDur: number; // Overcharge duration multiplier
  element?: BladeElement; // on-hit elemental effect
  aura?: number; // passive damage-per-second aura radius (0 = none)
  reach?: number; // throw-distance multiplier (long blades fly further)
  freeze?: number; // seconds an enemy is frozen solid on hit
  lava?: number; // seconds the lava pool burns where you blink
  poison?: number; // seconds of poison damage-over-time
  burn?: number; // seconds of burn damage-over-time
  throwAoe?: number; // radius of the shockwave released when the blade is thrown
}

export const DEFAULT_POWER: SwordPower = {
  dmg: 1,
  blinkCd: 1,
  slashCd: 1,
  ocShield: false,
  ocDur: 1,
  element: 'none',
  aura: 0,
};

/* ------------------------------------------------------------ BLADE RUSH */
/**
 * Blade Rush mode uses its own compact 10-blade set. Blades are NOT purchased —
 * they drop into the lane and you grab them mid-run.
 *
 * The core trade-off: REACH vs AGILITY.
 *  · Long-reach blades fly far and fast and shatter obstacles (often one-shot),
 *    but recover slowly — you commit to the throw.
 *  · Short-reach blades barely scratch obstacles, but return instantly and
 *    recharge blink fast, so they're built for weaving and dodging.
 */
export interface RushBlade {
  id: string;
  name: string;
  type: BladeType;
  descKey: string; // i18n key for its ability text
  reach: number; // throw distance multiplier
  throwSpeed: number; // projectile speed multiplier
  obstacleDmg: number; // damage dealt to obstacles
  blinkCd: number; // blink cooldown multiplier
  slashCd: number;
  agility: number; // player move-speed multiplier while equipped
  glow: string;
  blade: string;
  core: string;
  guard: string;
  grip: string;
}

export const RUSH_BLADES: RushBlade[] = [
  // --- starter
  { id: 'rush-storm', name: 'Stormblade', type: 'long', descKey: 'rush_storm', reach: 1.0, throwSpeed: 1.0, obstacleDmg: 2, blinkCd: 1.0, slashCd: 1.0, agility: 1.0, glow: '#79f2ff', blade: '#dff9ff', core: '#57e6ff', guard: '#2a3f7a', grip: '#101a3a' },
  // --- SHORT REACH · agile dodgers (low obstacle damage, fast recovery)
  { id: 'rush-flick', name: 'Flickdagger', type: 'dagger', descKey: 'rush_flick', reach: 0.5, throwSpeed: 1.45, obstacleDmg: 1, blinkCd: 0.45, slashCd: 0.5, agility: 1.28, glow: '#7df9ff', blade: '#e6ffff', core: '#52e3ff', guard: '#1c4a5e', grip: '#0e2633' },
  { id: 'rush-wisp', name: 'Wisp Fang', type: 'dagger', descKey: 'rush_wisp', reach: 0.55, throwSpeed: 1.6, obstacleDmg: 1, blinkCd: 0.4, slashCd: 0.45, agility: 1.34, glow: '#c9a6ff', blade: '#f5eeff', core: '#9163f2', guard: '#3f256b', grip: '#1e1036' },
  { id: 'rush-viper', name: 'Viper Kris', type: 'katana', descKey: 'rush_viper', reach: 0.7, throwSpeed: 1.3, obstacleDmg: 2, blinkCd: 0.6, slashCd: 0.55, agility: 1.2, glow: '#80ff52', blade: '#eeffe8', core: '#52d929', guard: '#1d5212', grip: '#0e2908' },
  // --- MID
  { id: 'rush-ember', name: 'Ember Saber', type: 'saber', descKey: 'rush_ember', reach: 0.95, throwSpeed: 1.1, obstacleDmg: 3, blinkCd: 0.8, slashCd: 0.8, agility: 1.1, glow: '#ff8a3d', blade: '#fff1e2', core: '#ffa25c', guard: '#5c3018', grip: '#241009' },
  { id: 'rush-jade', name: 'Jade Edge', type: 'katana', descKey: 'rush_jade', reach: 1.05, throwSpeed: 1.15, obstacleDmg: 3, blinkCd: 0.75, slashCd: 0.7, agility: 1.12, glow: '#6dffb0', blade: '#eafff4', core: '#7dffb2', guard: '#1c5236', grip: '#0b2015' },
  // --- LONG REACH · obstacle breakers (huge damage, slow recovery)
  { id: 'rush-lance', name: 'Skypiercer', type: 'spear', descKey: 'rush_lance', reach: 1.65, throwSpeed: 1.5, obstacleDmg: 6, blinkCd: 1.25, slashCd: 1.2, agility: 0.94, glow: '#a1d8ff', blade: '#f0f8ff', core: '#6bb8f0', guard: '#2a4463', grip: '#152436' },
  { id: 'rush-halberd', name: 'Storm Halberd', type: 'spear', descKey: 'rush_halberd', reach: 1.8, throwSpeed: 1.35, obstacleDmg: 7, blinkCd: 1.35, slashCd: 1.3, agility: 0.9, glow: '#ffd166', blade: '#fff6da', core: '#ffd166', guard: '#8a6a1c', grip: '#3a2c08' },
  { id: 'rush-cleaver', name: 'Ruin Shuriken', type: 'axe', descKey: 'rush_cleaver', reach: 1.45, throwSpeed: 0.9, obstacleDmg: 9, blinkCd: 1.5, slashCd: 1.4, agility: 0.86, glow: '#ff5c38', blade: '#ffece8', core: '#e63e19', guard: '#5e1b0c', grip: '#2e0d05' },
  { id: 'rush-sunder', name: 'Worldsunder', type: 'great', descKey: 'rush_sunder', reach: 1.55, throwSpeed: 1.05, obstacleDmg: 12, blinkCd: 1.6, slashCd: 1.45, agility: 0.82, glow: '#ff5c5c', blade: '#ffece8', core: '#ff7777', guard: '#6b1c1c', grip: '#330c0c' },
];

export const rushBladeById = (id: string): RushBlade => RUSH_BLADES.find((b) => b.id === id) ?? RUSH_BLADES[0];

export type SwordPowerKey =
  | 'pow_storm'
  | 'pow_dagger'
  | 'pow_bronze'
  | 'pow_crimson'
  | 'pow_cobalt'
  | 'pow_ember'
  | 'pow_iron'
  | 'pow_axe'
  | 'pow_shadow'
  | 'pow_jade'
  | 'pow_azure'
  | 'pow_spear'
  | 'pow_neon'
  | 'pow_royal'
  | 'pow_venom'
  | 'pow_void'
  | 'pow_plasma'
  | 'pow_sun'
  | 'pow_magma'
  | 'pow_world'
  | 'pow_prism'
  | 'pow_aurora'
  | 'pow_hyper'
  | 'pow_chaos'
  | 'pow_titan'
  | 'pow_dragon'
  | 'pow_eclipse'
  | 'pow_nebula'
  | 'pow_omega'
  | 'pow_infinity'
  | 'pow_celestial'
  | 'pow_crimson2'
  | 'pow_moon'
  | 'pow_serpent'
  | 'pow_thunder2'
  | 'pow_phantom'
  | 'pow_forge'
  | 'pow_starfall'
  | 'pow_abyssal'
  | 'pow_ragnarok'
  | 'pow_firstlight';

export interface SwordSkin extends SwordPower {
  id: string;
  name: string;
  cost: number;
  type: BladeType;
  powerKey: SwordPowerKey;
  glow: string;
  blade: string;
  core: string;
  guard: string;
  grip: string;
}

export const SWORD_SKINS: SwordSkin[] = [
  { id: 'storm-blade', name: 'Stormblade', cost: 0, type: 'long', powerKey: 'pow_storm', dmg: 1.0, blinkCd: 1.0, slashCd: 1.0, ocShield: false, ocDur: 1.0, glow: '#79f2ff', blade: '#dff9ff', core: '#57e6ff', guard: '#2a3f7a', grip: '#101a3a' },
  { id: 'swift-dagger', name: 'Swift Dagger', cost: 80, type: 'dagger', powerKey: 'pow_dagger', dmg: 1.06, blinkCd: 0.88, slashCd: 0.85, ocShield: false, ocDur: 1.0, glow: '#7df9ff', blade: '#e6ffff', core: '#52e3ff', guard: '#1c4a5e', grip: '#0e2633' },
  { id: 'bronze-saber', name: 'Bronze Saber', cost: 130, type: 'saber', powerKey: 'pow_bronze', dmg: 1.09, blinkCd: 0.90, slashCd: 0.90, ocShield: false, ocDur: 1.0, glow: '#ffae52', blade: '#ffedd6', core: '#e88931', guard: '#5c381a', grip: '#261508' },
  { id: 'crimson-katana', name: 'Crimson Katana', cost: 180, type: 'katana', powerKey: 'pow_crimson', dmg: 1.12, blinkCd: 0.95, slashCd: 0.75, ocShield: false, ocDur: 1.0, glow: '#ff4d6d', blade: '#ffe9ee', core: '#ff6b8a', guard: '#5c1830', grip: '#2a0d18' },
  { id: 'cobalt-spear', name: 'Cobalt Spear', cost: 230, type: 'spear', powerKey: 'pow_cobalt', dmg: 1.15, blinkCd: 0.85, slashCd: 0.85, ocShield: false, ocDur: 1.1, glow: '#52b5ff', blade: '#eaf4ff', core: '#389af2', guard: '#1e3e63', grip: '#102238' },
  { id: 'ember-saber', name: 'Ember Saber', cost: 280, type: 'saber', powerKey: 'pow_ember', dmg: 1.18, blinkCd: 0.75, slashCd: 0.95, ocShield: false, ocDur: 1.0, glow: '#ff8a3d', blade: '#fff1e2', core: '#ffa25c', guard: '#5c3018', grip: '#241009' },
  { id: 'iron-axe', name: 'Iron Shuriken', cost: 340, type: 'axe', powerKey: 'pow_iron', dmg: 1.24, blinkCd: 1.0, slashCd: 0.90, ocShield: false, ocDur: 1.1, glow: '#b5c8d6', blade: '#f2f8fa', core: '#819db3', guard: '#33434f', grip: '#172026' },
  { id: 'thunder-axe', name: 'Thunder Shuriken', cost: 400, type: 'axe', powerKey: 'pow_axe', dmg: 1.30, blinkCd: 1.0, slashCd: 1.0, ocShield: false, ocDur: 1.1, glow: '#8ae8ff', blade: '#eafcff', core: '#4ac8eb', guard: '#2a4d63', grip: '#142530' },
  { id: 'shadow-dagger', name: 'Shadow Dagger', cost: 470, type: 'dagger', powerKey: 'pow_shadow', dmg: 1.34, blinkCd: 0.75, slashCd: 0.70, ocShield: false, ocDur: 1.1, glow: '#b08fff', blade: '#f5eeff', core: '#9163f2', guard: '#3f256b', grip: '#1e1036' },
  { id: 'jade-katana', name: 'Jade Katana', cost: 540, type: 'katana', powerKey: 'pow_jade', dmg: 1.38, blinkCd: 0.85, slashCd: 0.68, ocShield: false, ocDur: 1.0, glow: '#6dffb0', blade: '#eafff4', core: '#7dffb2', guard: '#1c5236', grip: '#0b2015' },
  { id: 'azure-great', name: 'Azure Greatblade', cost: 620, type: 'great', powerKey: 'pow_azure', dmg: 1.43, blinkCd: 0.90, slashCd: 0.85, ocShield: true, ocDur: 1.0, glow: '#5ec2ff', blade: '#ebf6ff', core: '#3b9deb', guard: '#1f4366', grip: '#102236' },
  { id: 'tempest-spear', name: 'Tempest Spear', cost: 700, type: 'spear', powerKey: 'pow_spear', dmg: 1.48, blinkCd: 0.80, slashCd: 0.75, ocShield: false, ocDur: 1.2, glow: '#a1d8ff', blade: '#f0f8ff', core: '#6bb8f0', guard: '#2a4463', grip: '#152436' },
  { id: 'neon-saber', name: 'Neon Saber', cost: 790, type: 'saber', powerKey: 'pow_neon', dmg: 1.54, blinkCd: 0.70, slashCd: 0.70, ocShield: false, ocDur: 1.2, glow: '#00ffd5', blade: '#e6fff9', core: '#00cca8', guard: '#0a423b', grip: '#05211e' },
  { id: 'royal-great', name: 'Royal Greatblade', cost: 880, type: 'great', powerKey: 'pow_royal', dmg: 1.60, blinkCd: 0.85, slashCd: 0.85, ocShield: true, ocDur: 1.0, glow: '#c9a6ff', blade: '#f5edff', core: '#c9a6ff', guard: '#3a2270', grip: '#190f33' },
  { id: 'venom-dagger', name: 'Venom Dagger', cost: 980, type: 'dagger', powerKey: 'pow_venom', dmg: 1.68, blinkCd: 0.68, slashCd: 0.65, ocShield: false, ocDur: 1.3, glow: '#80ff52', blade: '#eeffe8', core: '#52d929', guard: '#1d5212', grip: '#0e2908' },
  { id: 'void-dagger', name: 'Void Dagger', cost: 1100, type: 'dagger', powerKey: 'pow_void', dmg: 1.75, blinkCd: 0.65, slashCd: 0.60, ocShield: false, ocDur: 1.3, glow: '#d46bff', blade: '#f7ebff', core: '#b84dec', guard: '#491b61', grip: '#210b2e' },
  { id: 'plasma-katana', name: 'Plasma Katana', cost: 1220, type: 'katana', powerKey: 'pow_plasma', dmg: 1.84, blinkCd: 0.70, slashCd: 0.58, ocShield: true, ocDur: 1.3, glow: '#ff5ee2', blade: '#ffeaf9', core: '#e63bb8', guard: '#5e144a', grip: '#2b0922' },
  { id: 'sunbreaker', name: 'Sunbreaker', cost: 1350, type: 'great', powerKey: 'pow_sun', dmg: 1.95, blinkCd: 0.70, slashCd: 0.75, ocShield: true, ocDur: 1.5, glow: '#ffd166', blade: '#fff6da', core: '#ffd166', guard: '#8a6a1c', grip: '#3a2c08' },
  { id: 'magma-axe', name: 'Magma Shuriken', cost: 1490, type: 'axe', powerKey: 'pow_magma', dmg: 2.10, blinkCd: 0.70, slashCd: 0.70, ocShield: true, ocDur: 1.6, glow: '#ff5c38', blade: '#ffece8', core: '#e63e19', guard: '#5e1b0c', grip: '#2e0d05' },
  { id: 'world-ender', name: 'World Ender', cost: 1650, type: 'axe', powerKey: 'pow_world', dmg: 2.25, blinkCd: 0.60, slashCd: 0.65, ocShield: true, ocDur: 1.8, glow: '#ff5c5c', blade: '#ffece8', core: '#ff7777', guard: '#6b1c1c', grip: '#330c0c' },
  // Mix-colored & High-end Blades
  { id: 'prism-spear', name: 'Prism Spear', cost: 1800, type: 'spear', powerKey: 'pow_prism', dmg: 2.40, blinkCd: 0.60, slashCd: 0.60, ocShield: true, ocDur: 1.8, glow: '#00f7ff', blade: '#fff2aa', core: '#ff4d88', guard: '#2e184f', grip: '#150a26' },
  { id: 'aurora-katana', name: 'Aurora Katana', cost: 1980, type: 'katana', powerKey: 'pow_aurora', dmg: 2.60, blinkCd: 0.58, slashCd: 0.55, ocShield: true, ocDur: 2.0, glow: '#5effb3', blade: '#eafff8', core: '#855eff', guard: '#1a4538', grip: '#0c211a' },
  { id: 'hyper-saber', name: 'Hyper Saber', cost: 2150, type: 'saber', powerKey: 'pow_hyper', dmg: 2.80, blinkCd: 0.55, slashCd: 0.55, ocShield: true, ocDur: 2.0, glow: '#ff3d6e', blade: '#fff0a8', core: '#00ffcc', guard: '#4f1428', grip: '#260a13' },
  { id: 'chaos-dagger', name: 'Chaos Dagger', cost: 2350, type: 'dagger', powerKey: 'pow_chaos', dmg: 3.00, blinkCd: 0.50, slashCd: 0.50, ocShield: true, ocDur: 2.0, glow: '#ffaa00', blade: '#ffe8e8', core: '#ff3d6e', guard: '#543700', grip: '#291b00' },
  { id: 'titan-great', name: 'Titan Greatblade', cost: 2550, type: 'great', powerKey: 'pow_titan', dmg: 3.25, blinkCd: 0.55, slashCd: 0.60, ocShield: true, ocDur: 2.2, glow: '#be66ff', blade: '#f7f0ff', core: '#66e2ff', guard: '#3a1e54', grip: '#1c0e29' },
  { id: 'dragon-spear', name: 'Dragon Spear', cost: 2750, type: 'spear', powerKey: 'pow_dragon', dmg: 3.50, blinkCd: 0.55, slashCd: 0.55, ocShield: true, ocDur: 2.2, glow: '#ff5522', blade: '#fffae6', core: '#aaff66', guard: '#571e0c', grip: '#290e06' },
  { id: 'eclipse-axe', name: 'Eclipse Shuriken', cost: 2950, type: 'axe', powerKey: 'pow_eclipse', dmg: 3.80, blinkCd: 0.50, slashCd: 0.50, ocShield: true, ocDur: 2.5, glow: '#9e5eff', blade: '#f4ecff', core: '#5effcf', guard: '#341d59', grip: '#190e2b' },
  { id: 'nebula-katana', name: 'Nebula Katana', cost: 3200, type: 'katana', powerKey: 'pow_nebula', dmg: 4.10, blinkCd: 0.48, slashCd: 0.48, ocShield: true, ocDur: 2.5, glow: '#ff66b3', blade: '#fff0f8', core: '#66e2ff', guard: '#5c1f40', grip: '#2b0f1e' },
  { id: 'omega-long', name: 'Omega Blade', cost: 3500, type: 'long', powerKey: 'pow_omega', dmg: 4.40, blinkCd: 0.45, slashCd: 0.45, ocShield: true, ocDur: 2.8, glow: '#4fff75', blade: '#edfff2', core: '#ff59b3', guard: '#1a5929', grip: '#0c2b14' },
  // End-game blades are now duplicated at the BOTTOM of the list so they
  // sort last in the Armory. The original entries above are kept for
  // backward compatibility (existing owned lists / cloud accounts).

  // ── 10 NEW BLADES ──────────────────────────────────────────────────────────
  // Crimson Scythe: curved katana, bleed burn, mid reach
  // ── 10 NEW BLADES placed at the BOTTOM of the list so they sort last
  //   in the Armory. Both Infinity Edge and Celestial Shuriken are repositioned
  //   here so the two end-game weapons are clearly the most expensive.
  { id: 'infinity-blade', name: 'Infinity Edge', cost: 3850, type: 'great', powerKey: 'pow_infinity', dmg: 4.80, blinkCd: 0.45, slashCd: 0.45, ocShield: true, ocDur: 3.0, glow: '#ffcf40', blade: '#fffbe8', core: '#ff7bf0', guard: '#634b12', grip: '#2e2308' },
  { id: 'celestial-edge', name: 'Celestial Shuriken', cost: 4200, type: 'axe', powerKey: 'pow_celestial', dmg: 5.25, blinkCd: 0.40, slashCd: 0.40, ocShield: true, ocDur: 3.5, glow: '#80eeff', blade: '#ffffff', core: '#ffa34d', guard: '#2b5259', grip: '#14272b' },
  { id: 'crimson-scythe', name: 'Crimson Scythe', cost: 420, type: 'saber', powerKey: 'pow_crimson2', dmg: 1.15, blinkCd: 0.90, slashCd: 0.80, ocShield: false, ocDur: 1.0, glow: '#ff2244', blade: '#ffdddd', core: '#ff4466', guard: '#5c0a18', grip: '#2a0510' },
  // Moonblade: thin long, frost slow, long reach
  { id: 'moonblade', name: 'Moonblade', cost: 900, type: 'long', powerKey: 'pow_azure', dmg: 1.60, blinkCd: 0.95, slashCd: 0.90, ocShield: false, ocDur: 1.0, glow: '#c0dfff', blade: '#eaf4ff', core: '#8ec8ff', guard: '#2a3d5c', grip: '#141e2e' },
  // Serpent Fang: twin-colored dagger, poison, ultra-short reach, ultra-fast
  { id: 'serpent-fang', name: 'Serpent Fang', cost: 1600, type: 'dagger', powerKey: 'pow_venom', dmg: 1.95, blinkCd: 0.55, slashCd: 0.50, ocShield: false, ocDur: 1.2, glow: '#33ff80', blade: '#e8ffef', core: '#00d060', guard: '#0d3d22', grip: '#061b10' },
  // Thunderstrike: heavy shuriken, shock chain + big AOE, long reach
  { id: 'thunderstrike', name: 'Thunderstrike', cost: 2200, type: 'axe', powerKey: 'pow_axe', dmg: 2.50, blinkCd: 0.85, slashCd: 0.95, ocShield: false, ocDur: 1.0, glow: '#ffe566', blade: '#fffde0', core: '#ffd200', guard: '#5c4700', grip: '#2b2100' },
  // Phantom Edge: katana, void pull, mid reach, near-instant blink
  { id: 'phantom-edge', name: 'Phantom Edge', cost: 2900, type: 'katana', powerKey: 'pow_void', dmg: 2.90, blinkCd: 0.50, slashCd: 0.52, ocShield: false, ocDur: 1.4, glow: '#aa66ff', blade: '#f2eaff', core: '#7733cc', guard: '#35155f', grip: '#180a2d' },
  // Forge King: greatblade, lava pool, short reach, heavy
  { id: 'forge-king', name: 'Forge King', cost: 3600, type: 'great', powerKey: 'pow_magma', dmg: 3.60, blinkCd: 0.75, slashCd: 0.85, ocShield: true, ocDur: 1.5, glow: '#ff7733', blade: '#fff0e8', core: '#dd4400', guard: '#5a1e05', grip: '#2d0f03' },
  // Starfall Spear: spear, holy smite + aura, longest reach
  { id: 'starfall-spear', name: 'Starfall Spear', cost: 4400, type: 'spear', powerKey: 'pow_omega', dmg: 4.80, blinkCd: 0.52, slashCd: 0.52, ocShield: true, ocDur: 2.6, glow: '#ffe9a0', blade: '#fffef0', core: '#ffd700', guard: '#6b5500', grip: '#332700' },
  // Abyssal Saber: curved saber, void singularity on every hit, black + indigo
  { id: 'abyssal-saber', name: 'Abyssal Saber', cost: 5200, type: 'saber', powerKey: 'pow_eclipse', dmg: 5.50, blinkCd: 0.44, slashCd: 0.48, ocShield: true, ocDur: 2.8, glow: '#6633ff', blade: '#ece8ff', core: '#4400ee', guard: '#1a0055', grip: '#0c0028' },
  // Ragnarok Shuriken: massive shuriken, holy + shock aura, brutal reach
  { id: 'ragnarok-axe', name: 'Ragnarok Shuriken', cost: 6000, type: 'axe', powerKey: 'pow_celestial', dmg: 6.50, blinkCd: 0.42, slashCd: 0.48, ocShield: true, ocDur: 3.2, glow: '#ffeeaa', blade: '#ffffff', core: '#ffcc44', guard: '#553300', grip: '#2a1800' },
  // First Light: elegant longsword, holy smite cascade, warm gold + white
  { id: 'first-light', name: 'First Light', cost: 7000, type: 'long', powerKey: 'pow_omega', dmg: 7.50, blinkCd: 0.40, slashCd: 0.42, ocShield: true, ocDur: 3.0, glow: '#fff4cc', blade: '#fffff5', core: '#ffe066', guard: '#7a6010', grip: '#3c2e05' },
];

export interface MapSkin {
  id: string;
  name: string;
  cost: number;
  tag: string;
  bg0: string; // void background
  floorCenter: string;
  floorMid: string;
  floorEdge: string;
  grid: string;
  gridHot: string;
  cracks: string;
  rings: string;
  borderOuter: string;
  borderInner: string;
  enemyAccent: string;
  enemyBody: string;
  enemyEye: string;
  enemyGlow: string;
  ringColor: string;
  chunkColor: string;
  sparkColor: string;
}

export const MAP_SKINS: MapSkin[] = [
  {
    id: 'storm',
    name: 'Storm Arena',
    cost: 0,
    tag: 'TEMPEST VOID',
    bg0: '#05060f',
    floorCenter: '#141c3f',
    floorMid: '#0c1130',
    floorEdge: '#06081a',
    grid: 'rgba(94,132,255,0.10)',
    gridHot: 'rgba(120,220,255,0.20)',
    cracks: 'rgba(120,200,255,0.10)',
    rings: 'rgba(130,180,255,0.09)',
    borderOuter: 'rgba(121,242,255,0.55)',
    borderInner: 'rgba(169,123,255,0.22)',
    enemyAccent: '#ff4d6d',
    enemyBody: '#1a0b22',
    enemyEye: '#ff8a3d',
    enemyGlow: '#c9a6ff',
    ringColor: '#ff5c8a',
    chunkColor: '#2a1030',
    sparkColor: '#ff4d6d',
  },
  {
    id: 'circuit',
    name: 'Green Circuit',
    cost: 500,
    tag: 'CYBER MATRIX',
    bg0: '#030a06',
    floorCenter: '#0b301a',
    floorMid: '#061c0f',
    floorEdge: '#030d07',
    grid: 'rgba(64,255,130,0.14)',
    gridHot: 'rgba(110,255,180,0.28)',
    cracks: 'rgba(80,255,150,0.15)',
    rings: 'rgba(60,240,120,0.12)',
    borderOuter: 'rgba(80,255,150,0.65)',
    borderInner: 'rgba(30,180,90,0.28)',
    enemyAccent: '#ff4070',
    enemyBody: '#0f2415',
    enemyEye: '#5eff95',
    enemyGlow: '#00e699',
    ringColor: '#00ffcc',
    chunkColor: '#0c3321',
    sparkColor: '#66ffc2',
  },
  {
    id: 'sun',
    name: 'Solar Temple',
    cost: 900,
    tag: 'GOLDEN DESERT',
    bg0: '#0f0b03',
    floorCenter: '#3b2c0f',
    floorMid: '#241a08',
    floorEdge: '#120d04',
    grid: 'rgba(255,209,102,0.13)',
    gridHot: 'rgba(255,230,150,0.25)',
    cracks: 'rgba(255,210,110,0.14)',
    rings: 'rgba(255,190,80,0.11)',
    borderOuter: 'rgba(255,210,100,0.60)',
    borderInner: 'rgba(230,150,50,0.25)',
    enemyAccent: '#ff385c',
    enemyBody: '#261807',
    enemyEye: '#ffdd6b',
    enemyGlow: '#ffb834',
    ringColor: '#ffaa2b',
    chunkColor: '#42280d',
    sparkColor: '#ffd166',
  },
  {
    id: 'volcano',
    name: 'Magma Inferno',
    cost: 1400,
    tag: 'CRIMSON VOLCANO',
    bg0: '#0c0203',
    floorCenter: '#360c0b',
    floorMid: '#210605',
    floorEdge: '#120303',
    grid: 'rgba(255,80,60,0.13)',
    gridHot: 'rgba(255,140,100,0.26)',
    cracks: 'rgba(255,110,80,0.16)',
    rings: 'rgba(255,70,50,0.11)',
    borderOuter: 'rgba(255,90,70,0.65)',
    borderInner: 'rgba(220,50,40,0.30)',
    enemyAccent: '#ff9933',
    enemyBody: '#260807',
    enemyEye: '#ff4824',
    enemyGlow: '#ff5e38',
    ringColor: '#ff5030',
    chunkColor: '#3d110d',
    sparkColor: '#ff7859',
  },
  {
    id: 'astral',
    name: 'Astral Nebula',
    cost: 2000,
    tag: 'COSMIC VOID',
    bg0: '#080312',
    floorCenter: '#28114a',
    floorMid: '#16082d',
    floorEdge: '#0a0317',
    grid: 'rgba(190,102,255,0.14)',
    gridHot: 'rgba(220,160,255,0.28)',
    cracks: 'rgba(200,120,255,0.15)',
    rings: 'rgba(180,90,255,0.12)',
    borderOuter: 'rgba(210,130,255,0.65)',
    borderInner: 'rgba(150,70,230,0.30)',
    enemyAccent: '#7af5ff',
    enemyBody: '#1a0b30',
    enemyEye: '#e6b8ff',
    enemyGlow: '#a97bff',
    ringColor: '#8c5eff',
    chunkColor: '#2a1252',
    sparkColor: '#bdf6ff',
  },
  {
    id: 'ice',
    name: 'Frost Citadel',
    cost: 2600,
    tag: 'ARCTIC TUNDRA',
    bg0: '#030814',
    floorCenter: '#10305a',
    floorMid: '#0a1d38',
    floorEdge: '#050f21',
    grid: 'rgba(160,230,255,0.14)',
    gridHot: 'rgba(200,245,255,0.28)',
    cracks: 'rgba(150,225,255,0.16)',
    rings: 'rgba(140,215,255,0.12)',
    borderOuter: 'rgba(160,235,255,0.65)',
    borderInner: 'rgba(80,180,240,0.30)',
    enemyAccent: '#66e8ff',
    enemyBody: '#0b1d36',
    enemyEye: '#ffffff',
    enemyGlow: '#7af5ff',
    ringColor: '#4dcfff',
    chunkColor: '#122c4d',
    sparkColor: '#ccecff',
  },
  {
    id: 'shadow',
    name: 'Shadow Abyss',
    cost: 3300,
    tag: 'OBSIDIAN DEEP',
    bg0: '#07030a',
    floorCenter: '#2a1136',
    floorMid: '#16081f',
    floorEdge: '#0b0412',
    grid: 'rgba(200,110,255,0.13)',
    gridHot: 'rgba(235,165,255,0.26)',
    cracks: 'rgba(210,120,255,0.15)',
    rings: 'rgba(180,95,240,0.11)',
    borderOuter: 'rgba(215,125,255,0.60)',
    borderInner: 'rgba(140,55,200,0.28)',
    enemyAccent: '#d280ff',
    enemyBody: '#160b24',
    enemyEye: '#ff66c4',
    enemyGlow: '#b86bff',
    ringColor: '#ab5cff',
    chunkColor: '#281140',
    sparkColor: '#eac4ff',
  },
  {
    id: 'cyber_pink',
    name: 'Neon Tokyo',
    cost: 4000,
    tag: 'CYBERPUNK NEON',
    bg0: '#0a030e',
    floorCenter: '#3b0e36',
    floorMid: '#220820',
    floorEdge: '#100311',
    grid: 'rgba(255,100,200,0.15)',
    gridHot: 'rgba(255,160,225,0.30)',
    cracks: 'rgba(0,255,213,0.16)',
    rings: 'rgba(255,90,190,0.13)',
    borderOuter: 'rgba(255,110,210,0.70)',
    borderInner: 'rgba(0,255,213,0.32)',
    enemyAccent: '#00ffd5',
    enemyBody: '#1c0a24',
    enemyEye: '#ff66d9',
    enemyGlow: '#ff3d9a',
    ringColor: '#ff48a6',
    chunkColor: '#3d1240',
    sparkColor: '#a8ffea',
  },
  {
    id: 'blood_moon',
    name: 'Lunar Eclipse',
    cost: 4800,
    tag: 'LUNAR NIGHT',
    bg0: '#030614',
    floorCenter: '#16284d',
    floorMid: '#0d1730',
    floorEdge: '#060b1c',
    grid: 'rgba(180,210,255,0.16)',
    gridHot: 'rgba(220,240,255,0.32)',
    cracks: 'rgba(170,220,255,0.18)',
    rings: 'rgba(150,205,255,0.14)',
    borderOuter: 'rgba(180,225,255,0.70)',
    borderInner: 'rgba(120,180,255,0.35)',
    enemyAccent: '#9cd9ff',
    enemyBody: '#0c142b',
    enemyEye: '#ffffff',
    enemyGlow: '#70baff',
    ringColor: '#78d0ff',
    chunkColor: '#152847',
    sparkColor: '#e6f5ff',
  },
  {
    id: 'emerald',
    name: 'Emerald Jungle',
    cost: 5800,
    tag: 'ANCIENT RUINS',
    bg0: '#020d08',
    floorCenter: '#133d26',
    floorMid: '#0a2416',
    floorEdge: '#04120a',
    grid: 'rgba(90,255,160,0.14)',
    gridHot: 'rgba(150,255,200,0.28)',
    cracks: 'rgba(255,210,90,0.15)',
    rings: 'rgba(80,240,150,0.12)',
    borderOuter: 'rgba(100,255,170,0.65)',
    borderInner: 'rgba(255,195,60,0.28)',
    enemyAccent: '#ffd166',
    enemyBody: '#0d2417',
    enemyEye: '#5effb3',
    enemyGlow: '#3ddc84',
    ringColor: '#39c77d',
    chunkColor: '#103320',
    sparkColor: '#abffe0',
  },
];

/**
 * The four end-game cosmetics are GEM-ONLY — they can no longer be bought
 * with coins. Gems come from daily challenges and rare map pickups.
 */
export const GEM_PRICES: Record<string, number> = {
  // top two blades — GEMS ONLY, cannot be bought with coins
  'infinity-blade': 1000,
  'celestial-edge': 2000,
  // top two swordsmen — GEMS ONLY
  'celestial-avatar': 1000,
  'god-of-storms': 2000,
};

/** Items that can ONLY be bought with gems (no coin option at all). */
export const gemPriceOf = (id: string) => GEM_PRICES[id] ?? 0;
export const isGemItem = (id: string) => id in GEM_PRICES;

/**
 * Coin costs are re-scaled so the cheapest paid blade is 1,000 coins.
 * Free starter items stay free.
 */
export function coinCostOf(id: string): number {
  if (isGemItem(id)) return 0; // gem-exclusive
  const item = SWORD_SKINS.find((s) => s.id === id) ?? HERO_SKINS.find((h) => h.id === id);
  if (!item || item.cost === 0) return 0;
  // map the old 80–4500 range onto a 1,000+ curve
  return Math.round((1000 + item.cost * 1.9) / 50) * 50;
}

/**
 * Every non-exclusive item can ALSO be bought with gems, starting at 50.
 * Roughly 1 gem ≈ 45 coins, rounded to a tidy number.
 */
/**
 * Gem price ladder for non-exclusive items.
 * Ranked by cost so every blade/hero has its OWN tier — the cheapest paid
 * item is 50 gems, then 60, 70... rather than a flat 50 for the first five.
 */
export function altGemCostOf(id: string): number {
  if (isGemItem(id)) return 0; // already gem-only

  const inSwords = SWORD_SKINS.some((s) => s.id === id);
  const pool = (inSwords ? SWORD_SKINS : HERO_SKINS)
    .filter((i) => i.cost > 0 && !isGemItem(i.id))
    .sort((a, b) => a.cost - b.cost);

  const rank = pool.findIndex((i) => i.id === id);
  if (rank < 0) return 0;
  // 50, 60, 70, 85, 100, 120 ... accelerating with rank
  return 50 + rank * 10 + Math.floor(rank * rank * 0.6);
}

// Stable order for the Armory tab. The two end-game heroes
// (infinity-guardian, celestial-avatar) are forced to the end.
HERO_SKINS.sort((a, b) => {
  const ea = a.id === 'infinity-guardian' || a.id === 'celestial-avatar' ? 1 : 0;
  const eb = b.id === 'infinity-guardian' || b.id === 'celestial-avatar' ? 1 : 0;
  if (ea !== eb) return ea - eb;
  return a.cost - b.cost;
});

export const heroById = (id: string): HeroSkin => HERO_SKINS.find((s) => s.id === id) ?? HERO_SKINS[0];
export const swordById = (id: string): SwordSkin => SWORD_SKINS.find((s) => s.id === id) ?? SWORD_SKINS[0];
export const mapById = (id: string): MapSkin => MAP_SKINS.find((m) => sId(m, id)) ?? MAP_SKINS[0];
function sId(m: MapSkin, id: string) { return m.id === id; }
/**
 * Elemental identity per blade — these now actually fire in Battle Mode
 * (previously the flavour text promised effects that were never applied).
 */
const ELEMENT_BY_ID: Record<string, BladeElement> = {
  'venom-dagger': 'poison',
  'jade-katana': 'poison',
  'crimson-katana': 'poison',
  'serpent-fang': 'poison',
  'azure-great': 'frost',
  'cobalt-spear': 'frost',
  'moonblade': 'frost',
  'aurora-katana': 'frost',
  'phantom-edge': 'frost',
  'ember-saber': 'burn',
  'magma-axe': 'burn',
  'sunbreaker': 'burn',
  'chaos-dagger': 'burn',
  'dragon-spear': 'burn',
  'crimson-scythe': 'burn',
  'forge-king': 'burn',
  'thunder-axe': 'shock',
  'neon-saber': 'shock',
  'plasma-katana': 'shock',
  'titan-great': 'shock',
  'thunderstrike': 'shock',
  'void-dagger': 'void',
  'shadow-dagger': 'void',
  'eclipse-axe': 'void',
  'nebula-katana': 'void',
  'world-ender': 'void',
  'abyssal-saber': 'void',
  'prism-spear': 'holy',
  'starfall-spear': 'holy',
  'infinity-blade': 'holy',
  'celestial-edge': 'holy',
  'ragnarok-axe': 'holy',
  'first-light': 'holy',
  'royal-great': 'holy',
  'hyper-saber': 'shock',
};

/** Passive damaging aura radius (px) — only the high-end blades project one. */
const AURA_BY_ID: Record<string, number> = {
  'prism-spear': 90,
  'aurora-katana': 95,
  'hyper-saber': 100,
  'chaos-dagger': 100,
  'titan-great': 110,
  'dragon-spear': 115,
  'eclipse-axe': 120,
  'nebula-katana': 125,
  'omega-long': 130,
  'infinity-blade': 140,
  'celestial-edge': 155,
};

/** Clean, readable damage multipliers in 0.5 steps instead of odd percentages. */
const DMG_BY_ID: Record<string, number> = {
  'storm-blade': 1.0,
  'swift-dagger': 0.5,
  'bronze-saber': 1.0,
  'crimson-katana': 1.0,
  'cobalt-spear': 1.5,
  'ember-saber': 1.5,
  'iron-axe': 1.5,
  'thunder-axe': 2.0,
  'shadow-dagger': 1.5,
  'jade-katana': 2.0,
  'azure-great': 2.0,
  'tempest-spear': 2.5,
  'neon-saber': 2.5,
  'royal-great': 2.5,
  'venom-dagger': 2.0,
  'void-dagger': 2.5,
  'plasma-katana': 3.0,
  'sunbreaker': 3.0,
  'magma-axe': 3.5,
  'world-ender': 4.0,
  'prism-spear': 4.0,
  'aurora-katana': 4.5,
  'hyper-saber': 4.5,
  'chaos-dagger': 5.0,
  'titan-great': 5.5,
  'dragon-spear': 6.0,
  'eclipse-axe': 6.5,
  'nebula-katana': 7.0,
  'omega-long': 7.5,
  'infinity-blade': 8.5,
  'celestial-edge': 10.0,
};

/** FROST blades freeze the beast solid on hit — escalating tiers. */
const FREEZE_BY_ID: Record<string, number> = {
  'cobalt-spear': 1.0,
  'azure-great': 1.5,
  'aurora-katana': 2.0,
  'moonblade': 1.0,
  'phantom-edge': 1.5,
  'starfall2': 2.0,
};

/** MAGMA blades leave a burning lava pool where you blink. */
const LAVA_BY_ID: Record<string, number> = {
  'ember-saber': 1.0,
  'magma-axe': 1.5,
  'dragon-spear': 2.0,
  'crimson-scythe': 1.0,
  'forge-king': 1.5,
};

/** VENOM blades leave lingering poison. */
const POISON_BY_ID: Record<string, number> = {
  'crimson-katana': 3.0,
  'jade-katana': 5.0,
  'venom-dagger': 7.0,
  'serpent-fang': 7.0,
};

/** Burn duration for the fire blades. */
const BURN_BY_ID: Record<string, number> = {
  'sunbreaker': 3.0,
  'chaos-dagger': 4.0,
  'crimson-scythe': 2.0,
  'forge-king': 2.0,
};

/**
 * Blades that release a shockwave the instant they're thrown.
 * Pairs beautifully with the TRI-BLADE orb — three simultaneous blasts.
 */
const THROW_AOE_BY_ID: Record<string, number> = {
  'iron-axe': 70,
  'thunder-axe': 90,
  'magma-axe': 110,
  'world-ender': 130,
  'titan-great': 130,
  'eclipse-axe': 145,
  'celestial-edge': 165,
  'thunderstrike': 150,
  'forge-king': 100,
  'ragnarok2': 150,
  'ragnarok-axe': 150,
};

/**
 * Only the two most expensive blades keep Overcharge invulnerability.
 * Everything else lost it now that the GHOST FORM orb exists in Battle Mode.
 */
const SHIELD_BLADES = new Set(
  [...SWORD_SKINS]
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 2)
    .map((s) => s.id),
);

/**
 * Reach identity per blade type — long weapons fly further and hit harder,
 * short weapons snap back fast so you can re-blink sooner.
 */
const REACH_BY_TYPE: Record<BladeType, number> = {
  dagger: 0.62,
  katana: 0.9,
  saber: 0.95,
  long: 1.0,
  great: 1.2,
  axe: 1.3,
  spear: 1.55,
};

export const swordReachOf = (id: string) => REACH_BY_TYPE[swordById(id).type] ?? 1;

export const swordPowerOf = (id: string): SwordPower => {
  const s = swordById(id);
  return {
    dmg: DMG_BY_ID[s.id] ?? Math.round(s.dmg * 2) / 2,
    blinkCd: s.blinkCd,
    slashCd: s.slashCd,
    // only the two end-game blades keep Overcharge invulnerability
    ocShield: SHIELD_BLADES.has(s.id),
    ocDur: s.ocDur,
    element: ELEMENT_BY_ID[s.id] ?? 'none',
    aura: AURA_BY_ID[s.id] ?? 0,
    reach: REACH_BY_TYPE[s.type] ?? 1,
    freeze: FREEZE_BY_ID[s.id] ?? 0,
    lava: LAVA_BY_ID[s.id] ?? 0,
    poison: POISON_BY_ID[s.id] ?? 0,
    burn: BURN_BY_ID[s.id] ?? 0,
    throwAoe: THROW_AOE_BY_ID[s.id] ?? 0,
  };
};

/** Human-readable damage label, e.g. "1.5x DMG". */
export const dmgLabel = (id: string) => `${(DMG_BY_ID[swordById(id).id] ?? 1).toFixed(1)}x`;

export const BLADE_LABEL: Record<BladeType, string> = {
  long: 'LONGSWORD',
  katana: 'KATANA',
  great: 'GREATBLADE',
  saber: 'SABER',
  dagger: 'DAGGER',
  axe: 'SHURIKEN',
  spear: 'SPEAR',
};

/**
 * Stable order for the Armory tab. ID is canonical; cost is the secondary
 * sort key so the in-game "owned blades" list is the same shape every time.
 * The two end-game blades (infinity-blade, celestial-edge) are forced to the
 * END of the list regardless of cost.
 */
const _endGame = new Set(['infinity-blade', 'celestial-edge']);
SWORD_SKINS.sort((a, b) => {
  const ea = _endGame.has(a.id) ? 1 : 0;
  const eb = _endGame.has(b.id) ? 1 : 0;
  if (ea !== eb) return ea - eb; // non-end-game first
  return a.cost - b.cost;
});
