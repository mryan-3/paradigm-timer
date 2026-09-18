import type { Palette } from "./palettes";
import { rng, drawWobblyPath } from "./canvas-math";
import { hatch, crossHatch, contourHatch, stippleGrain } from "./canvas-hatching";

export function drawTerrariumScene(
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
  const jarWidth = Math.min(w, h) * 0.45;
  const jarHeight = jarWidth * 1.4;
  const baseY = cy + jarHeight * 0.35;
  const topY = cy - jarHeight * 0.45;
  const soilDepth = jarWidth * 0.25;

  const isFocused = typeof document !== "undefined" ? document.hasFocus() : true;

  // 1. Wooden / Cork Base with tactile annular rings & grain
  const baseBox: [number, number, number, number] = [
    cx - jarWidth * 0.4,
    baseY + soilDepth - jarWidth * 0.08,
    jarWidth * 0.8,
    jarWidth * 0.16,
  ];

  ctx.fillStyle = palette.ink;
  ctx.beginPath();
  ctx.ellipse(cx, baseY + soilDepth, jarWidth * 0.38, jarWidth * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  // Contour woodgrain hatching
  contourHatch(
    ctx,
    (c) => {
      c.ellipse(cx, baseY + soilDepth, jarWidth * 0.38, jarWidth * 0.08, 0, 0, Math.PI * 2);
    },
    baseBox,
    {
      gap: 5,
      curvature: 0.12,
      color: palette.wash,
      alpha: 0.7,
      width: 1.1,
      seed: 111,
    }
  );

  stippleGrain(
    ctx,
    (c) => {
      c.ellipse(cx, baseY + soilDepth, jarWidth * 0.38, jarWidth * 0.08, 0, 0, Math.PI * 2);
    },
    baseBox,
    45,
    { color: palette.wash, alpha: 0.5, size: 1.4, seed: 112 }
  );

  // 2. Stratified Geological Soil Layers (Drainage gravel, charcoal band, and loamy topsoil)
  const soilBox: [number, number, number, number] = [
    cx - jarWidth * 0.38,
    baseY,
    jarWidth * 0.76,
    soilDepth,
  ];

  // Base soil mass
  ctx.fillStyle = palette.secondary || palette.ink;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, jarWidth * 0.36, jarWidth * 0.08, 0, 0, Math.PI * 2);
  ctx.lineTo(cx + jarWidth * 0.36, baseY + soilDepth);
  ctx.ellipse(cx, baseY + soilDepth, jarWidth * 0.36, jarWidth * 0.08, 0, 0, Math.PI, true);
  ctx.lineTo(cx - jarWidth * 0.36, baseY);
  ctx.fill();

  // Overall soil base tooth
  stippleGrain(
    ctx,
    (c) => {
      c.ellipse(cx, baseY, jarWidth * 0.36, jarWidth * 0.08, 0, 0, Math.PI * 2);
      c.lineTo(cx + jarWidth * 0.36, baseY + soilDepth);
      c.ellipse(cx, baseY + soilDepth, jarWidth * 0.36, jarWidth * 0.08, 0, 0, Math.PI, true);
      c.lineTo(cx - jarWidth * 0.36, baseY);
    },
    soilBox,
    80,
    { color: palette.ink, alpha: 0.2, size: 1.6, seed: 199 }
  );

  // Layer A: Coarse Drainage Gravel at bottom (sediment hatch + rounded pebbles)
  const gravelBox: [number, number, number, number] = [
    cx - jarWidth * 0.38,
    baseY + soilDepth * 0.65,
    jarWidth * 0.76,
    soilDepth * 0.35,
  ];
  crossHatch(
    ctx,
    (c) => {
      c.rect(gravelBox[0], gravelBox[1], gravelBox[2], gravelBox[3]);
    },
    gravelBox,
    {
      angle: 0.4,
      gap: 6,
      len: 12,
      color: palette.ink,
      alpha: 0.35,
      seed: 201,
    }
  );

  // Layer B: Activated Charcoal Filtration Band (dense diagonal hatch)
  const charcoalBox: [number, number, number, number] = [
    cx - jarWidth * 0.37,
    baseY + soilDepth * 0.38,
    jarWidth * 0.74,
    soilDepth * 0.28,
  ];
  hatch(
    ctx,
    (c) => {
      c.rect(charcoalBox[0], charcoalBox[1], charcoalBox[2], charcoalBox[3]);
    },
    charcoalBox,
    {
      angle: 1.25,
      gap: 4,
      len: 15,
      color: palette.ink,
      alpha: 0.45,
      width: 1.3,
      seed: 202,
    }
  );

  // Layer C: Rich Loamy Topsoil (fine angled cross-hatch + stipple grain)
  const topsoilBox: [number, number, number, number] = [
    cx - jarWidth * 0.36,
    baseY,
    jarWidth * 0.72,
    soilDepth * 0.4,
  ];
  crossHatch(
    ctx,
    (c) => {
      c.ellipse(cx, baseY, jarWidth * 0.36, jarWidth * 0.08, 0, 0, Math.PI * 2);
      c.rect(topsoilBox[0], topsoilBox[1], topsoilBox[2], topsoilBox[3]);
    },
    topsoilBox,
    {
      angle: 0.78,
      gap: 7,
      len: 10,
      color: palette.accent,
      alpha: 0.25,
      seed: 203,
    }
  );

  // Surface texture pebbles
  const soilRng = rng(222);
  ctx.fillStyle = palette.wash;
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 28; i++) {
    const sx = cx + (soilRng() - 0.5) * jarWidth * 0.6;
    const sy = baseY + soilRng() * soilDepth;
    const rVal = 1.5 + soilRng() * 2.5;
    ctx.beginPath();
    ctx.arc(sx, sy, rVal, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 3. Fractal Roots (growing downwards through strata with session progress)
  const rootRng = rng(333);
  const maxRootDepth = 5;
  const rootCount = 4;

  function drawRoot(
    x: number,
    y: number,
    angle: number,
    len: number,
    depth: number,
    maxD: number,
    p: number,
    seed: number
  ) {
    if (depth > maxD) return;
    const r = rng(seed);
    const startP = depth / maxD;
    const endP = (depth + 1) / maxD;
    if (p < startP) return;

    let growth = 1;
    if (p < endP) {
      growth = (p - startP) / (endP - startP);
    }

    const currentLen = len * growth;
    const ex = x + Math.cos(angle) * currentLen;
    const ey = y + Math.sin(angle) * currentLen;

    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = Math.max(0.6, (maxD - depth) * 0.65 * growth);
    ctx.beginPath();
    ctx.moveTo(x, y);
    const cpX = x + Math.cos(angle + (r() - 0.5) * 0.5) * currentLen * 0.5;
    const cpY = y + Math.sin(angle + (r() - 0.5) * 0.5) * currentLen * 0.5;
    ctx.quadraticCurveTo(cpX, cpY, ex, ey);
    ctx.stroke();

    if (growth === 1) {
      const children = r() > 0.3 ? 2 : 1;
      for (let i = 0; i < children; i++) {
        drawRoot(
          ex,
          ey,
          angle + (r() - 0.5) * 1.2,
          len * (0.6 + r() * 0.2),
          depth + 1,
          maxD,
          p,
          seed + i * 10
        );
      }
    }
  }

  for (let i = 0; i < rootCount; i++) {
    const rx = cx + (rootRng() - 0.5) * jarWidth * 0.5;
    drawRoot(
      rx,
      baseY + jarWidth * 0.04,
      Math.PI / 2 + (rootRng() - 0.5) * 0.4,
      25 + rootRng() * 15,
      0,
      maxRootDepth,
      progress,
      333 + i * 100
    );
  }

  // 4. Textured Moss on surface with feathered tendril strokes
  const mossRng = rng(444);
  const mossCount = Math.floor(progress * 160);
  ctx.strokeStyle = palette.ink;

  for (let i = 0; i < mossCount; i++) {
    const mx = cx + (mossRng() - 0.5) * jarWidth * 0.65;
    const my = baseY + (mossRng() - 0.5) * jarWidth * 0.08;

    ctx.lineWidth = 0.8;
    const mPts = [];
    mPts.push({ x: mx, y: my });
    for (let j = 0; j < 4; j++) {
      mPts.push({ x: mx + (mossRng() - 0.5) * 8, y: my - mossRng() * 6 });
    }
    drawWobblyPath(ctx, mPts, 1.8, 444 + i, false);

    // Tiny spore bud
    if (mossRng() > 0.65) {
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.arc(mx, my - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 5. High-Fidelity Botanical Mushrooms with Gills & Cap Contour Hatching
  const shroomRng = rng(555);
  const numShrooms = 4;
  for (let i = 0; i < numShrooms; i++) {
    const startProg = i * 0.15;
    if (progress > startProg) {
      const growth = Math.min(1.0, (progress - startProg) * 4.0);
      const sx = cx + (shroomRng() - 0.5) * jarWidth * 0.42;
      const sHeight = 25 + shroomRng() * 30;
      const sAngle = (shroomRng() - 0.5) * 0.3;
      const sway = Math.sin(tau + i) * 0.05 * growth;

      ctx.save();
      ctx.translate(sx, baseY);
      ctx.rotate(sAngle + sway);

      // Wobbly Stem with longitudinal fibrous hatching
      ctx.strokeStyle = palette.ink;
      ctx.fillStyle = palette.wash;
      ctx.lineWidth = 1.8 + growth * 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(shroomRng() * 10, -sHeight * 0.5 * growth, 0, -sHeight * growth);
      ctx.stroke();

      // Stem fibrous strokes
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = palette.ink;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.quadraticCurveTo(shroomRng() * 8, -sHeight * 0.5 * growth, -1, -sHeight * growth);
      ctx.moveTo(1, 0);
      ctx.quadraticCurveTo(shroomRng() * 12, -sHeight * 0.5 * growth, 1, -sHeight * growth);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Cap
      ctx.translate(0, -sHeight * growth);
      const capWidth = (14 + shroomRng() * 10) * growth;
      const capHeight = (9 + shroomRng() * 8) * growth;

      // Underside with radial gills
      ctx.fillStyle = palette.secondary || palette.ink;
      ctx.beginPath();
      ctx.ellipse(0, 0, capWidth, capHeight * 0.32, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gills: radiating fine strokes
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let g = 0; g < 14; g++) {
        const gAngle = (g / 14) * Math.PI * 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(gAngle) * capWidth * 0.9, Math.sin(gAngle) * capHeight * 0.28);
      }
      ctx.stroke();

      // Top Dome
      const capBox: [number, number, number, number] = [
        -capWidth,
        -capHeight * 1.5,
        capWidth * 2,
        capHeight * 1.8,
      ];
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.moveTo(-capWidth, 0);
      ctx.bezierCurveTo(-capWidth, -capHeight * 1.5, capWidth, -capHeight * 1.5, capWidth, 0);
      ctx.quadraticCurveTo(0, capHeight * 0.35, -capWidth, 0);
      ctx.fill();
      ctx.stroke();

      // Curved form contour hatching on the mushroom cap
      contourHatch(
        ctx,
        (c) => {
          c.moveTo(-capWidth, 0);
          c.bezierCurveTo(-capWidth, -capHeight * 1.5, capWidth, -capHeight * 1.5, capWidth, 0);
          c.quadraticCurveTo(0, capHeight * 0.35, -capWidth, 0);
        },
        capBox,
        {
          gap: 3.5,
          curvature: 0.3,
          color: palette.ink,
          alpha: 0.35,
          width: 0.9,
          seed: 555 + i,
        }
      );

      // Spots with tiny wash halos
      ctx.fillStyle = palette.wash;
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        ctx.arc(
          (shroomRng() - 0.5) * capWidth * 1.2,
          -capHeight * 0.4 - shroomRng() * capHeight * 0.4,
          1.6 * growth,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 6. Creeping Vines with Vein Feathering on Leaves
  const vineRng = rng(666);
  function drawVine(side: number) {
    const startX = cx + side * jarWidth * 0.36;
    const startY = baseY - jarWidth * 0.05;

    const vMaxNodes = 20;
    const vNodes = Math.floor(progress * vMaxNodes);

    ctx.strokeStyle = palette.ink;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    let currX = startX;
    let currY = startY;

    for (let i = 1; i <= vNodes; i++) {
      currY -= 15 + vineRng() * 10;
      const jarCurve = (cy - currY) / (jarHeight * 0.5);
      currX = cx + side * jarWidth * 0.36 * (1 - Math.max(0, jarCurve * jarCurve * 0.3));
      currX += (vineRng() - 0.5) * 5;

      ctx.lineTo(currX, currY);

      // Leaf with central spine and angled feather hatching
      if (vineRng() > 0.28) {
        ctx.save();
        ctx.translate(currX, currY);
        ctx.rotate(side * (Math.PI / 4 + vineRng() * (Math.PI / 4)) + Math.sin(tau + i) * 0.1);

        ctx.fillStyle = palette.wash;
        ctx.strokeStyle = palette.ink;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(5, 0, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Central spine & side veins
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(10, 0);
        ctx.moveTo(3, 0);
        ctx.lineTo(5, -1.8);
        ctx.moveTo(6, 0);
        ctx.lineTo(8, -1.5);
        ctx.moveTo(4, 0);
        ctx.lineTo(6, 1.8);
        ctx.stroke();

        ctx.restore();
      }
    }
    ctx.stroke();
  }

  drawVine(-1);
  drawVine(1);

  // 7. Fireflies with Aster Rays & Radiant Motes
  const bugRng = rng(777);
  const maxBugs = 16;
  const currentBugs = Math.floor(progress * maxBugs);

  for (let i = 0; i < currentBugs; i++) {
    const speed = 0.3 + bugRng() * 0.5;
    const timeOffset = bugRng() * 1000;

    const bx = cx + Math.sin(tau * speed + timeOffset) * jarWidth * 0.3;
    let by = cy + Math.cos(tau * speed * 1.2 + timeOffset) * jarHeight * 0.25;

    if (!isFocused) {
      by = baseY - 5 - bugRng() * 5;
      ctx.fillStyle = palette.ink;
      ctx.beginPath();
      ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Subtle wake line
      ctx.strokeStyle = palette.wash;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let t = 0; t < 5; t++) {
        const oldTau = tau - t * 0.12;
        const ox = cx + Math.sin(oldTau * speed + timeOffset) * jarWidth * 0.3;
        const oy = cy + Math.cos(oldTau * speed * 1.2 + timeOffset) * jarHeight * 0.25;
        if (t === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.stroke();

      // Glowing body
      ctx.fillStyle = palette.ink;
      ctx.beginPath();
      ctx.arc(bx, by, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Hand-drawn aster rays
      const pulse = Math.sin(tau * 3.5 + i) * 0.5 + 0.5;
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.4 + pulse * 0.5;
      const rayR = 4 + pulse * 4;
      ctx.beginPath();
      ctx.moveTo(bx - rayR, by);
      ctx.lineTo(bx + rayR, by);
      ctx.moveTo(bx, by - rayR);
      ctx.lineTo(bx, by + rayR);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }
  }

  // 8. The Glass Jar: Architectural Contours & Tactile Reflection Ribbons
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";

  // Left wall
  ctx.beginPath();
  ctx.moveTo(cx - jarWidth * 0.36, baseY);
  ctx.bezierCurveTo(cx - jarWidth * 0.42, cy, cx - jarWidth * 0.32, topY, cx, topY);
  ctx.stroke();

  // Right wall
  ctx.beginPath();
  ctx.moveTo(cx + jarWidth * 0.36, baseY);
  ctx.bezierCurveTo(cx + jarWidth * 0.42, cy, cx + jarWidth * 0.32, topY, cx, topY);
  ctx.stroke();

  // Curving glass highlight ribbons with fine wash hatching
  const glassReflectBox: [number, number, number, number] = [
    cx - jarWidth * 0.38,
    topY + jarHeight * 0.05,
    jarWidth * 0.3,
    jarHeight * 0.8,
  ];
  hatch(
    ctx,
    (c) => {
      c.moveTo(cx - jarWidth * 0.32, baseY - jarHeight * 0.1);
      c.bezierCurveTo(
        cx - jarWidth * 0.38,
        cy,
        cx - jarWidth * 0.28,
        topY + jarHeight * 0.1,
        cx - jarWidth * 0.1,
        topY + jarHeight * 0.05
      );
      c.lineTo(cx - jarWidth * 0.06, topY + jarHeight * 0.08);
      c.bezierCurveTo(
        cx - jarWidth * 0.24,
        topY + jarHeight * 0.15,
        cx - jarWidth * 0.34,
        cy,
        cx - jarWidth * 0.28,
        baseY - jarHeight * 0.1
      );
      c.closePath();
    },
    glassReflectBox,
    {
      angle: 0.9,
      gap: 5,
      len: 12,
      color: palette.wash,
      alpha: 0.6,
      width: 1.2,
      seed: 808,
    }
  );

  ctx.restore();
}
