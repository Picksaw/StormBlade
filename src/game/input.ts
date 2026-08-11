import { clamp } from './core';

export type Stick = { active: boolean; id: number; ox: number; oy: number; x: number; y: number; dx: number; dy: number; mag: number };

const newStick = (): Stick => ({ active: false, id: -1, ox: 0, oy: 0, x: 0, y: 0, dx: 0, dy: 0, mag: 0 });

export type TouchButton = { id: string; x: number; y: number; r: number; pressed: boolean; pid: number };

export class Input {
  keys = new Set<string>();
  moveX = 0;
  moveY = 0;
  aimX = 1;
  aimY = 0;
  hasAim = false; // true when the player is actively aiming (mouse or right stick)
  mouseX = 0;
  mouseY = 0;
  usingMouse = false;
  isTouch = false;

  // edge-triggered actions
  primaryQueued = false;
  secondaryQueued = false;
  primaryHeld = false;
  secondaryHeld = false;

  move = newStick();
  aim = newStick();
  buttons: TouchButton[] = [
    { id: 'blink', x: 0, y: 0, r: 46, pressed: false, pid: -1 },
    { id: 'slash', x: 0, y: 0, r: 38, pressed: false, pid: -1 },
  ];

  onPause?: () => void;
  onAnyInput?: () => void;

  private el: HTMLElement | null = null;
  private w = 0;
  scale = 1;

  attach(el: HTMLElement) {
    this.el = el;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    el.addEventListener('contextmenu', this.onContext);
  }

  detach() {
    const el = this.el;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    if (el) {
      el.removeEventListener('pointerdown', this.onPointerDown);
      el.removeEventListener('contextmenu', this.onContext);
    }
  }

  resize(w: number, h: number, scale = 1) {
    this.w = w;
    this.scale = scale;
    const pad = Math.min(96, w * 0.16);
    const b0 = this.buttons[0];
    const b1 = this.buttons[1];
    b0.r = clamp(w * 0.085, 40, 58);
    b1.r = clamp(w * 0.07, 32, 48);
    b0.x = w - pad * 0.85;
    b0.y = h - pad * 0.95;
    b1.x = w - pad * 0.85 - b0.r * 1.55;
    b1.y = h - pad * 0.95 - b0.r * 1.35;
  }

  private onContext = (e: Event) => e.preventDefault();

  private onKeyDown = (e: KeyboardEvent) => {
    const tgt = e.target as HTMLElement | null;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA')) return;
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    if (this.keys.has(k)) return;
    this.keys.add(k);
    this.onAnyInput?.();
    if (k === 'k') {
      this.primaryQueued = true;
      this.primaryHeld = true;
    }
    if (k === 'j' || k === 'shift' || k === 'f') {
      this.secondaryQueued = true;
      this.secondaryHeld = true;
    }
    if (k === 'escape' || k === 'p') this.onPause?.();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    this.keys.delete(k);
    if (k === 'k') this.primaryHeld = false;
    if (k === 'j' || k === 'shift' || k === 'f') this.secondaryHeld = false;
  };

  private local(e: PointerEvent) {
    const r = this.el!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.el) return;
    const tgt = e.target as HTMLElement | null;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA')) return;
    // UI overlays (menu, armory, guide, daily, auth) handle their own presses.
    // Anything inside one must never reach the game.
    if (tgt && tgt.closest('[data-uiblock]')) return;
    const p = this.local(e);
    this.onAnyInput?.();
    if (e.pointerType === 'mouse') {
      this.usingMouse = true;
      this.isTouch = false;
      this.mouseX = p.x / this.scale;
      this.mouseY = p.y / this.scale;
      this.hasAim = true;
      if (e.button === 0) {
        this.primaryQueued = true;
        this.primaryHeld = true;
      } else if (e.button === 2) {
        this.secondaryQueued = true;
        this.secondaryHeld = true;
      }
      e.preventDefault();
      return;
    }

