export function rng(seed: number): () => number {
  let a = (seed * 1000003) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Point {
  x: number;
  y: number;
}

export function circlePoints(cx: number, cy: number, r: number, count = 36): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const th = (i / count) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(th) * r, y: cy + Math.sin(th) * r });
  }
  return pts;
}

export function drawWobblyPath(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  amp: number,
  seed: number,
  close = false
): void {
  if (pts.length < 2) return;
  const r = rng(seed);
  ctx.beginPath();
  const startX = pts[0].x + (r() - 0.5) * amp;
  const startY = pts[0].y + (r() - 0.5) * amp;
  ctx.moveTo(startX, startY);

  for (let i = 1; i < pts.length; i++) {
    const nx = pts[i].x + (r() - 0.5) * amp;
    const ny = pts[i].y + (r() - 0.5) * amp;
    ctx.lineTo(nx, ny);
  }

  if (close) {
    ctx.closePath();
  }
  ctx.stroke();
}
