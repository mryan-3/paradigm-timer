import { rng } from "./canvas-math";

export function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  seed = 42
): void {
  // Base warm paper wash
  ctx.fillStyle = "#faf6ef";
  ctx.fillRect(0, 0, width, height);

  // Faint paper grain stipples (subtle and stable)
  const r = rng(seed);
  ctx.fillStyle = "rgba(26, 24, 22, 0.025)";
  const grainCount = Math.floor((width * height) / 380);

  for (let i = 0; i < grainCount; i++) {
    const gx = r() * width;
    const gy = r() * height;
    const size = 0.6 + r() * 0.9;
    ctx.fillRect(gx, gy, size, size);
  }

  // Soft atmospheric paper bands
  const grad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    Math.min(width, height) * 0.1,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.75
  );
  grad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
  grad.addColorStop(1, "rgba(240, 230, 214, 0.28)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}
