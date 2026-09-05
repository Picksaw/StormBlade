/** Tiny procedural sound engine — no assets, all WebAudio synthesis. */

type Ctx = AudioContext & { _noise?: AudioBuffer };

class SFX {
  ctx: Ctx | null = null;
  master: GainNode | null = null;
  muted = false;
  private noise: AudioBuffer | null = null;
  private last: Record<string, number> = {};

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC() as Ctx;
    const master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 8;
    master.connect(comp);
    comp.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;

    const len = Math.floor(ctx.sampleRate * 0.6);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
  }

  private throttle(key: string, ms: number) {
    const t = performance.now();
    if (this.last[key] && t - this.last[key] < ms) return true;
    this.last[key] = t;
    return false;
  }

  private tone(opts: {
    type?: OscillatorType;
    f0: number;
    f1?: number;
    dur: number;
    gain?: number;
    delay?: number;
    curve?: 'exp' | 'lin';
  }) {
    const { ctx, master } = this;
    if (!ctx || !master || this.muted) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(Math.max(20, opts.f0), t0);
    if (opts.f1 !== undefined) {
      if (opts.curve === 'lin') osc.frequency.linearRampToValueAtTime(Math.max(20, opts.f1), t0 + opts.dur);
      else osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.f1), t0 + opts.dur);
    }
    const peak = (opts.gain ?? 0.3);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + opts.dur + 0.05);
  }

  private hiss(opts: { dur: number; gain?: number; f0?: number; f1?: number; q?: number; delay?: number; type?: BiquadFilterType }) {
    const { ctx, master, noise } = this;
    if (!ctx || !master || !noise || this.muted) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const filt = ctx.createBiquadFilter();
    filt.type = opts.type ?? 'bandpass';
    filt.frequency.setValueAtTime(opts.f0 ?? 1200, t0);
    if (opts.f1) filt.frequency.exponentialRampToValueAtTime(Math.max(40, opts.f1), t0 + opts.dur);
    filt.Q.value = opts.q ?? 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.25, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + opts.dur + 0.05);
  }

  throwSword() {
    this.tone({ type: 'sawtooth', f0: 900, f1: 260, dur: 0.22, gain: 0.14 });
    this.hiss({ dur: 0.25, f0: 2600, f1: 700, gain: 0.14, q: 2 });
  }

  slash() {
    if (this.throttle('slash', 60)) return;
    this.hiss({ dur: 0.16, f0: 3600, f1: 900, gain: 0.18, q: 1.4 });
    this.tone({ type: 'triangle', f0: 520, f1: 180, dur: 0.12, gain: 0.09 });
  }

  hit() {
    if (this.throttle('hit', 35)) return;
    this.tone({ type: 'square', f0: 320, f1: 90, dur: 0.09, gain: 0.1 });
    this.hiss({ dur: 0.08, f0: 1800, f1: 500, gain: 0.12, q: 1 });
  }

  kill() {
    if (this.throttle('kill', 45)) return;
    this.tone({ type: 'sawtooth', f0: 220, f1: 55, dur: 0.3, gain: 0.16 });
    this.hiss({ dur: 0.3, f0: 900, f1: 160, gain: 0.16, q: 0.7 });
  }

  blink() {
    this.tone({ type: 'sawtooth', f0: 120, f1: 1400, dur: 0.1, gain: 0.14 });
    this.tone({ type: 'square', f0: 1600, f1: 200, dur: 0.26, gain: 0.12, delay: 0.06 });
    this.hiss({ dur: 0.35, f0: 4200, f1: 500, gain: 0.2, q: 0.8, delay: 0.05 });
  }

  recall() {
    this.tone({ type: 'triangle', f0: 300, f1: 1100, dur: 0.18, gain: 0.11 });
  }

  catchSword() {
    this.tone({ type: 'square', f0: 1400, f1: 700, dur: 0.08, gain: 0.09 });
    this.hiss({ dur: 0.1, f0: 5000, f1: 2000, gain: 0.1, q: 3 });
  }

  hurt() {
    this.tone({ type: 'sawtooth', f0: 260, f1: 60, dur: 0.4, gain: 0.22 });
    this.hiss({ dur: 0.25, f0: 500, f1: 120, gain: 0.2, q: 0.6, type: 'lowpass' });
  }

  pickup() {
    if (this.throttle('pickup', 40)) return;
    this.tone({ type: 'sine', f0: 900, f1: 1700, dur: 0.09, gain: 0.06 });
  }

  heal() {
    this.tone({ type: 'sine', f0: 600, f1: 900, dur: 0.18, gain: 0.14 });
    this.tone({ type: 'sine', f0: 900, f1: 1350, dur: 0.22, gain: 0.11, delay: 0.09 });
  }

  wave() {
    [0, 0.11, 0.22].forEach((d, i) => this.tone({ type: 'triangle', f0: 300 + i * 190, dur: 0.3, gain: 0.12, delay: d }));
  }

  overcharge() {
    this.tone({ type: 'sawtooth', f0: 200, f1: 1500, dur: 0.5, gain: 0.16 });
    this.hiss({ dur: 0.8, f0: 800, f1: 4000, gain: 0.12, q: 0.7 });
  }

  gameOver() {
    [0, 0.16, 0.34].forEach((d, i) =>
      this.tone({ type: 'sawtooth', f0: 340 - i * 90, f1: 60, dur: 0.7, gain: 0.16, delay: d }),
    );
  }

  ui() {
    this.tone({ type: 'square', f0: 700, f1: 1100, dur: 0.06, gain: 0.06 });
  }

  /** Bright crystalline chime for picking up a gem. */
  gem() {
    [0, 0.07, 0.14].forEach((d, i) =>
      this.tone({ type: 'sine', f0: 1046 + i * 320, dur: 0.3, gain: 0.14, delay: d }),
    );
    this.tone({ type: 'triangle', f0: 2093, f1: 3136, dur: 0.35, gain: 0.08, delay: 0.1 });
    this.hiss({ dur: 0.3, f0: 6000, f1: 2500, gain: 0.08, q: 2.5 });
  }

  /**
   * Escalating combo sting. Level 1 is a simple 3-note rise; each further
   * level adds notes, climbs the scale and lands on a heavier boom.
   */
  combo(level: number) {
    const lvl = Math.max(1, Math.min(8, level));
    // pentatonic ladder so every combination stays consonant
    const scale = [523, 587, 659, 784, 880, 1046, 1175, 1318, 1568, 1760];
    const notes = 2 + lvl; // 3 notes at lvl 1, up to 10
    for (let i = 0; i < notes; i++) {
      const f = scale[Math.min(scale.length - 1, i + Math.floor(lvl / 2))];
      this.tone({ type: 'triangle', f0: f, dur: 0.16, gain: 0.11, delay: i * 0.055 });
      if (lvl >= 4) this.tone({ type: 'sine', f0: f * 2, dur: 0.12, gain: 0.05, delay: i * 0.055 });
    }
    // the "bom" — a deeper hit that grows with the level
    const boomAt = notes * 0.055 + 0.02;
    this.tone({ type: 'sine', f0: 190 - lvl * 8, f1: 55, dur: 0.4 + lvl * 0.03, gain: 0.2, delay: boomAt });
    this.tone({ type: 'sawtooth', f0: 320, f1: 90, dur: 0.3, gain: 0.09, delay: boomAt });
    if (lvl >= 3) this.hiss({ dur: 0.45, f0: 3000, f1: 600, gain: 0.1, q: 0.8, delay: boomAt });
    if (lvl >= 6) {
      // choir-ish shimmer on high combos
      [0, 0.09].forEach((d, i) =>
        this.tone({ type: 'sine', f0: 1568 + i * 392, dur: 0.6, gain: 0.06, delay: boomAt + d }),
      );
    }
  }
}

