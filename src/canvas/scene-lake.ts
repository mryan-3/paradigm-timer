import type { Palette } from "./palettes";
import { drawWobblyPath, type Point } from "./canvas-math";

const HULL: Point[] = [{ x: -38, y: 0 }, { x: 38, y: 0 }, { x: 26, y: 22 }, { x: -26, y: 22 }];
const SAIL: Point[] = [{ x: 0, y: -42 }, { x: -22, y: 0 }, { x: 22, y: 0 }];

export function drawLakeScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tau: number,
  progress: number,
  palette: Palette,
  frameSeed: number
): void {
  const lakeY = h * 0.62;
  const sunY = h * 0.38 + progress * (h * 0.16);

  // Warm glowing sun
  ctx.save();
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(w * 0.5, sunY, Math.min(w, h) * 0.09, 0, Math.PI * 2);
  ctx.fill();

  // Distant rolling hills
  ctx.fillStyle = palette.wash;
  ctx.beginPath();
  ctx.moveTo(0, lakeY);
  ctx.bezierCurveTo(w * 0.25, lakeY - 60, w * 0.45, lakeY - 20, w * 0.7, lakeY - 70);
  ctx.bezierCurveTo(w * 0.85, lakeY - 40, w * 0.95, lakeY - 50, w, lakeY);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();

  // Lake water line & ripples
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, lakeY);
  ctx.lineTo(w, lakeY);
  ctx.stroke();

  for (let i = 0; i < 3; i++) {
    const rProgress = ((tau * 0.2 + i * 0.33) % 1);
    const ry = lakeY + 20 + i * 32;
    ctx.strokeStyle = `rgba(28, 25, 23, ${0.28 * (1 - rProgress)})`;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, ry, 60 + rProgress * 80, 5 + rProgress * 6, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Paper Boat bobbing
  const boatX = w * 0.5 + Math.sin(tau * 0.5) * 18;
  const boatY = lakeY + Math.sin(tau * 2) * 5;
  const tilt = Math.cos(tau * 2) * 0.06;

  ctx.translate(boatX, boatY);
  ctx.rotate(tilt);

  // Boat fill & wobbly ink outline
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  HULL.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.fill();
  ctx.beginPath();
  SAIL.forEach((p, idx) => (idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.fill();

  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.8;
  drawWobblyPath(ctx, HULL, 1.2, frameSeed + 1, true);
  drawWobblyPath(ctx, SAIL, 1.2, frameSeed + 2, true);

  ctx.restore();
}
