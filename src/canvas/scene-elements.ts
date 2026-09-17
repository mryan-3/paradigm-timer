import { circlePoints, drawWobblyPath } from "./canvas-math";

export function drawOrrery(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  progress: number,
  frameSeed: number
): void {
  ctx.save();
  ctx.strokeStyle = "rgba(87, 82, 77, 0.4)";
  ctx.lineWidth = 1.2;

  // Outer astronomical ring
  const outerPts = circlePoints(cx, cy, radius, 48);
  drawWobblyPath(ctx, outerPts, 1.2, frameSeed, true);

  // Compass tick marks
  const tickCount = 24;
  for (let i = 0; i < tickCount; i++) {
    const th = (i / tickCount) * Math.PI * 2 + angle * 0.2;
    const r1 = radius - (i % 6 === 0 ? 12 : 6);
    const r2 = radius + (i % 6 === 0 ? 8 : 4);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(th) * r1, cy + Math.sin(th) * r1);
    ctx.lineTo(cx + Math.cos(th) * r2, cy + Math.sin(th) * r2);
    ctx.stroke();
  }

  // Inner progress orbital arc
  if (progress > 0.01) {
    ctx.strokeStyle = "#c25736";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.85, -Math.PI * 0.5, -Math.PI * 0.5 + progress * Math.PI * 2);
    ctx.stroke();

    // Progress celestial marker
    const markerAngle = -Math.PI * 0.5 + progress * Math.PI * 2;
    const mx = cx + Math.cos(markerAngle) * (radius * 0.85);
    const my = cy + Math.sin(markerAngle) * (radius * 0.85);
    ctx.fillStyle = "#d9822b";
    ctx.beginPath();
    ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