export const sfx = new SFX();

/* ------------------------------------------------------------------ MUSIC */
/** Procedural lo-fi hip-hop soundtrack — warm chords, soft bass, dusty drums, vinyl crackle. */

// Lo-fi jazzy chord progressions (semitone offsets from root), ~75 BPM feel
const PROGRESSIONS: number[][][] = [
  // Dm9 - G13 - Cmaj9 - Amin9
  [
    [2, 5, 9, 12, 16],
    [7, 11, 14, 17, 21],
    [0, 4, 7, 11, 14],
    [9, 12, 16, 19, 23],
  ],
  // Fmaj7 - Em7 - Dm7 - G7
  [
    [5, 9, 12, 16],
    [4, 7, 11, 14],
    [2, 5, 9, 12],
    [7, 11, 14, 17],
  ],
  // Am9 - Fmaj9 - Cmaj7 - Em7
  [
    [9, 12, 16, 19, 23],
    [5, 9, 12, 16, 19],
    [0, 4, 7, 11],
    [4, 7, 11, 14],
  ],
];

const PENTATONIC = [0, 3, 5, 7, 10, 12, 15];

class LoFiMusic {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  private step = 0;
  private bar = 0;
  private prog = 0;
  private root = 48; // C3
  private playing = false;
  private muted = false;
  private nextTime = 0;
  private crackle: AudioBufferSourceNode | null = null;
  private readonly stepDur = 0.2; // 16th @ ~75bpm

