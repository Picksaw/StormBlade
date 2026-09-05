/**
 * SHURIKEN shape — replaces the battle axe type.
 * ONE definition used by Armory SVG AND in-game canvas.
 *
 * A 4-pointed throwing star centred on (32,32) in a 64×64 viewbox.
 * Each point is a sharp triangle; the centre has a small hole.
 */

// ── SVG (BladePreview + BladeBadge) ─────────────────────────────────

export const SHURIKEN_PATH =
  'M32 12 L36 28 L52 32 L36 36 L32 52 L28 36 L12 32 L28 28 Z';

export const SHURIKEN_CENTRE = { cx: 32, cy: 32, r: 4 };

// ── Canvas (in-game) ────────────────────────────────────────────────

/**
 * Draw the shuriken on a Canvas2D at the origin, scaled by `s`.
 * SVG (32,32) → canvas (0,0).
 */
export function drawShuriken(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, -20 * s);   // top point
  ctx.lineTo(4 * s, -4 * s);
  ctx.lineTo(20 * s, 0);    // right point
  ctx.lineTo(4 * s, 4 * s);
  ctx.lineTo(0, 20 * s);    // bottom point
  ctx.lineTo(-4 * s, 4 * s);
  ctx.lineTo(-20 * s, 0);   // left point
  ctx.lineTo(-4 * s, -4 * s);
  ctx.closePath();
}
