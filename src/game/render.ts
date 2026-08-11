import { clamp, lerp, TAU } from './core';
import { drawShuriken } from './axe-path';
import { isBoss, type Enemy, type Game } from './engine';
import type { Input } from './input';
import { STR, type Lang } from './i18n';
import { HERO_SKINS, MAP_SKINS, rushBladeById, SWORD_SKINS, type HeroSkin, type MapSkin, type SwordSkin } from './skins';

const FONT = "700 16px 'Chakra Petch','Vazirmatn','Segoe UI',Tahoma,system-ui,sans-serif";
const CANVAS_FONT = "'Chakra Petch','Vazirmatn','Segoe UI',Tahoma,system-ui,sans-serif";

export class Renderer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  scale = 1;
  dpr = 1;
  cssW = 0;
  cssH = 0;
  heroSkin: HeroSkin = HERO_SKINS[0];
  swordSkin: SwordSkin = SWORD_SKINS[0];
  mapSkin: MapSkin = MAP_SKINS[0];
  lang: Lang = 'en';

  private t() {
    return STR[this.lang];
  }
  private glowCache = new Map<string, HTMLCanvasElement>();
  private bg: HTMLCanvasElement | null = null;
  private bgPad = 60;
  private scan: CanvasPattern | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    const sc = document.createElement('canvas');
    sc.width = 4;
    sc.height = 4;
    const g = sc.getContext('2d')!;
    g.fillStyle = '#0a1030';
    g.fillRect(0, 0, 4, 1);
    this.scan = this.ctx.createPattern(sc, 'repeat');
  }

  resize(cssW: number, cssH: number, scale: number, dpr: number) {
    this.cssW = cssW;
    this.cssH = cssH;
    this.scale = scale;
    this.dpr = dpr;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.buildBg(cssW / scale, cssH / scale);
  }

  private glow(color: string) {
    let c = this.glowCache.get(color);
    if (!c) {
      c = document.createElement('canvas');
      c.width = c.height = 128;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, color);
      grad.addColorStop(0.35, this.fade(color, 0.55));
      grad.addColorStop(1, this.fade(color, 0));
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
      this.glowCache.set(color, c);
    }
    return c;
  }

  private fade(color: string, a: number) {
    if (color.startsWith('#')) {
      const h = color.slice(1);
      const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
      const n = parseInt(f, 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    return color.replace(/rgba?\(([^)]+)\)/, (_, inner) => {
      const parts = String(inner).split(',');
      return `rgba(${parts[0]},${parts[1]},${parts[2]},${a})`;
    });
  }

  blob(x: number, y: number, r: number, color: string, alpha = 1) {
    const ctx = this.ctx;
    ctx.globalAlpha = alpha;
    ctx.drawImage(this.glow(color), x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  }

  setMap(ms: MapSkin) {
    this.mapSkin = ms;
    if (this.cssW > 0 && this.scale > 0) {
      this.buildBg(this.cssW / this.scale, this.cssH / this.scale);
    }
  }

  private buildBg(w: number, h: number) {
    const pad = this.bgPad;
    const c = document.createElement('canvas');
    const dpr = this.dpr;
    const s = this.scale;
    c.width = Math.max(1, Math.round((w + pad * 2) * s * dpr));
    c.height = Math.max(1, Math.round((h + pad * 2) * s * dpr));
    const g = c.getContext('2d')!;
    g.setTransform(s * dpr, 0, 0, s * dpr, pad * s * dpr, pad * s * dpr);

    const ms = this.mapSkin;
    // void
    g.fillStyle = ms.bg0;
    g.fillRect(-pad, -pad, w + pad * 2, h + pad * 2);

    // arena floor
    const grad = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * 0.72);
    grad.addColorStop(0, ms.floorCenter);
    grad.addColorStop(0.55, ms.floorMid);
    grad.addColorStop(1, ms.floorEdge);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);

    // grid
    const step = 60;
    g.lineWidth = 1;
    g.strokeStyle = ms.grid;
    g.beginPath();
    for (let x = step; x < w; x += step) {
      g.moveTo(x, 0);
      g.lineTo(x, h);
    }
    for (let y = step; y < h; y += step) {
      g.moveTo(0, y);
      g.lineTo(w, y);
    }
    g.stroke();

    // cracks / runes
    g.strokeStyle = ms.cracks;
    g.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      g.beginPath();
      let x = Math.random() * w;
      let y = Math.random() * h;
      g.moveTo(x, y);
      for (let j = 0; j < 4; j++) {
        x += (Math.random() - 0.5) * 150;
        y += (Math.random() - 0.5) * 150;
        g.lineTo(x, y);
      }
      g.stroke();
    }

    // concentric arena rings
    g.strokeStyle = ms.rings;
    g.lineWidth = 2;
    for (let i = 1; i <= 3; i++) {
      g.beginPath();
      g.arc(w / 2, h / 2, Math.min(w, h) * 0.14 * i, 0, TAU);
      g.stroke();
    }

    // border
    g.strokeStyle = ms.borderOuter;
    g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
    g.strokeStyle = ms.borderInner;
    g.lineWidth = 12;
    g.strokeRect(6, 6, w - 12, h - 12);

    this.bg = c;
  }

  // ------------------------------------------------------------------ draw
  draw(game: Game, input: Input, uiAlpha: number) {
    if (game.mapSkin.id !== this.mapSkin.id) {
      this.setMap(game.mapSkin);
    }
    const ctx = this.ctx;
    const s = this.scale;
    const dpr = this.dpr;
    const W = game.W;
    const H = game.H;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = this.mapSkin.bg0;
    ctx.fillRect(0, 0, this.cssW, this.cssH);

    ctx.setTransform(s * dpr, 0, 0, s * dpr, game.shakeX * s * dpr, game.shakeY * s * dpr);
    if (this.bg) {
      ctx.drawImage(this.bg, -this.bgPad, -this.bgPad, this.bg.width / (s * dpr), this.bg.height / (s * dpr));
    }

    if (game.mode === 'race') {
      ctx.save();
      const step = 60;
      const off = game.scrollOffset % step;
      ctx.strokeStyle = this.mapSkin.gridHot;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let y = off; y < H; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // ground rings
    ctx.globalCompositeOperation = 'lighter';
    for (const r of game.rings) {
      const t = r.life / r.max;
      ctx.globalAlpha = t * 0.9;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = r.width * t + 0.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, TAU);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // lava pools sit on the floor, under everything else
    for (const p of game.lavaPools) {
      const k = clamp(p.life / p.max, 0, 1);
      const pulse = 0.75 + Math.sin(game.time * 9) * 0.25;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(p.x, p.y, p.r * 1.25, '#ff5c38', 0.3 * k * pulse);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.55 * k;
      const lg = ctx.createRadialGradient(p.x, p.y, p.r * 0.15, p.x, p.y, p.r);
      lg.addColorStop(0, '#ffd166');
      lg.addColorStop(0.5, '#ff5c38');
      lg.addColorStop(1, 'rgba(120,20,10,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.8 * k;
      ctx.strokeStyle = '#ff8a3d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.92 + Math.sin(game.time * 5) * 0.05), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (game.mode === 'word') this.drawLexicon(game);

    // gems — rare premium pickup (shrunk by ~35% for elegance)
    for (const g of game.gems) {
      const bob = Math.sin(g.t * 3) * 5;
      const y = g.y + bob;
      const spin = g.t * 1.8;
      const pulse = 0.75 + Math.sin(g.t * 7) * 0.25;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(g.x, y, 34 * pulse, '#7af5ff', 0.5);
      this.blob(g.x, y, 17, '#ffffff', 0.35);
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.translate(g.x, y);
      ctx.rotate(spin);
      // faceted diamond
      ctx.fillStyle = '#bdf6ff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, -13);
      ctx.lineTo(10, -2.6);
      ctx.lineTo(0, 13);
      ctx.lineTo(-10, -2.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-10, -2.6);
      ctx.lineTo(10, -2.6);
      ctx.moveTo(0, -13);
      ctx.lineTo(0, 13);
      ctx.stroke();
      ctx.restore();
      // orbiting sparkle ring
      ctx.strokeStyle = `rgba(122,245,255,${0.3 + pulse * 0.25})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -g.t * 45;
      ctx.beginPath();
      ctx.arc(g.x, y, 22, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    this.drawMarks(game);
    this.drawShards(game);
    this.drawPickups(game);
    this.drawOrbs(game);
    if (game.scrolling) this.drawObstacles(game);
    if (game.mode === 'rush') this.drawBladeDrops(game);
    this.drawTether(game);
    for (const e of game.enemies) if (e.hp > 0) this.drawEnemy(ctx, e, game.time);
    this.drawProjectiles(game);
    this.drawPlayer(game, input);
    this.drawSword(game);
    this.drawSideSwords(game);

    // bolts + particles (additive)
    ctx.globalCompositeOperation = 'lighter';
    for (const b of game.bolts) {
      const t = b.life / b.max;
      ctx.globalAlpha = t;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.width * t;
      ctx.beginPath();
      ctx.moveTo(b.pts[0], b.pts[1]);
      for (let i = 2; i < b.pts.length; i += 2) ctx.lineTo(b.pts[i], b.pts[i + 1]);
      ctx.stroke();
      ctx.globalAlpha = t * 0.5;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(0.6, b.width * t * 0.35);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const p of game.particles) {
      const t = clamp(p.life / p.max, 0, 1);
      if (p.kind === 1) {
        this.blob(p.x, p.y, p.size * (0.5 + t) * 2.2, p.color, t * 0.75);
      } else if (p.kind === 0) {
        ctx.globalAlpha = t;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * t;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.022, p.y - p.vy * 0.022);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    for (const p of game.particles) {
      if (p.kind !== 2) continue;
      const t = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = t;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.86, p.size * 0.5);
      ctx.lineTo(-p.size * 0.86, p.size * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(180,220,255,0.55)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // floating text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const t of game.texts) {
      const k = clamp(t.life / t.max, 0, 1);
      const pop = 1 + (1 - k) * 0.2;
      ctx.globalAlpha = Math.min(1, k * 1.6);
      ctx.font = `800 ${t.size * pop}px 'Chakra Petch','Segoe UI',system-ui,sans-serif`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(4,6,18,0.85)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    // wave banner
    if (game.waveBanner > 0 && game.state === 'playing') {
      const k = clamp(game.waveBanner / 2, 0, 1);
      const a = Math.min(1, k * 2.4) * Math.min(1, (2 - game.waveBanner) * 4);
      ctx.globalAlpha = a;
      ctx.font = `800 44px ${CANVAS_FONT}`;
      ctx.fillStyle = '#79f2ff';
      ctx.strokeStyle = 'rgba(4,6,18,0.9)';
      ctx.lineWidth = 8;
      const y = H * 0.28;
      ctx.strokeText(game.waveBannerText, W / 2, y);
      ctx.fillText(game.waveBannerText, W / 2, y);
      ctx.globalAlpha = a * 0.8;
      ctx.font = `600 15px ${CANVAS_FONT}`;
      ctx.fillStyle = '#a97bff';
      ctx.fillText(this.t().stormRises, W / 2, y + 34);
      ctx.globalAlpha = 1;
    }

    this.drawHints(game, input);
    this.drawBossBar(game);

    // ---- screen-space overlays
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (game.flash > 0.01) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = clamp(game.flash, 0, 1) * 0.5;
      ctx.fillStyle = game.flashColor;
      ctx.fillRect(0, 0, this.cssW, this.cssH);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // vignette + danger
    const lowHp = game.state === 'playing' && game.hp <= 2 ? (game.hp <= 1 ? 0.55 : 0.3) : 0;
    const dangerPulse = lowHp * (0.65 + Math.sin(game.time * 6) * 0.35);
    const vig = ctx.createRadialGradient(
      this.cssW / 2,
      this.cssH / 2,
      Math.min(this.cssW, this.cssH) * 0.28,
      this.cssW / 2,
      this.cssH / 2,
      Math.max(this.cssW, this.cssH) * 0.75,
    );
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, `rgba(2,2,10,${0.72 + game.vignettePulse * 0.15})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, this.cssW, this.cssH);

    if (dangerPulse > 0 || game.hurtFlash > 0) {
      const a = Math.max(dangerPulse * 0.5, game.hurtFlash * 0.5);
      const dv = ctx.createRadialGradient(
        this.cssW / 2,
        this.cssH / 2,
        Math.min(this.cssW, this.cssH) * 0.2,
        this.cssW / 2,
        this.cssH / 2,
        Math.max(this.cssW, this.cssH) * 0.62,
      );
      dv.addColorStop(0, 'rgba(255,40,80,0)');
      dv.addColorStop(1, `rgba(255,40,80,${a})`);
      ctx.fillStyle = dv;
      ctx.fillRect(0, 0, this.cssW, this.cssH);
    }

    if (game.overcharge > 0) {
      const a = 0.10 + Math.sin(game.time * 9) * 0.03;
      const ov = ctx.createRadialGradient(
        this.cssW / 2,
        this.cssH / 2,
        Math.min(this.cssW, this.cssH) * 0.25,
        this.cssW / 2,
        this.cssH / 2,
        Math.max(this.cssW, this.cssH) * 0.7,
      );
      ov.addColorStop(0, 'rgba(255,209,102,0)');
      ov.addColorStop(1, `rgba(255,180,60,${a})`);
      ctx.fillStyle = ov;
      ctx.fillRect(0, 0, this.cssW, this.cssH);
    }

    // scanlines for texture
    if (this.scan) {
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = this.scan;
      ctx.fillRect(0, 0, this.cssW, this.cssH);
      ctx.globalAlpha = 1;
    }

    if (input.isTouch && uiAlpha > 0.01) this.drawTouchUI(game, input, uiAlpha);
  }

  private drawMarks(game: Game) {
    const ctx = this.ctx;
    const ms = this.mapSkin;
    for (const m of game.marks) {
      const t = m.t / m.dur;
      const pulse = 0.5 + Math.sin(m.t * 26) * 0.5;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(m.x, m.y, 30 + t * 22, ms.enemyAccent, 0.22 + pulse * 0.25);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = this.fade(ms.ringColor, 0.35 + pulse * 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 10 + (1 - t) * 30, 0, TAU);
      ctx.stroke();
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.t * 3);
      ctx.strokeStyle = this.fade(ms.ringColor, 0.5 + pulse * 0.4);
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, 18, (i * TAU) / 3, (i * TAU) / 3 + 1);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  private drawShards(game: Game) {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'lighter';
    for (const s of game.shards) {
      const p = 0.7 + Math.sin(s.t * 12) * 0.3;
      this.blob(s.x, s.y, 11 * p, '#79f2ff', 0.55);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.t * 5);
      ctx.fillStyle = '#dffaff';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(3, 0);
      ctx.lineTo(0, 5);
      ctx.lineTo(-3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawPickups(game: Game) {
    const ctx = this.ctx;
    for (const p of game.pickups) {
      const bob = Math.sin(p.t * 5) * 3;
      const fade = p.life < 3 ? 0.4 + Math.sin(p.t * 20) * 0.4 : 1;
      ctx.globalAlpha = fade;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(p.x, p.y + bob, 24, '#7dffb2', 0.5);
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.translate(p.x, p.y + bob);
      ctx.fillStyle = '#7dffb2';
      ctx.strokeStyle = '#0a2a1c';
      ctx.lineWidth = 2;
      const r = 8;
      ctx.beginPath();
      ctx.moveTo(0, r * 0.75);
      ctx.bezierCurveTo(-r * 1.5, -r * 0.2, -r * 0.6, -r * 1.2, 0, -r * 0.4);
      ctx.bezierCurveTo(r * 0.6, -r * 1.2, r * 1.5, -r * 0.2, 0, r * 0.75);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  private drawOrbs(game: Game) {
    const ctx = this.ctx;
    for (const o of game.orbs) {
      const bob = Math.sin(o.t * 4 + o.x * 0.01) * 4;
      const y = o.y + bob;
      const fadeK = o.life < 2 ? 0.45 + Math.sin(o.t * 18) * 0.35 : 1;
      const col =
        o.kind === 'might'
          ? '#ff8a3d'
          : o.kind === 'zap' || o.kind === 'blink_free'
            ? '#79f2ff'
            : o.kind === 'speed_boost'
              ? '#6dffb0'
              : o.kind === 'slow_mo'
                ? '#c9a6ff'
                : o.kind === 'hyper_speed'
                  ? '#ff4d6d'
                  : o.kind === 'ghost_pass'
                    ? '#f0a0ff'
                    : o.kind === 'magnet'
                      ? '#b6ff5c'
                      : o.kind === 'shield_orb'
                        ? '#7af5ff'
                        : o.kind === 'tri'
                          ? '#52e3ff'
                          : o.kind === 'freeze'
                            ? '#a0f0ff'
                            : o.kind === 'score2x'
                              ? '#ffae52'
                              : '#ffd166';
      ctx.globalAlpha = fadeK;
      // ground marker
      ctx.strokeStyle = this.fade(col, 0.45);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(o.x, o.y + 17, 17, 6, 0, 0, TAU);
      ctx.stroke();
      ctx.globalCompositeOperation = 'lighter';
      this.blob(o.x, y, 32 + Math.sin(o.t * 6) * 4, col, 0.55);
      ctx.globalCompositeOperation = 'source-over';
      // core + shell
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(o.x, y, 9, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(o.x, y, 13.5, 0, TAU);
      ctx.stroke();
      // icon
      ctx.save();
      ctx.translate(o.x, y);
      if (o.kind === 'might') {
        ctx.rotate(o.t * 1.5);
        ctx.strokeStyle = '#8a4a12';
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(0, -6.5);
          ctx.lineTo(0, 6.5);
          ctx.stroke();
        }
      } else if (o.kind === 'zap') {
        ctx.fillStyle = '#0d4a5c';
        ctx.beginPath();
        ctx.moveTo(2.4, -7);
        ctx.lineTo(-3.4, 0.6);
        ctx.lineTo(-0.4, 0.6);
        ctx.lineTo(-2.4, 7);
        ctx.lineTo(3.4, -0.6);
        ctx.lineTo(0.4, -0.6);
        ctx.closePath();
        ctx.fill();
      } else if (o.kind === 'surge') {
        ctx.strokeStyle = '#6b520a';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-5, -1);
        ctx.lineTo(0, -6.5);
        ctx.lineTo(5, -1);
        ctx.moveTo(-5, 4.5);
        ctx.lineTo(0, -1);
        ctx.lineTo(5, 4.5);
        ctx.stroke();
      } else if (o.kind === 'tri') {
        ctx.strokeStyle = '#0e3a4a';
        ctx.lineWidth = 2.0;
        for (const ang of [-0.65, 0, 0.65]) {
          ctx.save();
          ctx.rotate(ang - Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, -2);
          ctx.lineTo(0, -7.5);
          ctx.stroke();
          ctx.restore();
        }
      } else if (o.kind === 'freeze') {
        ctx.rotate(o.t * 0.8);
        ctx.strokeStyle = '#124254';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 3; i++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(-6.5, 0);
          ctx.lineTo(6.5, 0);
          ctx.stroke();
        }
      } else if (o.kind === 'score2x') {
        ctx.font = `900 10px ${CANVAS_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#61350a';
        ctx.fillText('2X', 0, 0.8);
      } else if (o.kind === 'blink_free') {
        ctx.strokeStyle = '#08485e';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, 5.5, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = '#08485e';
        ctx.font = `800 9px ${CANVAS_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('0', 0, 0.5);
      } else if (o.kind === 'speed_boost') {
        ctx.strokeStyle = '#0e522e';
        ctx.lineWidth = 2.2;
        for (const dx of [-3, 3]) {
          ctx.beginPath();
          ctx.moveTo(dx - 3, -4);
          ctx.lineTo(dx + 2, 0);
          ctx.lineTo(dx - 3, 4);
          ctx.stroke();
        }
      } else if (o.kind === 'slow_mo') {
        ctx.strokeStyle = '#391a61';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-4.5, -5);
        ctx.lineTo(4.5, -5);
        ctx.moveTo(-4.5, 5);
        ctx.lineTo(4.5, 5);
        ctx.moveTo(-3.5, -5);
        ctx.lineTo(3.5, 5);
        ctx.moveTo(3.5, -5);
        ctx.lineTo(-3.5, 5);
        ctx.stroke();
      } else if (o.kind === 'hyper_speed') {
        ctx.strokeStyle = '#5e0b1c';
        ctx.lineWidth = 2.2;
        for (const dx of [-4, 0, 4]) {
          ctx.beginPath();
          ctx.moveTo(dx - 2.5, -4);
          ctx.lineTo(dx + 2.5, 0);
          ctx.lineTo(dx - 2.5, 4);
          ctx.stroke();
        }
      } else if (o.kind === 'ghost_pass') {
        // little ghost silhouette
        ctx.fillStyle = '#6b1e78';
        ctx.beginPath();
        ctx.arc(0, -1.5, 5, Math.PI, 0);
        ctx.lineTo(5, 5);
        ctx.lineTo(2.5, 2.8);
        ctx.lineTo(0, 5);
        ctx.lineTo(-2.5, 2.8);
        ctx.lineTo(-5, 5);
        ctx.closePath();
        ctx.fill();
      } else if (o.kind === 'magnet') {
        // horseshoe magnet
        ctx.strokeStyle = '#2c5c0d';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.arc(0, 0.5, 4.6, Math.PI, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-4.6, 0.5);
        ctx.lineTo(-4.6, 5);
        ctx.moveTo(4.6, 0.5);
        ctx.lineTo(4.6, 5);
        ctx.stroke();
      } else if (o.kind === 'shield_orb') {
        ctx.fillStyle = '#0c4a56';
        ctx.beginPath();
        ctx.moveTo(0, -6.5);
        ctx.lineTo(5.5, -3.5);
        ctx.lineTo(5.5, 1.5);
        ctx.quadraticCurveTo(5.5, 5.5, 0, 7);
        ctx.quadraticCurveTo(-5.5, 5.5, -5.5, 1.5);
        ctx.lineTo(-5.5, -3.5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  /** Lexicon: centre word, scattered letter runes, and the eraser rune. */
  private drawLexicon(game: Game) {
    const ctx = this.ctx;
    const ms = this.mapSkin;
    const t = this.t();
    const cx = game.W / 2;
    const cy = game.H / 2;

    /* ---- the target word in the middle of the arena ---- */
    if (game.wordTarget) {
      const chars = game.wordTarget.split('');
      // Persian reads right-to-left, so slot 0 must sit on the RIGHT
      const rtl = this.lang === 'fa';
      const size = 46;
      const gap = size * 1.35;
      const totalW = chars.length * gap;
      const startX = cx - totalW / 2 + gap / 2;
      const slotX = (i: number) => (rtl ? startX + (chars.length - 1 - i) * gap : startX + i * gap);

      ctx.globalCompositeOperation = 'lighter';
      this.blob(cx, cy, totalW * 0.75, ms.borderOuter, 0.14);
      ctx.globalCompositeOperation = 'source-over';

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      chars.forEach((ch, i) => {
        const solved = i < game.wordTyped.length;
        const correct = solved && game.wordTyped[i] === ch;
        const x = slotX(i);
        // slot plate
        ctx.fillStyle = solved ? (correct ? 'rgba(20,60,40,0.75)' : 'rgba(70,18,24,0.8)') : 'rgba(8,12,26,0.7)';
        ctx.strokeStyle = solved ? (correct ? '#7dffb2' : '#ff4d6d') : this.fade(ms.borderOuter, 0.5);
        ctx.lineWidth = 2.5;
        const w = size * 0.95;
        const h = size * 1.24;
        const rx = x - w / 2;
        const ry = cy - size * 0.62;
        const rr = 8;
        // manual rounded rect (ctx.roundRect isn't available everywhere)
        ctx.beginPath();
        ctx.moveTo(rx + rr, ry);
        ctx.lineTo(rx + w - rr, ry);
        ctx.quadraticCurveTo(rx + w, ry, rx + w, ry + rr);
        ctx.lineTo(rx + w, ry + h - rr);
        ctx.quadraticCurveTo(rx + w, ry + h, rx + w - rr, ry + h);
        ctx.lineTo(rx + rr, ry + h);
        ctx.quadraticCurveTo(rx, ry + h, rx, ry + h - rr);
        ctx.lineTo(rx, ry + rr);
        ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // letter: revealed once solved, otherwise the requested glyph in outline
        ctx.font = `800 ${size * 0.72}px ${CANVAS_FONT}`;
        if (solved) {
          ctx.fillStyle = correct ? '#bfffe0' : '#ffc0cb';
          ctx.fillText(game.wordTyped[i], x, cy);
        } else {
          ctx.fillStyle = this.fade(ms.borderOuter, 0.9);
          ctx.fillText(ch, x, cy);
        }
      });

      // progress underline
      const k = clamp(game.wordTyped.length / chars.length, 0, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(cx - totalW / 2, cy + size * 0.78, totalW, 4);
      ctx.fillStyle = '#7dffb2';
      ctx.fillRect(cx - totalW / 2, cy + size * 0.78, totalW * k, 4);

      // countdown bar right under the word, so you never look away
      const limit = game.wordLimit();
      const left = Math.max(0, limit - game.wordTimer);
      const tk = clamp(left / limit, 0, 1);
      const low = left <= 4;
      const barW = totalW;
      const barY = cy + size * 0.78 + 12;
      ctx.fillStyle = 'rgba(6,10,22,0.8)';
      ctx.fillRect(cx - barW / 2 - 1, barY - 1, barW + 2, 8);
      ctx.fillStyle = low ? '#ff4d6d' : tk < 0.5 ? '#ffd166' : '#7dffb2';
      ctx.globalAlpha = low ? 0.6 + Math.sin(game.time * 14) * 0.4 : 1;
      ctx.fillRect(cx - barW / 2, barY, barW * tk, 6);
      ctx.globalAlpha = 1;
      // seconds readout
      ctx.textAlign = 'center';
      ctx.font = `800 15px ${CANVAS_FONT}`;
      ctx.strokeStyle = 'rgba(4,6,18,0.9)';
      ctx.lineWidth = 5;
      ctx.strokeText(`${left.toFixed(1)}s`, cx, barY + 24);
      ctx.fillStyle = low ? '#ff8fa3' : '#bfffe0';
      ctx.fillText(`${left.toFixed(1)}s`, cx, barY + 24);

      // solved / failed tally above the word
      ctx.font = `800 13px ${CANVAS_FONT}`;
      const tally = `✓ ${game.wordsDone}    ✕ ${game.wordsFailed}`;
      ctx.strokeStyle = 'rgba(4,6,18,0.9)';
      ctx.lineWidth = 5;
      ctx.strokeText(tally, cx, cy - size * 1.15);
      ctx.fillStyle = '#9fd8ff';
      ctx.fillText(tally, cx, cy - size * 1.15);

      // persistent sudden-death badge once timers are halved
      if (game.wordHalved) {
        ctx.font = `800 11px ${CANVAS_FONT}`;
        const tag = `⚡ ${t.halvedTag} ⚡`;
        ctx.globalAlpha = 0.75 + Math.sin(game.time * 6) * 0.25;
        ctx.strokeStyle = 'rgba(4,6,18,0.9)';
        ctx.lineWidth = 4;
        ctx.strokeText(tag, cx, cy - size * 1.5);
        ctx.fillStyle = '#ff4d6d';
        ctx.fillText(tag, cx, cy - size * 1.5);
        ctx.globalAlpha = 1;
      }
    }

    /* ---- scattered letter runes ---- */
    for (const l of game.letters) {
      if (l.taken) continue;
      const bad = !!l.imposter;
      const bob = Math.sin(l.t * (bad ? 5.2 : 3.4) + l.x * 0.02) * (bad ? 7 : 5);
      const y = l.y + bob;
      const col = bad ? '#ff4d6d' : ms.borderOuter;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(l.x, y, (bad ? 44 : 38) + Math.sin(l.t * 6) * 4, col, bad ? 0.6 : 0.45);
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.translate(l.x, y);
      ctx.rotate(bad ? l.t * 1.4 : Math.sin(l.t * 1.2) * 0.12);
      ctx.fillStyle = bad ? 'rgba(40,6,14,0.92)' : 'rgba(6,10,22,0.88)';
      ctx.strokeStyle = col;
      ctx.lineWidth = bad ? 3.5 : 3;
      ctx.beginPath();
      if (bad) {
        // jagged 8-point spike plate — instantly reads as "do not touch"
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU - Math.PI / 2;
          const rr = i % 2 === 0 ? 30 : 19;
          const px = Math.cos(a) * rr;
          const py = Math.sin(a) * rr;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      } else {
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU - Math.PI / 2;
          const px = Math.cos(a) * 27;
          const py = Math.sin(a) * 27;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // glyph
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `800 28px ${CANVAS_FONT}`;
      ctx.strokeStyle = 'rgba(4,6,18,0.9)';
      ctx.lineWidth = 5;
      ctx.strokeText(l.ch, l.x, y + 1);
      ctx.fillStyle = bad ? '#ffc0cb' : '#ffffff';
      ctx.fillText(l.ch, l.x, y + 1);
      // ground marker
      ctx.strokeStyle = this.fade(col, bad ? 0.5 : 0.3);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(l.x, l.y + 30, 18, 6, 0, 0, TAU);
      ctx.stroke();
    }

    /* ---- eraser rune (slash it) ---- */
    const er = game.eraser;
    const pulse = 0.7 + Math.sin(er.t * 4) * 0.3;
    const hot = er.flash > 0.05;
    ctx.globalCompositeOperation = 'lighter';
    this.blob(er.x, er.y, er.r * (hot ? 3.4 : 2.3), '#ff4d6d', (hot ? 0.7 : 0.32) * pulse);
    ctx.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.translate(er.x, er.y);
    ctx.rotate(er.t * 0.7);
    ctx.fillStyle = 'rgba(38,8,16,0.9)';
    ctx.strokeStyle = hot ? '#ffffff' : '#ff4d6d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      const rr = er.r * (i % 2 === 0 ? 1 : 0.72);
      const px = Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // X glyph
    ctx.strokeStyle = hot ? '#ffffff' : '#ff9ec4';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(er.x - 12, er.y - 12);
    ctx.lineTo(er.x + 12, er.y + 12);
    ctx.moveTo(er.x + 12, er.y - 12);
    ctx.lineTo(er.x - 12, er.y + 12);
    ctx.stroke();
    // label
    ctx.textAlign = 'center';
    ctx.font = `800 10px ${CANVAS_FONT}`;
    ctx.strokeStyle = 'rgba(4,6,18,0.9)';
    ctx.lineWidth = 4;
    ctx.strokeText(t.eraserLabel, er.x, er.y + er.r + 16);
    ctx.fillStyle = '#ff9ec4';
    ctx.fillText(t.eraserLabel, er.x, er.y + er.r + 16);

    /* ---- phase / solved banner ---- */
    if (game.wordBanner > 0) {
      const a = Math.min(1, game.wordBanner * 1.6);
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.font = `800 34px ${CANVAS_FONT}`;
      ctx.strokeStyle = 'rgba(4,6,18,0.92)';
      ctx.lineWidth = 8;
      ctx.strokeText(game.wordBannerText, cx, game.H * 0.2);
      ctx.fillStyle = game.wordBannerColor;
      ctx.fillText(game.wordBannerText, cx, game.H * 0.2);
      ctx.globalAlpha = 1;
    }
  }

  private drawBladeDrops(game: Game) {
    const ctx = this.ctx;
    for (const d of game.bladeDrops) {
      const b = rushBladeById(d.id);
      const bob = Math.sin(d.t * 4) * 3;
      const y = d.y + bob;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(d.x, y, 40 + Math.sin(d.t * 7) * 5, b.glow, 0.55);
      ctx.globalCompositeOperation = 'source-over';
      // pickup halo
      ctx.strokeStyle = this.fade(b.glow, 0.75);
      ctx.lineWidth = 2.5;
      ctx.setLineDash([9, 8]);
      ctx.lineDashOffset = -d.t * 40;
      ctx.beginPath();
      ctx.arc(d.x, y, 24, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      // the blade itself, slowly spinning — draws the correct shape per type
      ctx.save();
      ctx.translate(d.x, y);
      ctx.rotate(d.t * 1.6);
      ctx.fillStyle = b.blade;
      ctx.strokeStyle = b.glow;
      ctx.lineWidth = 2;
      if (b.type === 'axe') {
        // shuriken
        drawShuriken(ctx, 0.55);
        ctx.lineJoin = 'miter';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = b.guard;
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, TAU);
        ctx.fill();
      } else if (b.type === 'katana') {
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.quadraticCurveTo(11, -4, -8, -2);
        ctx.lineTo(-8, 2);
        ctx.quadraticCurveTo(11, 3, 22, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'dagger') {
        ctx.beginPath();
        ctx.moveTo(14, 0);
        ctx.lineTo(5, -3.5);
        ctx.lineTo(-8, -2.5);
        ctx.lineTo(-8, 2.5);
        ctx.lineTo(5, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'spear') {
        ctx.beginPath();
        ctx.moveTo(24, 0);
        ctx.lineTo(14, -4);
        ctx.lineTo(8, -2.5);
        ctx.lineTo(8, 2.5);
        ctx.lineTo(14, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = b.grip;
        ctx.fillRect(-16, -1.5, 24, 3);
      } else if (b.type === 'great') {
        ctx.beginPath();
        ctx.moveTo(18, -5);
        ctx.lineTo(16, 0);
        ctx.lineTo(18, 5);
        ctx.lineTo(-8, 6.5);
        ctx.lineTo(-8, -6.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (b.type === 'saber') {
        ctx.beginPath();
        ctx.moveTo(20, -0.5);
        ctx.quadraticCurveTo(8, -6, -8, -3);
        ctx.lineTo(-8, 2);
        ctx.quadraticCurveTo(8, 3, 20, -0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        // longsword fallback
        ctx.beginPath();
        ctx.moveTo(20, 0);
        ctx.lineTo(9, -4.5);
        ctx.lineTo(-11, -3);
        ctx.lineTo(-11, 3);
        ctx.lineTo(9, 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
      // reach tag
      ctx.font = `800 9px ${CANVAS_FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const t = this.t();
      const tag = b.reach >= 1.4 ? t.reachLong : b.reach <= 0.75 ? t.reachShort : t.reachMid;
      ctx.strokeStyle = 'rgba(4,6,18,0.9)';
      ctx.lineWidth = 4;
      ctx.strokeText(tag, d.x, y + 38);
      ctx.fillStyle = b.glow;
      ctx.fillText(tag, d.x, y + 38);
    }
  }

  private drawObstacles(game: Game) {
    const ctx = this.ctx;
    const ms = this.mapSkin;
    for (const o of game.obstacles) {
      if (o.dead) continue;
      if (o.kind === 'wall_gap') {
        const h = o.h;
        ctx.fillStyle = ms.floorCenter;
        ctx.strokeStyle = ms.borderOuter;
        ctx.lineWidth = 3;
        if (o.gapX > 0) {
          ctx.fillRect(0, o.y, o.gapX, h);
          ctx.strokeRect(0, o.y, o.gapX, h);
        }
        const rightX = o.gapX + o.gapW;
        if (rightX < game.W) {
          ctx.fillRect(rightX, o.y, game.W - rightX, h);
          ctx.strokeRect(rightX, o.y, game.W - rightX, h);
        }
        ctx.globalCompositeOperation = 'lighter';
        this.blob(o.gapX, o.y + h / 2, 28, ms.enemyAccent, 0.4);
        this.blob(rightX, o.y + h / 2, 28, ms.enemyAccent, 0.4);
        ctx.globalCompositeOperation = 'source-over';
      } else if (o.kind === 'laser_gate') {
        const cy = o.y + o.h / 2;
        const pulse = 0.75 + Math.sin(game.time * 16) * 0.25;
        // emitter pylons
        ctx.fillStyle = ms.enemyBody;
        ctx.strokeStyle = o.gateOpen ? 'rgba(140,255,190,0.85)' : '#ff2e55';
        ctx.lineWidth = 3;
        ctx.fillRect(0, o.y - 8, 30, o.h + 16);
        ctx.strokeRect(0, o.y - 8, 30, o.h + 16);
        ctx.fillRect(game.W - 30, o.y - 8, 30, o.h + 16);
        ctx.strokeRect(game.W - 30, o.y - 8, 30, o.h + 16);

        if (!o.gateOpen) {
          // DANGER: thick, layered, unmistakably red beam
          ctx.globalCompositeOperation = 'lighter';
          this.blob((game.W) / 2, cy, game.W * 0.55, '#ff2e55', 0.22 * pulse);
          ctx.strokeStyle = '#ff2e55';
          ctx.lineWidth = 22 * pulse;
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.moveTo(30, cy);
          ctx.lineTo(game.W - 30, cy);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.strokeStyle = '#ff5c7a';
          ctx.lineWidth = 11;
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.globalCompositeOperation = 'source-over';
          // hazard chevrons so it reads instantly
          ctx.fillStyle = '#ffd166';
          for (let hx = 46; hx < game.W - 46; hx += 90) {
            ctx.beginPath();
            ctx.moveTo(hx, cy - 13);
            ctx.lineTo(hx + 11, cy);
            ctx.lineTo(hx, cy + 13);
            ctx.closePath();
            ctx.fill();
          }
          // emitter cores
          ctx.globalCompositeOperation = 'lighter';
          this.blob(30, cy, 34, '#ff2e55', 0.75);
          this.blob(game.W - 30, cy, 34, '#ff2e55', 0.75);
          ctx.globalCompositeOperation = 'source-over';
        } else {
          // SAFE: clearly green dashed "pass now" corridor
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = '#4dff9e';
          ctx.lineWidth = 6;
          ctx.globalAlpha = 0.5;
          ctx.setLineDash([18, 14]);
          ctx.lineDashOffset = -game.time * 90;
          ctx.beginPath();
          ctx.moveTo(30, cy);
          ctx.lineTo(game.W - 30, cy);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
          this.blob(30, cy, 26, '#4dff9e', 0.55);
          this.blob(game.W - 30, cy, 26, '#4dff9e', 0.55);
          ctx.globalCompositeOperation = 'source-over';
        }
        // countdown pip showing when the beam flips
        if (o.gatePeriod) {
          const k = clamp((o.gateT || 0) / o.gatePeriod, 0, 1);
          ctx.strokeStyle = o.gateOpen ? 'rgba(120,255,180,0.9)' : 'rgba(255,180,190,0.9)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(game.W / 2, cy, 15, -Math.PI / 2, -Math.PI / 2 + TAU * k);
          ctx.stroke();
        }
      } else if (o.kind === 'spike_block') {
        ctx.fillStyle = ms.enemyBody;
        ctx.strokeStyle = ms.enemyAccent;
        ctx.lineWidth = 3;
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.strokeRect(o.x, o.y, o.w, o.h);
        ctx.fillStyle = ms.enemyAccent;
        const count = Math.floor(o.w / 20);
        for (let i = 0; i < count; i++) {
          const sx = o.x + 10 + i * 20;
          ctx.beginPath();
          ctx.moveTo(sx - 6, o.y);
          ctx.lineTo(sx, o.y - 8);
          ctx.lineTo(sx + 6, o.y);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = ms.enemyBody;
        ctx.strokeStyle = ms.enemyAccent;
        ctx.lineWidth = 4;
        if (o.gapX > 0) {
          ctx.fillRect(0, o.y, o.gapX, o.h);
          ctx.strokeRect(0, o.y, o.gapX, o.h);
        }
        const rightX = o.gapX + o.gapW;
        if (rightX < game.W) {
          ctx.fillRect(rightX, o.y, game.W - rightX, o.h);
          ctx.strokeRect(rightX, o.y, game.W - rightX, o.h);
        }
      }

      // Blade Rush: white impact flash + a slim HP bar so you can read durability
      if (game.mode === 'rush' && o.maxHp) {
        if (o.flash && o.flash > 0.05) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = o.flash * 0.5;
          ctx.fillStyle = '#ffffff';
          if (o.kind === 'spike_block') ctx.fillRect(o.x, o.y, o.w, o.h);
          else ctx.fillRect(0, o.y, game.W, o.h);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        }
        const k = clamp((o.hp ?? 0) / o.maxHp, 0, 1);
        const bw = o.kind === 'spike_block' ? o.w * 0.7 : 150;
        const bx = (o.kind === 'spike_block' ? o.x + o.w / 2 : game.W / 2) - bw / 2;
        const by = o.y - 11;
        ctx.fillStyle = 'rgba(6,8,20,0.8)';
        ctx.fillRect(bx - 1, by - 1, bw + 2, 6);
        ctx.fillStyle = k > 0.5 ? '#7dffb2' : k > 0.25 ? '#ffd166' : '#ff4d6d';
        ctx.fillRect(bx, by, bw * k, 4);
      }
    }
  }

  private drawTether(game: Game) {
    const s = game.sw;
    if (s.state === 'held') return;
    const ctx = this.ctx;
    const d = Math.hypot(s.x - game.px, s.y - game.py);
    const segs = clamp(Math.floor(d / 30) + 2, 3, 18);
    ctx.globalCompositeOperation = 'lighter';
    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      ctx.moveTo(game.px, game.py);
      for (let i = 1; i <= segs; i++) {
        const t = i / segs;
        const nx = -(s.y - game.py) / (d || 1);
        const ny = (s.x - game.px) / (d || 1);
        const j = i === segs ? 0 : Math.sin(t * 9 + game.time * 22 + pass * 2) * 9 * Math.sin(t * Math.PI);
        ctx.lineTo(lerp(game.px, s.x, t) + nx * j, lerp(game.py, s.y, t) + ny * j);
      }
      ctx.strokeStyle = pass === 0 ? this.fade(this.swordSkin.glow, 0.35) : 'rgba(255,255,255,0.25)';
      ctx.lineWidth = pass === 0 ? 3 : 1.2;
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  private drawProjectiles(game: Game) {
    const ctx = this.ctx;
    for (const p of game.projs) {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(p.x, p.y, 22 + Math.sin(p.t * 14) * 3, '#a97bff', 0.7);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#e6d9ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 0.55, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(169,123,255,0.9)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.stroke();
    }
  }

  // ------------------------------------------------------------ characters
  private drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, time: number) {
    const spawnK = e.state === 'spawn' ? clamp(e.t / 0.45, 0, 1) : 1;
    const sq = 1 + e.squash * 0.35;
    const st = 1 - e.squash * 0.25;
    ctx.save();
    ctx.translate(e.x, e.y);

    // shadow
    ctx.globalAlpha = 0.35 * spawnK;
    ctx.fillStyle = '#02030c';
    ctx.beginPath();
    ctx.ellipse(0, e.r * 0.55, e.r * 0.95, e.r * 0.42, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.rotate(e.angle + Math.PI / 2);
    ctx.scale(spawnK * st, spawnK * sq);

    const flash = e.hitFlash;
    const ms = this.mapSkin;
    const accent =
      ms.id !== 'storm'
        ? ms.enemyAccent
        : e.kind === 'hound'
          ? '#ff8a3d'
          : e.kind === 'wisp' || e.kind === 'weaver' || e.kind === 'boss_serpent'
            ? '#c9a6ff'
            : e.kind === 'brute' || e.kind === 'goliath' || e.kind === 'boss_colossus'
              ? '#ff2e63'
              : e.kind === 'phantom' || e.kind === 'boss_gargoyle'
                ? '#ad87ff'
                : e.kind === 'apex' || e.kind === 'boss_warden'
                  ? '#7af5ff'
                  : e.kind === 'boss_sovereign'
                    ? '#ffd166'
                    : '#ff4d6d';

    if (e.kind === 'wisp' || e.kind === 'weaver') {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(0, 0, e.r * 2.4, ms.enemyGlow, 0.45 + (e.state === 'wind' ? 0.3 : 0));
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = this.fade(ms.enemyGlow, 0.75);
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU + time * 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * e.r * 0.5, Math.sin(a) * e.r * 0.5);
        ctx.quadraticCurveTo(
          Math.cos(a) * e.r * 1.5,
          Math.sin(a) * e.r * 1.5,
          Math.cos(a + Math.sin(time * 3 + i) * 0.6) * e.r * 2.1,
          Math.sin(a + Math.sin(time * 3 + i) * 0.6) * e.r * 2.1,
        );
        ctx.stroke();
      }
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.beginPath();
      ctx.arc(0, 0, e.r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = e.state === 'wind' ? '#fff' : ms.enemyEye;
      ctx.beginPath();
      ctx.arc(0, -e.r * 0.15, e.r * 0.34, 0, TAU);
      ctx.fill();
    } else if (e.kind === 'brute' || e.kind === 'goliath') {
      if (e.state === 'wind') {
        const k = clamp(e.t / 0.85, 0, 1);
        ctx.globalCompositeOperation = 'lighter';
        this.blob(0, 0, 175 * k, ms.enemyGlow, 0.18 + k * 0.2);
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = this.fade(ms.enemyAccent, 0.35 + k * 0.5);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 175 * k, 0, TAU);
        ctx.stroke();
      }
      const bodyFill = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.fillStyle = bodyFill;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      const spikes = 9;
      for (let i = 0; i <= spikes; i++) {
        const a = (i / spikes) * TAU;
        const rr = e.r * (i % 2 === 0 ? 1.12 : 0.78) * (1 + Math.sin(time * 4 + i) * 0.03);
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr * 1.05;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // plates
      ctx.strokeStyle = 'rgba(255,90,120,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, e.r * 0.6, 0, TAU);
      ctx.stroke();
      // eyes
      ctx.fillStyle = e.state === 'wind' ? '#fff' : '#ff2e63';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx * e.r * 0.3, -e.r * 0.42, e.r * 0.16, e.r * 0.1, sx * 0.4, 0, TAU);
        ctx.fill();
      }
    } else if (e.kind === 'phantom') {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(0, 0, e.r * 2.2, ms.enemyGlow, 0.4);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -e.r * 1.6);
      ctx.lineTo(e.r * 0.75, e.r * 0.9);
      ctx.lineTo(0, e.r * 0.4);
      ctx.lineTo(-e.r * 0.75, e.r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = flash > 0.1 ? '#000' : ms.enemyEye;
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * e.r * 0.26, -e.r * 0.35, e.r * 0.14, 0, TAU);
        ctx.fill();
      }
    } else if (e.kind === 'apex') {
      if (e.state === 'wind') {
        ctx.globalCompositeOperation = 'lighter';
        this.blob(0, -e.r, e.r * 2.6, ms.enemyGlow, 0.45);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -e.r * 1.8);
      ctx.lineTo(e.r * 0.9, -e.r * 0.3);
      ctx.lineTo(e.r * 0.6, e.r * 0.95);
      ctx.lineTo(0, e.r * 0.6);
      ctx.lineTo(-e.r * 0.6, e.r * 0.95);
      ctx.lineTo(-e.r * 0.9, -e.r * 0.3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = 'rgba(122,245,255,0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, e.r * 0.5);
      ctx.lineTo(0, -e.r * 1.2);
      ctx.stroke();
      ctx.fillStyle = flash > 0.1 ? '#000' : '#ffffff';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx * e.r * 0.32, -e.r * 0.65, e.r * 0.16, e.r * 0.1, sx * 0.5, 0, TAU);
        ctx.fill();
      }
    } else if (e.kind === 'boss_warden') {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(0, 0, e.r * 2.5, ms.enemyGlow, 0.5);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -e.r * 1.8);
      ctx.lineTo(e.r * 0.9, -e.r * 0.4);
      ctx.lineTo(e.r * 0.7, e.r * 0.95);
      ctx.lineTo(-e.r * 0.7, e.r * 0.95);
      ctx.lineTo(-e.r * 0.9, -e.r * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-e.r * 0.5, -e.r * 1.8);
      ctx.lineTo(-e.r * 0.3, -e.r * 2.2);
      ctx.lineTo(0, -e.r * 1.9);
      ctx.lineTo(e.r * 0.3, -e.r * 2.2);
      ctx.lineTo(e.r * 0.5, -e.r * 1.8);
      ctx.stroke();
      ctx.fillStyle = flash > 0.1 ? '#000' : '#ffffff';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * e.r * 0.3, -e.r * 0.6, e.r * 0.15, 0, TAU);
        ctx.fill();
      }
    } else if (e.kind === 'boss_gargoyle') {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(0, 0, e.r * 2.6, ms.enemyGlow, 0.55);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, -e.r * 1.9);
      ctx.lineTo(e.r * 1.1, -e.r * 0.2);
      ctx.lineTo(e.r * 0.6, e.r * 0.9);
      ctx.lineTo(-e.r * 0.6, e.r * 0.9);
      ctx.lineTo(-e.r * 1.1, -e.r * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-e.r * 0.5, -e.r * 1.5);
      ctx.lineTo(-e.r * 0.9, -e.r * 2.3);
      ctx.moveTo(e.r * 0.5, -e.r * 1.5);
      ctx.lineTo(e.r * 0.9, -e.r * 2.3);
      ctx.stroke();
      ctx.fillStyle = flash > 0.1 ? '#000' : '#ff385c';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx * e.r * 0.35, -e.r * 0.7, e.r * 0.18, e.r * 0.1, sx * 0.4, 0, TAU);
        ctx.fill();
      }
    } else if (e.kind === 'boss_serpent') {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(0, 0, e.r * 2.8, ms.enemyGlow, 0.55);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -e.r * 2.1);
      ctx.quadraticCurveTo(e.r * 1.2, -e.r * 0.8, e.r * 0.8, e.r * 0.95);
      ctx.lineTo(-e.r * 0.8, e.r * 0.95);
      ctx.quadraticCurveTo(-e.r * 1.2, -e.r * 0.8, 0, -e.r * 2.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = flash > 0.1 ? '#000' : '#c9a6ff';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * e.r * 0.35, -e.r * 0.8, e.r * 0.16, 0, TAU);
        ctx.fill();
      }
    } else if (e.kind === 'boss_colossus') {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(0, 0, e.r * 2.8, '#ff5e3a', 0.6);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.strokeStyle = '#ff5e3a';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      const spikes = 11;
      for (let i = 0; i <= spikes; i++) {
        const a = (i / spikes) * TAU;
        const rr = e.r * (i % 2 === 0 ? 1.15 : 0.85);
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr * 1.05;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = flash > 0.1 ? '#000' : '#ffd166';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * e.r * 0.35, -e.r * 0.5, e.r * 0.18, 0, TAU);
        ctx.fill();
      }
    } else if (e.kind === 'boss_sovereign') {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(0, 0, e.r * 3.2, '#ffd166', 0.65);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(0, -e.r * 2.1);
      ctx.lineTo(e.r * 1.1, -e.r * 0.5);
      ctx.lineTo(e.r * 0.8, e.r * 0.95);
      ctx.lineTo(-e.r * 0.8, e.r * 0.95);
      ctx.lineTo(-e.r * 1.1, -e.r * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -e.r * 0.4, e.r * 1.3, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = flash > 0.1 ? '#000' : '#ffffff';
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(sx * e.r * 0.35, -e.r * 0.7, e.r * 0.18, 0, TAU);
        ctx.fill();
      }
    } else {
      // snapper / hound: angular beast
      const long = e.kind === 'hound' ? 1.5 : 1.15;
      const legSwing = Math.sin(e.legPhase) * e.r * 0.42;
      ctx.strokeStyle = 'rgba(20,8,24,1)';
      ctx.lineWidth = 5;
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(sx * e.r * 0.5, -e.r * 0.1);
        ctx.lineTo(sx * e.r * 0.95, -e.r * 0.1 + legSwing * sx);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx * e.r * 0.45, e.r * 0.45);
        ctx.lineTo(sx * e.r * 0.9, e.r * 0.45 - legSwing * sx);
        ctx.stroke();
      }
      if (e.state === 'wind' || e.state === 'dash') {
        ctx.globalCompositeOperation = 'lighter';
        this.blob(0, -e.r, e.r * (e.state === 'dash' ? 2.4 : 1.8), '#ff8a3d', 0.4);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = flash > 0.1 ? '#ffffff' : ms.enemyBody;
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -e.r * long);
      ctx.lineTo(e.r * 0.82, -e.r * 0.15);
      ctx.lineTo(e.r * 0.5, e.r * 0.85);
      ctx.lineTo(0, e.r * 0.55);
      ctx.lineTo(-e.r * 0.5, e.r * 0.85);
      ctx.lineTo(-e.r * 0.82, -e.r * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // dorsal spikes
      ctx.strokeStyle = 'rgba(255,120,150,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, e.r * 0.4);
      ctx.lineTo(0, -e.r * 0.9);
      ctx.stroke();
      // eyes
      ctx.fillStyle = flash > 0.1 ? '#000' : e.state === 'wind' ? '#fff8b0' : accent;
      for (const sx of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx * e.r * 0.28, -e.r * 0.55, e.r * 0.13, e.r * 0.09, sx * 0.5, 0, TAU);
        ctx.fill();
      }
    }

    ctx.restore();

    // frozen shell — clear visual that a frost blade locked this beast
    if ((e.frozenT ?? 0) > 0) {
      ctx.globalCompositeOperation = 'lighter';
      this.blob(e.x, e.y, e.r * 2.4, '#bfe9ff', 0.4);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(210,240,255,0.9)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r * 1.35, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI + e.wob * 0.2;
        ctx.beginPath();
        ctx.moveTo(e.x - Math.cos(a) * e.r * 1.3, e.y - Math.sin(a) * e.r * 1.3);
        ctx.lineTo(e.x + Math.cos(a) * e.r * 1.3, e.y + Math.sin(a) * e.r * 1.3);
        ctx.stroke();
      }
    }

    // health pips
    if (e.hp < e.maxHp && e.maxHp > 3) {
      const w = e.r * 1.8;
      const k = clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(e.x - w / 2, e.y - e.r - 12, w, 4);
      ctx.fillStyle = k > 0.5 ? '#ff8a3d' : '#ff2e63';
      ctx.fillRect(e.x - w / 2, e.y - e.r - 12, w * k, 4);
    }
  }

  private drawPlayer(game: Game, input: Input) {
    const ctx = this.ctx;
    const oc = game.overcharge > 0;
    const hero = this.heroSkin;
    const main = oc ? '#ffd166' : hero.main;

    // blink afterimages
    for (const g of game.blinkGhosts) {
      const t = clamp(g.life / 0.34, 0, 1);
      ctx.globalCompositeOperation = 'lighter';
      this.blob(g.x, g.y, 26 * t, main, t * 0.28 * g.a);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = t * 0.5 * g.a;
      ctx.strokeStyle = main;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(g.x, g.y, game.pr * (0.7 + (1 - t) * 0.5), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (game.state === 'over') return;

    const x = game.px;
    const y = game.py;
    const r = game.pr;
    const f = game.facing;
    const blinking = game.iframes > 0 && Math.floor(game.time * 22) % 2 === 0;

    // aim indicator
    const showAim = game.sw.state === 'held';
    if (showAim && game.state === 'playing') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = input.isTouch ? 0.5 : 0.32;
      ctx.strokeStyle = main;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 10]);
      ctx.lineDashOffset = -game.time * 45;
      ctx.beginPath();
      ctx.moveTo(x + game.aimX * (r + 12), y + game.aimY * (r + 12));
      ctx.lineTo(x + game.aimX * game.sw.maxDist, y + game.aimY * game.sw.maxDist);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // shadow
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#02030c';
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.6, r * 0.9, r * 0.4, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

    // charge ring
    if (game.state === 'playing') {
      const k = oc ? clamp(game.overcharge / 8, 0, 1) : game.charge / 100;
      if (k > 0.01) {
        ctx.strokeStyle = oc ? 'rgba(255,209,102,0.9)' : 'rgba(121,242,255,0.75)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, r + 9, -Math.PI / 2, -Math.PI / 2 + TAU * k);
        ctx.stroke();
      }
      // blink cooldown arc (fills as the teleport recharges)
      if (game.blinkCd > 0) {
        const bk = clamp(1 - game.blinkCd / game.blinkCdMax, 0, 1);
        ctx.strokeStyle = 'rgba(169,123,255,0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, r + 16, -Math.PI / 2, -Math.PI / 2 + TAU * bk);
        ctx.stroke();
      }
      // MIGHT buff timer arc
      if (game.mightT > 0) {
        const mk = clamp(game.mightT / 4, 0, 1);
        ctx.strokeStyle = 'rgba(255,138,61,0.95)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, r + 22, -Math.PI / 2, -Math.PI / 2 + TAU * mk);
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = 'lighter';
    this.blob(x, y, r * (oc ? 3.6 : 2.6), main, oc ? 0.5 : 0.3);
    if (game.mightT > 0) this.blob(x, y, r * 3.2, '#ff8a3d', 0.28);
    if (game.ghostPassT > 0) this.blob(x, y, r * 3.4, '#f0a0ff', 0.3);
    if (game.magnetT > 0) this.blob(x, y, r * 3.0, '#b6ff5c', 0.24);
    ctx.globalCompositeOperation = 'source-over';

    // MAGNET AURA ring
    if (game.magnetT > 0) {
      ctx.strokeStyle = `rgba(182,255,92,${0.25 + Math.sin(game.time * 6) * 0.12})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 12]);
      ctx.lineDashOffset = -game.time * 60;
      ctx.beginPath();
      ctx.arc(x, y, 340 * 0.42, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // CHRONO SHIELD bubble
    if (game.shieldOrbT > 0) {
      const pulse = 0.7 + Math.sin(game.time * 8) * 0.3;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(x, y, r * 3.6, '#7af5ff', 0.22 * pulse);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = `rgba(122,245,255,${0.55 + pulse * 0.35})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.1, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.1 - 5, 0, TAU);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(f + Math.PI / 2);
    if (game.ghostPassT > 0) ctx.globalAlpha = 0.5;
    if (blinking) ctx.globalAlpha = 0.45;

    // cape
    const sway = Math.sin(game.legPhase) * 0.25;
    ctx.fillStyle = oc ? '#4a3410' : hero.cape;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.1);
    ctx.quadraticCurveTo(-r * 1.1 + sway * 8, r * 1.1, 0, r * 1.5);
    ctx.quadraticCurveTo(r * 1.1 + sway * 8, r * 1.1, r * 0.7, -r * 0.1);
    ctx.closePath();
    ctx.fill();

    // legs
    const ls = Math.sin(game.legPhase) * r * 0.4;
    ctx.strokeStyle = '#0d1330';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, r * 0.3);
    ctx.lineTo(-r * 0.35, r * 0.75 + ls);
    ctx.moveTo(r * 0.3, r * 0.3);
    ctx.lineTo(r * 0.35, r * 0.75 - ls);
    ctx.stroke();

    // body
    ctx.fillStyle = oc ? '#241a06' : hero.body;
    ctx.strokeStyle = main;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.15);
    ctx.lineTo(r * 0.78, -r * 0.1);
    ctx.lineTo(r * 0.5, r * 0.62);
    ctx.lineTo(-r * 0.5, r * 0.62);
    ctx.lineTo(-r * 0.78, -r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // chest sigil
    ctx.strokeStyle = oc ? 'rgba(255,220,140,0.95)' : this.fade(hero.sigil, 0.85);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r * 0.16, -r * 0.42);
    ctx.lineTo(r * 0.1, -r * 0.05);
    ctx.lineTo(-r * 0.06, -r * 0.02);
    ctx.lineTo(r * 0.16, r * 0.36);
    ctx.stroke();

    // hood
    ctx.fillStyle = oc ? '#3a2a08' : hero.hood;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.3);
    ctx.lineTo(r * 0.55, -r * 0.35);
    ctx.lineTo(-r * 0.55, -r * 0.35);
    ctx.closePath();
    ctx.fill();
    // eyes
    ctx.fillStyle = oc ? '#fff0c0' : hero.eyes;
    ctx.fillRect(-r * 0.3, -r * 0.72, r * 0.2, r * 0.12);
    ctx.fillRect(r * 0.1, -r * 0.72, r * 0.2, r * 0.12);

    ctx.restore();
    ctx.globalAlpha = 1;

    // slash arc
    if (game.slashT > 0) {
      const k = 1 - game.slashT / 0.24;
      const spread = 1.25;
      const a0 = game.slashDir - spread;
      const a1 = game.slashDir + spread;
      const cur = lerp(a0, a1, clamp(k * 1.25, 0, 1));
      const inner = r + 6;
      const outer = (r + 78) * (game.overcharge > 0 ? 1.3 : 1);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 1 - k * 0.7;
      const grad = ctx.createRadialGradient(x, y, inner, x, y, outer);
      grad.addColorStop(0, 'rgba(255,255,255,0.05)');
      grad.addColorStop(0.7, oc ? 'rgba(255,209,102,0.55)' : 'rgba(121,242,255,0.5)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, outer, Math.max(a0, cur - 1.1), cur);
      ctx.arc(x, y, inner, cur, Math.max(a0, cur - 1.1), true);
      ctx.closePath();
      ctx.fill();
      // leading edge
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(cur) * inner, y + Math.sin(cur) * inner);
      ctx.lineTo(x + Math.cos(cur) * outer, y + Math.sin(cur) * outer);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  private drawSword(game: Game) {
    const ctx = this.ctx;
    const s = game.sw;
    const oc = game.overcharge > 0;
    // Blade Rush uses its own picked-up blade instead of the purchased skin
    const rb = game.mode === 'rush' ? game.rushBlade : null;
    const sk = rb ? ({ ...this.swordSkin, ...rb } as SwordSkin) : this.swordSkin;
    const main = oc ? '#ffd166' : sk.glow;
    const core = oc ? '#fff3cd' : sk.core;
    const guard = oc ? '#8a6a1c' : sk.guard;
    const grip = oc ? '#3a2c08' : sk.grip;

    if (s.state !== 'held' && s.trail.length > 1) {
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 1; i < s.trail.length; i++) {
        const t = i / s.trail.length;
        ctx.globalAlpha = t * 0.5;
        ctx.strokeStyle = main;
        ctx.lineWidth = 14 * t;
        ctx.beginPath();
        ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y);
        ctx.lineTo(s.trail[i].x, s.trail[i].y);
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4 * t;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    let x: number;
    let y: number;
    let ang: number;
    let len = 34;
    if (s.state === 'held') {
      if (game.state === 'over') return;
      const hand = game.facing + 0.55;
      x = game.px + Math.cos(hand) * game.pr * 0.9;
      y = game.py + Math.sin(hand) * game.pr * 0.9;
      ang = game.facing - (game.slashT > 0 ? 0 : 0.35);
      if (game.slashT > 0) {
        const k = 1 - game.slashT / 0.24;
        ang = lerp(game.slashDir - 1.25, game.slashDir + 1.25, clamp(k * 1.25, 0, 1));
        x = game.px + Math.cos(ang) * (game.pr + 26);
        y = game.py + Math.sin(ang) * (game.pr + 26);
      }
    } else {
      x = s.x;
      y = s.y;
      ang = s.state === 'stuck' ? Math.atan2(s.vy, s.vx) : Math.atan2(s.vy, s.vx) + s.spin;
      if (s.state === 'returning') ang = Math.atan2(game.py - s.y, game.px - s.x) + s.spin;
      len = 38;
    }

    ctx.globalCompositeOperation = 'lighter';
    this.blob(x, y, s.state === 'held' ? 12 : 18, main, s.state === 'held' ? 0.18 : 0.32);
    ctx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    if (s.state === 'stuck') {
      const bob = Math.sin(game.time * 8) * 0.06;
      ctx.rotate(bob);
    }
    // blade — shape depends on the equipped skin
    ctx.fillStyle = sk.blade;
    ctx.strokeStyle = main;
    ctx.lineWidth = 2;
    if (sk.type === 'katana') {
      const L = len * 1.18;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(L, 0);
      ctx.quadraticCurveTo(L * 0.5, -4.6, -len * 0.3, -2.4);
      ctx.lineTo(-len * 0.3, 2);
      ctx.quadraticCurveTo(L * 0.5, 3.2, L, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.coreZig(len, L * 0.86, core, game.time, 1.4);
      // round tsuba + wrapped grip
      ctx.fillStyle = guard;
      ctx.beginPath();
      ctx.arc(-len * 0.3, 0, 6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = grip;
      ctx.fillRect(-len * 0.74, -2.6, len * 0.42, 5.2);
      ctx.strokeStyle = this.fade(main, 0.5);
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const gx = -len * 0.7 + i * len * 0.12;
        ctx.beginPath();
        ctx.moveTo(gx, -2.6);
        ctx.lineTo(gx + len * 0.06, 2.6);
        ctx.stroke();
      }
    } else if (sk.type === 'great') {
      const L = len * 0.98;
      ctx.beginPath();
      ctx.moveTo(L, -6.2);
      ctx.lineTo(L * 0.9, 0);
      ctx.lineTo(L, 6.2);
      ctx.lineTo(-len * 0.28, 8);
      ctx.lineTo(-len * 0.28, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.coreZig(len, L * 0.8, core, game.time, 2);
      // wide crossguard + square pommel
      ctx.fillStyle = guard;
      ctx.fillRect(-len * 0.34, -12, 6, 24);
      ctx.fillStyle = grip;
      ctx.fillRect(-len * 0.64, -3.4, len * 0.28, 6.8);
      ctx.fillStyle = guard;
      ctx.fillRect(-len * 0.72, -4.6, 6, 9.2);
    } else if (sk.type === 'saber') {
      const L = len * 1.08;
      ctx.beginPath();
      ctx.moveTo(L, -0.5);
      ctx.quadraticCurveTo(L * 0.45, -7.6, -len * 0.3, -3.2);
      ctx.lineTo(-len * 0.3, 2.4);
      ctx.quadraticCurveTo(L * 0.5, 3.4, L, -0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.coreZig(len, L * 0.82, core, game.time, 1.5);
      // knuckle bow + grip
      ctx.strokeStyle = guard;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(-len * 0.34, 0, 7, -1.4, 1.4);
      ctx.stroke();
      ctx.fillStyle = grip;
      ctx.fillRect(-len * 0.7, -2.8, len * 0.38, 5.6);
      ctx.fillStyle = main;
      ctx.beginPath();
      ctx.arc(-len * 0.7, 0, 3, 0, TAU);
      ctx.fill();
    } else if (sk.type === 'dagger') {
      const L = len * 0.85;
      ctx.beginPath();
      ctx.moveTo(L, 0);
      ctx.lineTo(L * 0.4, -4);
      ctx.lineTo(-len * 0.25, -3);
      ctx.lineTo(-len * 0.25, 3);
      ctx.lineTo(L * 0.4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.coreZig(len * 0.8, L * 0.75, core, game.time, 1.3);
      ctx.fillStyle = guard;
      ctx.fillRect(-len * 0.3, -7, 4, 14);
      ctx.fillStyle = grip;
      ctx.fillRect(-len * 0.58, -2.4, len * 0.28, 4.8);
      ctx.fillStyle = main;
      ctx.beginPath();
      ctx.arc(-len * 0.62, 0, 2.8, 0, TAU);
      ctx.fill();
    } else if (sk.type === 'axe') {
      // SHURIKEN — uses drawShuriken() from axe-path.ts.
      // Same vertices as the Armory SVG (SHURIKEN_PATH).
      const s = len / 32;
      // the star
      drawShuriken(ctx, s);
      ctx.lineJoin = 'miter';
      ctx.fill();
      ctx.stroke();
      // centre disc
      ctx.fillStyle = guard;
      ctx.strokeStyle = main;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 4 * s, 0, TAU);
      ctx.fill();
      ctx.stroke();
      // rounded pommel
      ctx.fillStyle = guard;
      ctx.beginPath();
      ctx.arc(-len * 0.7, 0, 3.2, 0, TAU);
      ctx.fill();
    } else if (sk.type === 'spear') {
      const L = len * 1.25;
      ctx.beginPath();
      ctx.moveTo(L, 0);
      ctx.lineTo(L * 0.75, -4.8);
      ctx.lineTo(len * 0.2, -3.2);
      ctx.lineTo(len * 0.2, 3.2);
      ctx.lineTo(L * 0.75, 4.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.coreZig(len, L * 0.85, core, game.time, 1.3);
      ctx.fillStyle = grip;
      ctx.fillRect(-len * 0.8, -2.5, len * 1.0, 5);
      ctx.fillStyle = guard;
      ctx.beginPath();
      ctx.arc(len * 0.2, 0, 5, 0, TAU);
      ctx.fill();
    } else {
      // longsword
      ctx.beginPath();
      ctx.moveTo(len, 0);
      ctx.lineTo(len * 0.55, -5.5);
      ctx.lineTo(-len * 0.34, -4);
      ctx.lineTo(-len * 0.34, 4);
      ctx.lineTo(len * 0.55, 5.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      this.coreZig(len, len * 0.9, core, game.time, 1.6);
      ctx.fillStyle = guard;
      ctx.fillRect(-len * 0.38, -9, 5, 18);
      ctx.fillStyle = grip;
      ctx.fillRect(-len * 0.62, -3, len * 0.26, 6);
      ctx.fillStyle = main;
      ctx.beginPath();
      ctx.arc(-len * 0.66, 0, 3.4, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawSideSwords(game: Game) {
    const ctx = this.ctx;
    const oc = game.overcharge > 0;
    const sk = this.swordSkin;
    const main = oc ? '#ffd166' : sk.glow;
    for (const s of game.sideSwords) {
      if (s.trail.length > 1) {
        ctx.globalCompositeOperation = 'lighter';
        for (let i = 1; i < s.trail.length; i++) {
          const t = i / s.trail.length;
          ctx.globalAlpha = t * 0.45;
          ctx.strokeStyle = main;
          ctx.lineWidth = 11 * t;
          ctx.beginPath();
          ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y);
          ctx.lineTo(s.trail[i].x, s.trail[i].y);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3 * t;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalCompositeOperation = 'lighter';
      this.blob(s.x, s.y, 32, main, 0.6);
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.fillStyle = sk.blade;
      ctx.strokeStyle = main;
      ctx.lineWidth = 1.8;
      if (sk.type === 'axe') {
        // shuriken — spinning star for tri-blade
        drawShuriken(ctx, 0.5);
        ctx.lineJoin = 'miter';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = sk.guard;
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, TAU);
        ctx.fill();
      } else {
        // default sword shape for other types
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(15, -4.5);
        ctx.lineTo(-8, -3);
        ctx.lineTo(-8, 3);
        ctx.lineTo(15, 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  /** Electric zigzag running down the blade. */
  private coreZig(len: number, endX: number, color: string, time: number, width: number) {
    const ctx = this.ctx;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(-len * 0.26, 0);
    for (let i = 1; i <= 5; i++) {
      const t = i / 5;
      ctx.lineTo(lerp(-len * 0.26, endX, t), Math.sin(time * 30 + i * 2) * 2 * (1 - t));
    }
    ctx.stroke();
  }

  private drawBossBar(game: Game) {
    const boss = game.enemies.find((e) => isBoss(e.kind));
    if (!boss || game.state !== 'playing') return;
    const ctx = this.ctx;
    const W = game.W;
    const barW = Math.min(520, W * 0.65);
    const barH = 14;
    const x = (W - barW) / 2;
    const y = 32;

    ctx.save();
    const t = this.t();
    const name =
      boss.kind === 'boss_warden'
        ? t.boss_warden
        : boss.kind === 'boss_gargoyle'
          ? t.boss_gargoyle
          : boss.kind === 'boss_serpent'
            ? t.boss_serpent
            : boss.kind === 'boss_colossus'
              ? t.boss_colossus
              : t.boss_sovereign;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `800 15px ${CANVAS_FONT}`;
    ctx.strokeStyle = 'rgba(4,6,18,0.95)';
    ctx.lineWidth = 5;
    ctx.strokeText(name, W / 2, y - 4);
    ctx.fillStyle = '#ff4d6d';
    ctx.fillText(name, W / 2, y - 4);

    // bar background
    ctx.fillStyle = 'rgba(10,4,14,0.85)';
    ctx.fillRect(x - 2, y - 2, barW + 4, barH + 4);
    ctx.strokeStyle = '#ff4d6d';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 2, y - 2, barW + 4, barH + 4);

    // bar fill
    const k = clamp(boss.hp / boss.maxHp, 0, 1);
    const grad = ctx.createLinearGradient(x, y, x + barW * k, y);
    grad.addColorStop(0, '#ff2e55');
    grad.addColorStop(1, '#ff8a3d');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW * k, barH);

    // highlight line
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(x, y + 2, barW * k, 2);

    ctx.restore();
  }

  private drawHints(game: Game, input: Input) {
    if (game.state !== 'playing' || game.hintStage > 2 || game.time > 26) return;
    const ctx = this.ctx;
    const t = this.t();
    let msg = '';
    if (game.hintStage === 0) msg = input.isTouch ? t.h1t : t.h1k;
    else if (game.hintStage === 1) msg = input.isTouch ? t.h2t : t.h2k;
    else msg = input.isTouch ? t.h3t : t.h3k;
    const life = game.hintStage === 2 ? clamp(4 - game.hintT, 0, 1) : 1;
    if (life <= 0) return;
    ctx.globalAlpha = 0.55 + Math.sin(game.time * 4) * 0.15;
    ctx.font = `700 15px ${CANVAS_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9fd8ff';
    ctx.strokeStyle = 'rgba(4,6,18,0.8)';
    ctx.lineWidth = 5;
    const y = clamp(game.py - 62, 30, game.H - 30);
    ctx.strokeText(msg, clamp(game.px, 130, game.W - 130), y);
    ctx.fillText(msg, clamp(game.px, 130, game.W - 130), y);
    ctx.globalAlpha = 1;
  }

  private drawTouchUI(game: Game, input: Input, alpha: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const stick of [input.move, input.aim]) {
      if (!stick.active) continue;
      const isMove = stick === input.move;
      const col = isMove ? '#79f2ff' : '#a97bff';
      ctx.strokeStyle = this.fade(col, 0.35);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(stick.ox, stick.oy, 58, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = this.fade(col, 0.12);
      ctx.fill();
      const kx = stick.ox + stick.dx * stick.mag * 46;
      const ky = stick.oy + stick.dy * stick.mag * 46;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(kx, ky, 34, col, 0.5);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = this.fade(col, 0.85);
      ctx.beginPath();
      ctx.arc(kx, ky, 21, 0, TAU);
      ctx.fill();
    }

    const swordOut = game.sw.state !== 'held';
    for (const b of input.buttons) {
      const isBlink = b.id === 'blink';
      const col = isBlink ? (swordOut ? '#ffd166' : '#79f2ff') : '#a97bff';
      const press = b.pressed ? 1 : 0;
      ctx.globalCompositeOperation = 'lighter';
      this.blob(b.x, b.y, b.r * (1.6 + press * 0.4), col, 0.22 + press * 0.28);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = this.fade(col, 0.16 + press * 0.2);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = this.fade(col, 0.85);
      ctx.lineWidth = 2.5;
      ctx.stroke();
      if (isBlink && game.blinkCd > 0) {
        const bk = clamp(1 - game.blinkCd / game.blinkCdMax, 0, 1);
        ctx.globalAlpha = alpha * 0.55;
        ctx.strokeStyle = '#a97bff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 0.72, -Math.PI / 2, -Math.PI / 2 + TAU * bk);
        ctx.stroke();
        ctx.globalAlpha = alpha;
      }
      ctx.fillStyle = this.fade(col, 1);
      const t = this.t();
      ctx.font = `800 ${isBlink ? 13 : 11}px ${CANVAS_FONT}`;
      ctx.fillText(
        isBlink ? (swordOut ? t.btnBlink : t.btnThrow) : swordOut ? t.btnRecall : t.btnSlash,
        b.x,
        b.y + b.r * 0.02,
      );
    }
    ctx.restore();
  }
}