  private mtof(m: number) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  private ensure() {
    sfx.init();
    if (!sfx.ctx || !sfx.master) return false;
    if (this.ctx) return true;
    const ctx = sfx.ctx;
    this.ctx = ctx;

    // warm lo-fi bus: low-pass + gentle saturation feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2100;
    filter.Q.value = 0.6;

    const bus = ctx.createGain();
    bus.gain.value = 0.0;
    filter.connect(bus);
    bus.connect(sfx.master);
    this.filter = filter;
    this.bus = bus;

    // noise buffer for drums + vinyl
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    return true;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.bus && this.ctx) {
      this.bus.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bus.gain.linearRampToValueAtTime(m || !this.playing ? 0 : 0.34, this.ctx.currentTime + 0.4);
    }
  }

  start() {
    if (!this.ensure() || this.playing) return;
    this.playing = true;
    this.step = 0;
    this.bar = 0;
    this.prog = Math.floor(Math.random() * PROGRESSIONS.length);
    this.nextTime = this.ctx!.currentTime + 0.1;
    if (this.bus && !this.muted) {
      this.bus.gain.cancelScheduledValues(this.ctx!.currentTime);
      this.bus.gain.setValueAtTime(0.0001, this.ctx!.currentTime);
      this.bus.gain.linearRampToValueAtTime(0.34, this.ctx!.currentTime + 1.6);
    }
    this.startCrackle();
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    if (this.bus && this.ctx) {
      this.bus.gain.cancelScheduledValues(this.ctx.currentTime);
      this.bus.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
    }
    if (this.crackle) {
      try {
        this.crackle.stop(this.ctx!.currentTime + 0.9);
      } catch {
        /* ignore */
      }
      this.crackle = null;
    }
  }

  /** Adjust the mood: intensity 0..1 brightens the filter (tension in-game). */
  setIntensity(k: number) {
    if (!this.filter || !this.ctx) return;
    const target = 1500 + clampNum(k, 0, 1) * 2600;
    this.filter.frequency.setTargetAtTime(target, this.ctx.currentTime, 0.6);
  }

  private startCrackle() {
    const ctx = this.ctx;
    if (!ctx || !this.noise || !this.filter) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3200;
    const g = ctx.createGain();
    g.gain.value = 0.018;
    src.connect(hp);
    hp.connect(g);
    g.connect(this.filter);
    src.start();
    this.crackle = src;
  }

  /** Call every frame; schedules notes slightly ahead of the audio clock. */
  update() {
    if (!this.playing || !this.ctx || !this.filter) return;
    const ctx = this.ctx;
    while (this.nextTime < ctx.currentTime + 0.35) {
      this.scheduleStep(this.nextTime, this.step);
      this.nextTime += this.stepDur;
      this.step++;
      if (this.step >= 16) {
        this.step = 0;
        this.bar++;
        if (this.bar % 8 === 0 && Math.random() < 0.5) {
          this.prog = Math.floor(Math.random() * PROGRESSIONS.length);
        }
      }
    }
  }

  private scheduleStep(t: number, step: number) {
    const chords = PROGRESSIONS[this.prog];
    const chord = chords[this.bar % chords.length];

    // --- swing feel
    const swing = step % 2 === 1 ? 0.035 : 0;
    const time = t + swing;

    // --- drums
    if (step === 0 || step === 6 || step === 10) this.kick(time);
    if (step === 4 || step === 12) this.snare(time);
    if (step % 2 === 0) this.hat(time, step % 8 === 0 ? 0.05 : 0.028);

    // --- bass on beats 1 and 3-ish
    if (step === 0 || step === 6) {
      this.bass(time, this.mtof(this.root + chord[0] - 12));
    }

    // --- chord pad every bar (soft attack)
    if (step === 0) {
      for (const semi of chord) this.padNote(time, this.mtof(this.root + semi + 12));
    }

    // --- sparse pentatonic melody
    if ((step === 3 || step === 7 || step === 11 || step === 14) && Math.random() < 0.42) {
      const semi = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
      this.melody(time, this.mtof(this.root + chord[0] + semi + 24));
    }
  }

  private padNote(t: number, f: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o2.type = 'triangle';
    o.frequency.value = f;
    o2.frequency.value = f * 1.005; // slight detune for warmth
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.35);
    g.gain.linearRampToValueAtTime(0.03, t + 1.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);
    o.connect(g);
    o2.connect(g);
    g.connect(this.filter!);
    o.start(t);
    o2.start(t);
    o.stop(t + 3.1);
    o2.stop(t + 3.1);
  }

  private bass(t: number, f: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g);
    g.connect(this.filter!);
    o.start(t);
    o.stop(t + 0.8);
  }

  private melody(t: number, f: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.045, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    o.connect(g);
    g.connect(this.filter!);
    o.start(t);
    o.stop(t + 1.0);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(120, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.34, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g);
    g.connect(this.filter!);
    o.start(t);
    o.stop(t + 0.35);
  }

  private snare(t: number) {
    const ctx = this.ctx!;
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1700;
    bp.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.filter!);
    src.start(t);
    src.stop(t + 0.25);
  }

  private hat(t: number, gain: number) {
    const ctx = this.ctx!;
    if (!this.noise) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    src.connect(hp);
    hp.connect(g);
    g.connect(this.filter!);
    src.start(t);
    src.stop(t + 0.09);
  }
}

const clampNum = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export const music = new LoFiMusic();
