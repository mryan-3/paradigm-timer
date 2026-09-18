import { rng } from "./canvas-math";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type BoundingBox = [number, number, number, number] | Box;

export interface HatchOptions {
  angle?: number;
  gap?: number;
  len?: number;
  jitter?: number;
  color?: string;
  alpha?: number;
  width?: number;
  seed?: number;
}

export interface CrossHatchOptions extends HatchOptions {
  crossAngleOffset?: number;
  crossGapRatio?: number;
  crossAlphaRatio?: number;
}

export interface CurvedHatchOptions extends HatchOptions {
  curvature?: number; // Curvature amount (-1 to 1)
  curveCenter?: { x: number; y: number };
}

export interface GrainOptions {
  color?: string;
  alpha?: number;
  size?: number;
  seed?: number;
}

type ClipTarget = Path2D | ((ctx: CanvasRenderingContext2D) => void);

function applyClip(ctx: CanvasRenderingContext2D, clip: ClipTarget): void {
  if (clip instanceof Path2D) {
    ctx.clip(clip);
  } else {
    ctx.beginPath();
    clip(ctx);
    ctx.clip();
  }
}

function normalizeBox(box: BoundingBox): [number, number, number, number] {
  if (Array.isArray(box)) return box;
  return [box.x, box.y, box.w, box.h];
}

/**
 * Standard printmaker straight hatching with organic seeded wobble.
 */
export function hatch(
  ctx: CanvasRenderingContext2D,
  clip: ClipTarget,
  box: BoundingBox,
  opts: HatchOptions = {}
): void {
  const [bx, by, bw, bh] = normalizeBox(box);
  const {
    angle = 1.1,
    gap = 7,
    len = 16,
    jitter = 4,
    color = "#1c1917",
    alpha = 0.35,
    width = 1.1,
    seed = 42,
  } = opts;

  const r = rng(seed);
  const cx = bx + bw * 0.5;
  const cy = by + bh * 0.5;
  const diag = Math.hypot(bw, bh) * 0.5;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);

  ctx.save();
  applyClip(ctx, clip);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  for (let v = -diag; v <= diag; v += gap) {
    for (let u = -diag; u <= diag; u += len * 1.6) {
      const uu = u + (r() - 0.5) * jitter * 2;
      const strokeLen = len * (0.65 + r() * 0.7);
      const x0 = cx + ca * uu - sa * v + (r() - 0.5) * jitter * 0.6;
      const y0 = cy + sa * uu + ca * v + (r() - 0.5) * jitter * 0.6;
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0 + ca * strokeLen, y0 + sa * strokeLen);
    }
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Two-pass cross-hatching for deep printmaker shadow and sediment textures.
 */
export function crossHatch(
  ctx: CanvasRenderingContext2D,
  clip: ClipTarget,
  box: BoundingBox,
  opts: CrossHatchOptions = {}
): void {
  const {
    angle = 0.85,
    crossAngleOffset = Math.PI * 0.45,
    crossGapRatio = 1.1,
    crossAlphaRatio = 0.85,
    seed = 88,
    ...rest
  } = opts;

  // First pass
  hatch(ctx, clip, box, {
    ...rest,
    angle,
    seed,
  });

  // Second pass with offset angle and variation
  hatch(ctx, clip, box, {
    ...rest,
    angle: angle + crossAngleOffset,
    gap: (rest.gap || 7) * crossGapRatio,
    alpha: (rest.alpha || 0.35) * crossAlphaRatio,
    seed: seed + 31337,
  });
}

/**
 * Curved contour hatching that flows along spherical or cylindrical forms
 * (e.g. glass domes, hills, logs, fruit, tree trunks).
 */
export function contourHatch(
  ctx: CanvasRenderingContext2D,
  clip: ClipTarget,
  box: BoundingBox,
  opts: CurvedHatchOptions = {}
): void {
  const [bx, by, bw, bh] = normalizeBox(box);
  const {
    gap = 8,
    curvature = 0.25,
    color = "#1c1917",
    alpha = 0.35,
    width = 1.1,
    seed = 101,
  } = opts;

  const r = rng(seed);
  ctx.save();
  applyClip(ctx, clip);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "round";

  ctx.beginPath();
  const steps = Math.ceil(bh / gap);
  for (let i = 0; i <= steps; i++) {
    const y = by + i * gap;
    const curveLift = curvature * bw * 0.35;
    const x0 = bx - 10;
    const xEnd = bx + bw + 10;
    const midX = bx + bw * 0.5 + (r() - 0.5) * 6;
    const midY = y - curveLift + (r() - 0.5) * 4;

    ctx.moveTo(x0, y);
    ctx.quadraticCurveTo(midX, midY, xEnd, y);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Seeded grain stippling for paper tooth, weathered wood, and soil porosity.
 */
export function stippleGrain(
  ctx: CanvasRenderingContext2D,
  clip: ClipTarget,
  box: BoundingBox,
  count: number,
  opts: GrainOptions = {}
): void {
  const [bx, by, bw, bh] = normalizeBox(box);
  const { color = "#1c1917", alpha = 0.28, size = 1.6, seed = 505 } = opts;
  const r = rng(seed);

  ctx.save();
  applyClip(ctx, clip);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;

  for (let i = 0; i < count; i++) {
    const px = bx + r() * bw;
    const py = by + r() * bh;
    const dotSize = size * (0.45 + r() * 0.85);
    ctx.fillRect(px, py, dotSize, dotSize);
  }
  ctx.restore();
}