    this.isTouch = true;
    // touch buttons first
    for (const b of this.buttons) {
      if (b.pid === -1 && Math.hypot(p.x - b.x, p.y - b.y) < b.r * 1.35) {
        b.pid = e.pointerId;
        b.pressed = true;
        if (b.id === 'blink') {
          this.primaryQueued = true;
          this.primaryHeld = true;
        } else {
          this.secondaryQueued = true;
          this.secondaryHeld = true;
        }
        return;
      }
    }
    const leftSide = p.x < this.w * 0.46;
    const stick = leftSide ? this.move : this.aim;
    if (stick.active) return;
    stick.active = true;
    stick.id = e.pointerId;
    stick.ox = p.x;
    stick.oy = p.y;
    stick.x = p.x;
    stick.y = p.y;
    stick.dx = 0;
    stick.dy = 0;
    stick.mag = 0;
    if (!leftSide) {
      // tapping the right side also fires primary on release; mark start time
      (stick as Stick & { t0?: number; moved?: boolean }).t0 = performance.now();
      (stick as Stick & { t0?: number; moved?: boolean }).moved = false;
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.el) return;
    const p = this.local(e);
    if (e.pointerType === 'mouse') {
      this.usingMouse = true;
      this.mouseX = p.x / this.scale;
      this.mouseY = p.y / this.scale;
      this.hasAim = true;
      return;
    }
    for (const stick of [this.move, this.aim]) {
      if (stick.active && stick.id === e.pointerId) {
        stick.x = p.x;
        stick.y = p.y;
        let dx = stick.x - stick.ox;
        let dy = stick.y - stick.oy;
        const max = 62;
        const m = Math.hypot(dx, dy);
        if (m > max) {
          // drag the origin along for a floating stick feel
          stick.ox += (dx / m) * (m - max);
          stick.oy += (dy / m) * (m - max);
          dx = stick.x - stick.ox;
          dy = stick.y - stick.oy;
        }
        const mag = Math.min(1, Math.hypot(dx, dy) / max);
        stick.dx = m > 0.001 ? dx / (Math.hypot(dx, dy) || 1) : 0;
        stick.dy = m > 0.001 ? dy / (Math.hypot(dx, dy) || 1) : 0;
        stick.mag = mag;
        const s = stick as Stick & { moved?: boolean };
        if (mag > 0.22) s.moved = true;
      }
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') {
      if (e.button === 0) this.primaryHeld = false;
      if (e.button === 2) this.secondaryHeld = false;
      return;
    }
    for (const b of this.buttons) {
      if (b.pid === e.pointerId) {
        b.pid = -1;
        b.pressed = false;
        if (b.id === 'blink') this.primaryHeld = false;
        else this.secondaryHeld = false;
      }
    }
    for (const stick of [this.move, this.aim]) {
      if (stick.active && stick.id === e.pointerId) {
        if (stick === this.aim) {
          // aim-and-release: lifting the aim thumb always fires the primary action
          const s = stick as Stick & { t0?: number };
          if (performance.now() - (s.t0 ?? 0) < 3000) this.primaryQueued = true;
          this.primaryHeld = false;
        }
        stick.active = false;
        stick.id = -1;
        stick.mag = 0;
        stick.dx = 0;
        stick.dy = 0;
      }
    }
  };

  /** Called each frame before the update. */
  sample() {
    let mx = 0;
    let my = 0;
    const k = this.keys;
    if (k.has('a') || k.has('arrowleft') || k.has('q')) mx -= 1;
    if (k.has('d') || k.has('arrowright')) mx += 1;
    if (k.has('w') || k.has('arrowup') || k.has('z')) my -= 1;
    if (k.has('s') || k.has('arrowdown')) my += 1;
    const m = Math.hypot(mx, my);
    if (m > 0) {
      mx /= m;
      my /= m;
    }
    if (this.move.active && this.move.mag > 0.08) {
      mx = this.move.dx * this.move.mag;
      my = this.move.dy * this.move.mag;
    }
    this.moveX = mx;
    this.moveY = my;

    if (this.aim.active && this.aim.mag > 0.25) {
      this.aimX = this.aim.dx;
      this.aimY = this.aim.dy;
      this.hasAim = true;
      this.usingMouse = false;
    }
  }

  consumePrimary() {
    const v = this.primaryQueued;
    this.primaryQueued = false;
    return v;
  }

  consumeSecondary() {
    const v = this.secondaryQueued;
    this.secondaryQueued = false;
    return v;
  }

  clear() {
    this.keys.clear();
    this.primaryQueued = this.secondaryQueued = false;
    this.primaryHeld = this.secondaryHeld = false;
    this.move.active = false;
    this.aim.active = false;
    this.move.mag = this.aim.mag = 0;
    for (const b of this.buttons) {
      b.pressed = false;
      b.pid = -1;
    }
  }
}
