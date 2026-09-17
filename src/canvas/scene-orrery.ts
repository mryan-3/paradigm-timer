import type { Palette } from "./palettes";
import { circlePoints, drawWobblyPath } from "./canvas-math";

export function drawOrreryScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tau: number,
  progress: number,
  palette: Palette,
  frameSeed: number
): void {
  ctx.save();
  const cx = w * 0.5;
  const cy = h * 0.58;
  const r = Math.min(w, h) * 0.26;

  // Outer astronomical ring
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.4;
  drawWobblyPath(ctx, circlePoints(cx, cy, r, 40), 1.2, frameSeed, true);

  // Rotating inner gear ring
  const teeth = 18;
  const gearR = r * 0.68;
  ctx.strokeStyle = palette.secondary;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2 + tau * 0.4;
    const tr = i % 2 === 0 ? gearR + 6 : gearR - 4;
    const gx = cx + Math.cos(a) * tr;
    const gy = cy + Math.sin(a) * tr;
    if (i === 0) ctx.moveTo(gx, gy);
    else ctx.lineTo(gx, gy);
  }
  ctx.closePath();
  ctx.stroke();

  // Progress orbital planet
  const planetAngle = -Math.PI * 0.5 + progress * Math.PI * 2;
  const px = cx + Math.cos(planetAngle) * r;
  const py = cy + Math.sin(planetAngle) * r;

  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.fill();

  // Constellation stars
  ctx.fillStyle = palette.ink;
  const starCount = 8;
  for (let s = 0; s < starCount; s++) {
    const sa = (s / starCount) * Math.PI * 2 + s * 0.5;
    const sr = r * (0.88 + Math.sin(s + tau * 0.2) * 0.1);
    const sx = cx + Math.cos(sa) * sr;
    const sy = cy + Math.sin(sa) * sr;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
