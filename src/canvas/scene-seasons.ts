import type { Palette } from "./palettes";
import { rng, drawWobblyPath, circlePoints } from "./canvas-math";
import { hatch, crossHatch, contourHatch, stippleGrain } from "./canvas-hatching";

export function drawSeasonsScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tau: number,
  progress: number,
  palette: Palette
): void {
  ctx.save();
  const cx = w * 0.5;
  const cy = h * 0.55;
  const baseScale = Math.min(w, h) * 0.002;
  const isFocused = typeof document !== "undefined" ? document.hasFocus() : true;

  // Weather phases
  const rainPhase = Math.max(0, Math.min(1, (0.35 - progress) / 0.35));
  const snowPhase =
    progress >= 0.35 && progress < 0.75
      ? Math.min(1, (progress - 0.35) / 0.4)
      : progress >= 0.75
      ? Math.max(0, 1 - (progress - 0.75) / 0.1)
      : 0;
  const sunPhase = Math.max(0, Math.min(1, (progress - 0.75) / 0.25));

  const windGust = isFocused ? 0 : 5 + Math.sin(tau * 3) * 5;

  // 0. Distant Mountain Ridges with Topographic Woodcut Hatching
  const mountainRng = rng(909);
  const mountainY = cy + 40 * baseScale;
  const mountainBox: [number, number, number, number] = [0, mountainY - 140 * baseScale, w, 160 * baseScale];

  // Mountain ridge silhouette
  const ridgePts: { x: number; y: number }[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const rx = (i / steps) * w;
    const peak = Math.sin((i / steps) * Math.PI * 2.5 + 0.4) * 60 * baseScale;
    const jitter = (mountainRng() - 0.5) * 20 * baseScale;
    ridgePts.push({ x: rx, y: mountainY - 40 * baseScale - peak + jitter });
  }

  // Draw mountain mass
  ctx.fillStyle = palette.wash;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, ridgePts[0].y);
  for (let i = 1; i < ridgePts.length; i++) {
    ctx.lineTo(ridgePts[i].x, ridgePts[i].y);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Directional topographic slope hatching on the mountains
  hatch(
    ctx,
    (c) => {
      c.moveTo(0, h);
      c.lineTo(0, ridgePts[0].y);
      for (let i = 1; i < ridgePts.length; i++) {
        c.lineTo(ridgePts[i].x, ridgePts[i].y);
      }
      c.lineTo(w, h);
      c.closePath();
    },
    mountainBox,
    {
      angle: 0.65,
      gap: 11,
      len: 24,
      color: palette.ink,
      alpha: 0.18,
      width: 1.0,
      seed: 910,
    }
  );

  // Mountain ridge wobbly line
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.4;
  drawWobblyPath(ctx, ridgePts, 2.0, 911, false);

  // 1. Radiant Solar Etching (Phase 3)
  if (sunPhase > 0) {
    ctx.save();
    const sunY = cy - 200 * baseScale + (1 - sunPhase) * 150 * baseScale;
    const sunR = 75 * baseScale;

    // Outer radiant rays
    const raysRng = rng(10101);
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2 + tau * 0.08;
      const rayLen =
        45 * baseScale +
        raysRng() * 90 * baseScale * sunPhase +
        Math.sin(tau * 2 + i) * 15 * baseScale;
      const rx = cx + Math.cos(angle) * (sunR + 8 * baseScale);
      const ry = sunY + Math.sin(angle) * (sunR + 8 * baseScale);
      const ex = cx + Math.cos(angle) * (sunR + rayLen);
      const ey = sunY + Math.sin(angle) * (sunR + rayLen);

      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Solar disk with concentric annular hatching
    const sunBox: [number, number, number, number] = [
      cx - sunR,
      sunY - sunR,
      sunR * 2,
      sunR * 2,
    ];
    ctx.fillStyle = palette.wash;
    ctx.beginPath();
    ctx.arc(cx, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // Fine radial stipple inside sun
    stippleGrain(
      ctx,
      (c) => {
        c.arc(cx, sunY, sunR, 0, Math.PI * 2);
      },
      sunBox,
      60,
      { color: palette.accent, alpha: 0.35, size: 1.6, seed: 10102 }
    );

    const sunPts = circlePoints(cx, sunY, sunR, 28);
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 2.2;
    drawWobblyPath(ctx, sunPts, 2.0, 10101, true);
    ctx.restore();
  }

  // 2. Pine Forest with Directional Needle Hatching
  const drawTree = (x: number, y: number, scale: number, seed: number) => {
    const trng = rng(seed);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Trunk
    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -100);
    ctx.stroke();

    // Pine branches
    ctx.fillStyle = palette.secondary || palette.ink;
    const branches = 11;
    for (let i = 0; i < branches; i++) {
      const by = -20 - (i / branches) * 80;
      const bw = 42 * (1 - i / branches) + trng() * 10;
      ctx.beginPath();
      ctx.moveTo(0, by - 15);
      ctx.lineTo(bw, by);
      ctx.lineTo(0, by + 10);
      ctx.lineTo(-bw, by);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Needle hatching on branch boughs
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      for (let n = -bw * 0.8; n <= bw * 0.8; n += 6) {
        ctx.moveTo(n, by);
        ctx.lineTo(n * 1.1, by + 5);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Snow on branches
      if (snowPhase > 0) {
        ctx.fillStyle = palette.wash;
        ctx.beginPath();
        ctx.moveTo(0, by - 15);
        ctx.lineTo(bw * 0.8, by - 2);
        ctx.lineTo(0, by + 5 * snowPhase);
        ctx.lineTo(-bw * 0.8, by - 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  const forestRng = rng(12345);
  for (let i = 0; i < 15; i++) {
    const tx = cx + (forestRng() - 0.5) * w * 0.85;
    const ty = cy + 80 * baseScale + forestRng() * 20 * baseScale;
    const tscale = (0.5 + forestRng() * 0.8) * baseScale;
    if (Math.abs(tx - cx) > 115 * baseScale) {
      drawTree(tx, ty, tscale, 12345 + i);
    }
  }

  // 3. The Ground & Snow Terracing
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 2;
  const groundPts: { x: number; y: number }[] = [];
  for (let x = -w * 0.1; x <= w * 1.1; x += 30) {
    groundPts.push({ x, y: cy + 80 * baseScale + Math.sin(x * 0.01) * 20 * baseScale });
  }
  drawWobblyPath(ctx, groundPts, 2.0, 999, false);

  // Ground contour hatching in depressions
  const groundBox: [number, number, number, number] = [0, cy + 70 * baseScale, w, h - (cy + 70 * baseScale)];
  hatch(
    ctx,
    (c) => {
      c.moveTo(0, h);
      c.lineTo(0, groundPts[0].y);
      for (const pt of groundPts) c.lineTo(pt.x, pt.y);
      c.lineTo(w, h);
      c.closePath();
    },
    groundBox,
    {
      angle: 0.25,
      gap: 12,
      len: 18,
      color: palette.ink,
      alpha: 0.15,
      width: 0.9,
      seed: 998,
    }
  );

  // Ground Snow Accumulation
  if (snowPhase > 0) {
    ctx.fillStyle = palette.wash;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (const pt of groundPts) {
      ctx.lineTo(pt.x, pt.y - snowPhase * 20 * baseScale);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  }

  // 4. The Hand-Crafted Log Cabin
  const cabW = 180 * baseScale;
  const cabH = 120 * baseScale;
  const cabX = cx - cabW / 2;
  const cabY = cy + 80 * baseScale - cabH;
  const cabBox: [number, number, number, number] = [cabX, cabY, cabW, cabH];

  ctx.save();
  // Cabin Body (Logs)
  ctx.fillStyle = palette.secondary || palette.ink;
  ctx.fillRect(cabX, cabY, cabW, cabH);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(cabX, cabY, cabW, cabH);

  // Horizontal wood grain log contour hatching
  contourHatch(
    ctx,
    (c) => {
      c.rect(cabX, cabY, cabW, cabH);
    },
    cabBox,
    {
      gap: 14 * baseScale,
      curvature: 0.04,
      color: palette.ink,
      alpha: 0.35,
      width: 1.1,
      seed: 404,
    }
  );

  // Stippled wood aging
  stippleGrain(
    ctx,
    (c) => {
      c.rect(cabX, cabY, cabW, cabH);
    },
    cabBox,
    50,
    { color: palette.ink, alpha: 0.25, size: 1.5, seed: 405 }
  );

  // Log separations
  const logCount = 8;
  for (let i = 1; i < logCount; i++) {
    const ly = cabY + (i / logCount) * cabH;
    ctx.beginPath();
    ctx.moveTo(cabX, ly);
    ctx.lineTo(cabX + cabW, ly + (rng(i * 19)() - 0.5) * 3);
    ctx.stroke();
  }

  // Door with vertical timber board hatching
  const doorW = 40 * baseScale;
  const doorH = 70 * baseScale;
  const doorX = cabX + cabW * 0.2;
  const doorY = cabY + cabH - doorH;
  const doorBox: [number, number, number, number] = [doorX, doorY, doorW, doorH];

  ctx.fillStyle = palette.ink;
  ctx.fillRect(doorX, doorY, doorW, doorH);

  hatch(
    ctx,
    (c) => {
      c.rect(doorX, doorY, doorW, doorH);
    },
    doorBox,
    {
      angle: Math.PI * 0.5, // vertical boards
      gap: 5 * baseScale,
      len: 20 * baseScale,
      color: palette.wash,
      alpha: 0.5,
      width: 1.0,
      seed: 501,
    }
  );

  // Door handle
  ctx.fillStyle = palette.accent;
  ctx.beginPath();
  ctx.arc(doorX + doorW * 0.8, doorY + doorH * 0.52, 2.5 * baseScale, 0, Math.PI * 2);
  ctx.fill();

  // Window
  const winW = 50 * baseScale;
  const winH = 40 * baseScale;
  const winX = cabX + cabW * 0.6;
  const winY = cabY + cabH * 0.3;

  // Window glow
  ctx.fillStyle = rainPhase > 0 || snowPhase > 0 ? palette.accent : palette.wash;
  ctx.fillRect(winX, winY, winW, winH);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(winX, winY, winW, winH);

  // Window panes
  ctx.beginPath();
  ctx.moveTo(winX + winW / 2, winY);
  ctx.lineTo(winX + winW / 2, winY + winH);
  ctx.moveTo(winX, winY + winH / 2);
  ctx.lineTo(winX + winW, winY + winH / 2);
  ctx.stroke();

  // Roof
  const roofY = cabY - 60 * baseScale;
  const roofOverhang = 30 * baseScale;
  const roofBox: [number, number, number, number] = [
    cabX - roofOverhang,
    roofY,
    cabW + 2 * roofOverhang,
    cabY - roofY,
  ];

  ctx.fillStyle = palette.ink;
  ctx.beginPath();
  ctx.moveTo(cabX - roofOverhang, cabY);
  ctx.lineTo(cx, roofY);
  ctx.lineTo(cabX + cabW + roofOverhang, cabY);
  ctx.closePath();
  ctx.fill();

  // Roof wooden shingle cross-hatching (replacing Math.random)
  crossHatch(
    ctx,
    (c) => {
      c.moveTo(cabX - roofOverhang, cabY);
      c.lineTo(cx, roofY);
      c.lineTo(cabX + cabW + roofOverhang, cabY);
      c.closePath();
    },
    roofBox,
    {
      angle: 0.45,
      crossAngleOffset: Math.PI * 0.5,
      gap: 7 * baseScale,
      len: 14 * baseScale,
      color: palette.wash,
      alpha: 0.45,
      width: 1.1,
      seed: 601,
    }
  );

  // Roof eaves cast shadow on log facade
  const eaveShadowBox: [number, number, number, number] = [cabX, cabY, cabW, 16 * baseScale];
  hatch(
    ctx,
    (c) => {
      c.rect(cabX, cabY, cabW, 16 * baseScale);
    },
    eaveShadowBox,
    {
      angle: 0.8,
      gap: 4 * baseScale,
      len: 12 * baseScale,
      color: palette.ink,
      alpha: 0.5,
      width: 1.2,
      seed: 602,
    }
  );

  // Roof Snow Accumulation
  if (snowPhase > 0) {
    ctx.fillStyle = palette.wash;
    ctx.beginPath();
    ctx.moveTo(cabX - roofOverhang - 10 * baseScale, cabY);
    ctx.lineTo(cx, roofY - 20 * baseScale * snowPhase);
    ctx.lineTo(cabX + cabW + roofOverhang + 10 * baseScale, cabY);
    ctx.quadraticCurveTo(cx, roofY + 20 * baseScale, cabX - roofOverhang - 10 * baseScale, cabY);
    ctx.fill();

    // Icicles
    ctx.strokeStyle = palette.wash;
    ctx.lineWidth = 3 * baseScale;
    ctx.beginPath();
    for (let i = 0; i < 15; i++) {
      const ix = cabX - roofOverhang + (i / 15) * (cabW + 2 * roofOverhang);
      const iy = cabY;
      const ilen = 10 * baseScale + rng(200 + i)() * 20 * baseScale * snowPhase;
      ctx.moveTo(ix, iy);
      ctx.lineTo(ix, iy + ilen);
    }
    ctx.stroke();
  }

  // Stone Chimney with Masonry Cross-Hatching
  const chimX = cabX + cabW * 0.75;
  const chimY = cabY - 50 * baseScale;
  const chimW = 22 * baseScale;
  const chimH = 42 * baseScale;
  const chimBox: [number, number, number, number] = [chimX, chimY, chimW, chimH];

  ctx.fillStyle = palette.secondary || palette.ink;
  ctx.fillRect(chimX, chimY, chimW, chimH);
  ctx.strokeStyle = palette.ink;
  ctx.strokeRect(chimX, chimY, chimW, chimH);

  // Masonry stonework cross-hatching
  crossHatch(
    ctx,
    (c) => {
      c.rect(chimX, chimY, chimW, chimH);
    },
    chimBox,
    {
      angle: 0.35,
      crossAngleOffset: Math.PI * 0.4,
      gap: 5 * baseScale,
      len: 8 * baseScale,
      color: palette.ink,
      alpha: 0.45,
      width: 1.0,
      seed: 701,
    }
  );

  // Chimney cap
  ctx.fillStyle = palette.ink;
  ctx.fillRect(chimX - 3 * baseScale, chimY - 4 * baseScale, chimW + 6 * baseScale, 5 * baseScale);

  // Curvilinear Hand-Drawn Smoke Loops
  const smokeCount = isFocused ? 8 : 12;
  const smokeRng = rng(777);
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.2;

  for (let i = 0; i < smokeCount; i++) {
    const t = (tau + i * 2) % 15;
    if (t > 0 && t < 15) {
      const sp = t / 15;
      const sSize = (10 + sp * 38 + smokeRng() * 10) * baseScale;
      const sWind = (2 + windGust) * t * baseScale;
      const sx = chimX + chimW / 2 + sWind + Math.sin(t * 2) * 10 * baseScale;
      const sy = chimY - t * 15 * baseScale;

      ctx.save();
      ctx.globalAlpha = (1 - sp) * 0.35;
      ctx.fillStyle = palette.wash;
      ctx.beginPath();
      ctx.arc(sx, sy, sSize, 0, Math.PI * 2);
      ctx.fill();

      // Smoke spiral swirl
      ctx.beginPath();
      ctx.arc(sx, sy, sSize * 0.65, 0, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();

  // 5. Weather Particles & Ink Splatters
  const weatherRng = rng(888);
  const particleCount = 180;

  ctx.save();
  for (let i = 0; i < particleCount; i++) {
    const px0 = weatherRng() * w;
    const py0 = weatherRng() * h;
    const speedOffset = weatherRng();

    // Rain needle strokes
    if (rainPhase > 0 && i < particleCount * rainPhase) {
      const rSpeed = (15 + speedOffset * 10) * (1 + windGust * 0.1);
      const rTime = (tau * 5 + i * 13) % h;
      const px = (px0 + rTime * windGust) % w;
      const py = (py0 + rTime * rSpeed) % h;

      ctx.strokeStyle = palette.ink;
      ctx.globalAlpha = 0.25 + weatherRng() * 0.25;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px - windGust * 2, py + 14 + weatherRng() * 10);
      ctx.stroke();

      // Roof & ground rain splash rings
      if (py > cy + 75 * baseScale && weatherRng() > 0.94) {
        ctx.beginPath();
        ctx.ellipse(px, py, 8 + weatherRng() * 8, 2.5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Snow flakes
    if (snowPhase > 0 && i < particleCount * snowPhase) {
      const sSpeed = 2 + speedOffset * 3;
      const sTime = tau + i * 7;
      const px = (px0 + Math.sin(sTime + speedOffset * 10) * 30 + sTime * (2 + windGust) * 10) % w;
      const py = (py0 + sTime * sSpeed * 10) % h;

      ctx.fillStyle = palette.ink;
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      ctx.arc(px, py, 1.4 + weatherRng() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Distraction Ink splatters
  if (!isFocused && progress > 0.1) {
    const splatRng = rng(Math.floor(tau * 2));
    ctx.fillStyle = palette.ink;
    for (let i = 0; i < 3; i++) {
      const sx = splatRng() * w;
      const sy = splatRng() * h;
      ctx.beginPath();
      ctx.arc(sx, sy, 3 + splatRng() * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  ctx.restore();
}
