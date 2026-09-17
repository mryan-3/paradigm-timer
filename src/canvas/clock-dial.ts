import type { Palette } from "./palettes";
import { rng, circlePoints, drawWobblyPath } from "./canvas-math";

export function renderClockDial(
  canvas: HTMLCanvasElement,
  progress: number,
  totalMinutes: number,
  palette: Palette
): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = 140; // Increased size
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = size * 0.5;
  const cy = size * 0.5;
  const radius = size * 0.44;

  ctx.clearRect(0, 0, size, size);

  // Dial face (artsy, wobbly)
  const circlePts = circlePoints(cx, cy, radius, 48);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.5;
  drawWobblyPath(ctx, circlePts, 2.5, 42, true);

  // Inner subtle fill
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fill();

  // Progress wedge (artsy scribbles or rough path)
  if (progress > 0.005) {
    ctx.fillStyle = palette.wash;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    const progressAngle = -Math.PI * 0.5 + progress * Math.PI * 2;
    ctx.arc(cx, cy, radius - 2, -Math.PI * 0.5, progressAngle);
    ctx.closePath();
    ctx.fill();
    
    // Messy boundary line for progress
    const edgePts = circlePoints(cx, cy, radius - 2, 24).filter((_, i) => {
        const a = (i / 24) * Math.PI * 2 - Math.PI * 0.5;
        return a <= progressAngle && a >= -Math.PI * 0.5;
    });
    if (edgePts.length > 1) {
       ctx.strokeStyle = palette.ink;
       ctx.lineWidth = 0.8;
       drawWobblyPath(ctx, edgePts, 1.5, 84, false);
    }
  }

  // Ticks and numbers
  const steps = 5;
  ctx.font = "500 10px 'Plus Jakarta Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.ink;

  const r = rng(123);

  for (let i = 0; i < steps; i++) {
    const fraction = i / steps;
    const angle = -Math.PI * 0.5 + fraction * Math.PI * 2;
    const num = Math.round(fraction * totalMinutes);
    const nx = cx + Math.cos(angle) * (radius - 16);
    const ny = cy + Math.sin(angle) * (radius - 16);
    
    // Only draw number if not overlapping with the hand's current position too much
    ctx.fillText(String(num), nx, ny + (r() - 0.5) * 2);

    const tx = cx + Math.cos(angle) * (radius - 2);
    const ty = cy + Math.sin(angle) * (radius - 2);
    const lx = cx + Math.cos(angle) * (radius - 8);
    const ly = cy + Math.sin(angle) * (radius - 8);
    
    ctx.beginPath();
    ctx.moveTo(tx + (r()-0.5)*1, ty + (r()-0.5)*1);
    ctx.lineTo(lx + (r()-0.5)*2, ly + (r()-0.5)*2);
    ctx.stroke();
  }

  // Hand (wobbly line)
  const handAngle = -Math.PI * 0.5 + progress * Math.PI * 2;
  const hx = cx + Math.cos(handAngle) * (radius * 0.8);
  const hy = cy + Math.sin(handAngle) * (radius * 0.8);

  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2.0;
  ctx.lineCap = "round";
  
  // Wobbly hand
  drawWobblyPath(ctx, [{x: cx, y: cy}, {x: cx + (hx-cx)*0.5, y: cy + (hy-cy)*0.5}, {x: hx, y: hy}], 1.5, 55, false);

  // Center pin
  ctx.fillStyle = palette.ink;
  ctx.beginPath();
  ctx.arc(cx + (r()-0.5)*1, cy + (r()-0.5)*1, 3.5, 0, Math.PI * 2);
  ctx.fill();
}
