import type { Palette } from "./palettes";
import { rng, drawWobblyPath } from "./canvas-math";

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

  // 1. Draw Wooden/Cork Base
  ctx.fillStyle = palette.ink;
  ctx.beginPath();
  ctx.ellipse(cx, baseY + soilDepth, jarWidth * 0.38, jarWidth * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wood grain texture
  const woodRng = rng(111);
  ctx.strokeStyle = palette.wash;
  ctx.lineWidth = 1;
  for(let i=0; i<8; i++) {
     const py = baseY + soilDepth + (woodRng() - 0.5) * jarWidth * 0.06;
     const pxStart = cx - jarWidth * 0.3;
     const pxEnd = cx + jarWidth * 0.3;
     const pts = [];
     for(let x = pxStart; x <= pxEnd; x += 10) {
        pts.push({x: x, y: py + (woodRng() - 0.5) * 3});
     }
     drawWobblyPath(ctx, pts, 1.5, 111+i, false);
  }

  // 2. Draw Soil layers
  ctx.fillStyle = palette.secondary || palette.ink;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, jarWidth * 0.36, jarWidth * 0.08, 0, 0, Math.PI * 2); // Top soil surface
  ctx.lineTo(cx + jarWidth * 0.36, baseY + soilDepth);
  ctx.ellipse(cx, baseY + soilDepth, jarWidth * 0.36, jarWidth * 0.08, 0, 0, Math.PI, true);
  ctx.lineTo(cx - jarWidth * 0.36, baseY);
  ctx.fill();

  // Soil texture and rocks
  const soilRng = rng(222);
  ctx.fillStyle = palette.wash;
  for(let i=0; i<60; i++) {

    const sx = cx + (soilRng() - 0.5) * jarWidth * 0.6;
    const sy = baseY + soilRng() * soilDepth;
    // Keep roughly inside the soil boundary
    if (Math.pow(sx - cx, 2) / Math.pow(jarWidth * 0.35, 2) + Math.pow(sy - (baseY + soilDepth/2), 2) / Math.pow(soilDepth/2, 2) < 1) {
        ctx.beginPath();
        ctx.arc(sx, sy, 1 + soilRng() * 2, 0, Math.PI * 2);
        ctx.fill();
    }
  }

  // 3. Fractal Roots (growing downwards based on progress)
  const rootRng = rng(333);
  const maxRootDepth = 5;
  const rootCount = 4;
  
  function drawRoot(x: number, y: number, angle: number, len: number, depth: number, maxD: number, p: number, seed: number) {
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
      ctx.lineWidth = Math.max(0.5, (maxD - depth) * 0.6 * growth);
      ctx.beginPath();
      ctx.moveTo(x, y);
      const cpX = x + Math.cos(angle + (r()-0.5)*0.5) * currentLen * 0.5;
      const cpY = y + Math.sin(angle + (r()-0.5)*0.5) * currentLen * 0.5;
      ctx.quadraticCurveTo(cpX, cpY, ex, ey);
      ctx.stroke();
      
      if (growth === 1) {
          const children = r() > 0.3 ? 2 : 1;
          for(let i=0; i<children; i++) {
              drawRoot(ex, ey, angle + (r()-0.5)*1.2, len * (0.6 + r()*0.2), depth + 1, maxD, p, seed + i * 10);
          }
      }
  }

  for(let i=0; i<rootCount; i++) {
      const rx = cx + (rootRng() - 0.5) * jarWidth * 0.5;
      drawRoot(rx, baseY + jarWidth*0.04, Math.PI/2 + (rootRng()-0.5)*0.4, 25 + rootRng()*15, 0, maxRootDepth, progress, 333 + i*100);
  }

  // 4. Textured Moss on surface
  const mossRng = rng(444);
  const mossCount = Math.floor(progress * 150);
  ctx.strokeStyle = palette.ink;
  
  for(let i=0; i<mossCount; i++) {
      const mx = cx + (mossRng() - 0.5) * jarWidth * 0.65;
      const my = baseY + (mossRng() - 0.5) * jarWidth * 0.08;
      
      // Draw squiggly moss paths
      ctx.lineWidth = 0.8;
      const mPts = [];
      mPts.push({x: mx, y: my});
      for(let j=0; j<4; j++) {
          mPts.push({x: mx + (mossRng()-0.5)*8, y: my - mossRng()*6});
      }
      drawWobblyPath(ctx, mPts, 2.0, 444+i, false);
      
      // Add a tiny solid bud
      if (mossRng() > 0.7) {
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.arc(mx, my - 4, 1.5, 0, Math.PI*2);
          ctx.fill();
      }
  }

  // 5. High-Fidelity Mushrooms
  const shroomRng = rng(555);
  const numShrooms = 4;
  for(let i=0; i<numShrooms; i++) {
      const startProg = i * 0.15;
      if (progress > startProg) {
          const growth = Math.min(1.0, (progress - startProg) * 4.0);
          const sx = cx + (shroomRng() - 0.5) * jarWidth * 0.4;
          const sHeight = 25 + shroomRng() * 30;
          const sAngle = (shroomRng() - 0.5) * 0.3;
          const sway = Math.sin(tau + i) * 0.05 * growth;
          
          ctx.save();
          ctx.translate(sx, baseY);
          ctx.rotate(sAngle + sway);
          
          // Wobbly Stem
          ctx.strokeStyle = palette.ink;
          ctx.fillStyle = palette.wash;
          ctx.lineWidth = 2 + growth * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(shroomRng()*10, -sHeight * 0.5 * growth, 0, -sHeight * growth);
          ctx.stroke();
          
          // Cap
          ctx.translate(0, -sHeight * growth);
          const capWidth = (12 + shroomRng() * 10) * growth;
          const capHeight = (8 + shroomRng() * 8) * growth;
          
          // Gills (underside)
          ctx.fillStyle = palette.secondary || palette.ink;
          ctx.beginPath();
          ctx.ellipse(0, 0, capWidth, capHeight * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Top dome
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.moveTo(-capWidth, 0);
          ctx.bezierCurveTo(-capWidth, -capHeight*1.5, capWidth, -capHeight*1.5, capWidth, 0);
          ctx.quadraticCurveTo(0, capHeight*0.4, -capWidth, 0);
          ctx.fill();
          ctx.stroke(); // Outline
          
          // Spots
          ctx.fillStyle = palette.wash;
          for(let s=0; s<3; s++) {
             ctx.beginPath();
             ctx.arc((shroomRng()-0.5)*capWidth*1.2, -capHeight*0.4 - shroomRng()*capHeight*0.4, 1.5*growth, 0, Math.PI*2);
             ctx.fill();
          }
          
          ctx.restore();
      }
  }

  // 6. Creeping Vines on the Glass Walls
  const vineRng = rng(666);
  function drawVine(side: number) {
      // side: -1 for left, 1 for right
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
      
      for(let i=1; i<=vNodes; i++) {
          // Vines climb up and slightly inward, tracing the jar shape
          currY -= (15 + vineRng()*10);
          // Jar curve approximation:
          const jarCurve = (cy - currY) / (jarHeight * 0.5);
          currX = cx + side * jarWidth * 0.36 * (1 - Math.max(0, jarCurve * jarCurve * 0.3));
          currX += (vineRng() - 0.5) * 5; // wiggle
          
          ctx.lineTo(currX, currY);
          
          // Draw leaf
          if (vineRng() > 0.3) {
              ctx.save();
              ctx.translate(currX, currY);
              ctx.rotate(side * (Math.PI/4 + vineRng()*Math.PI/4) + Math.sin(tau + i)*0.1);
              ctx.fillStyle = palette.wash;
              ctx.beginPath();
              ctx.ellipse(5, 0, 5, 2, 0, 0, Math.PI*2);
              ctx.fill();
              ctx.stroke();
              ctx.restore();
          }
      }
      ctx.stroke();
  }
  
  drawVine(-1);
  drawVine(1);

  // 7. Fireflies with Motion Trails & Distraction Mechanic
  const bugRng = rng(777);
  const maxBugs = 15;
  const currentBugs = Math.floor(progress * maxBugs);
  
  for (let i = 0; i < currentBugs; i++) {
      const speed = 0.3 + bugRng() * 0.5;
      const timeOffset = bugRng() * 1000;
      
      // Calculate current position
      const bx = cx + Math.sin(tau * speed + timeOffset) * jarWidth * 0.3;
      let by = cy + Math.cos(tau * speed * 1.2 + timeOffset) * jarHeight * 0.25;
      
      if (!isFocused) {
          // Drop to sleep
          by = baseY - 5 - bugRng() * 5;
          ctx.fillStyle = palette.ink; 
          ctx.beginPath();
          ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
          ctx.fill();
      } else {
          // Trail
          ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for(let t=0; t<5; t++) {
              const oldTau = tau - t * 0.1;
              const ox = cx + Math.sin(oldTau * speed + timeOffset) * jarWidth * 0.3;
              const oy = cy + Math.cos(oldTau * speed * 1.2 + timeOffset) * jarHeight * 0.25;
              if (t===0) ctx.moveTo(ox, oy);
              else ctx.lineTo(ox, oy);
          }
          ctx.stroke();
          
          // Bug body and glow
          ctx.fillStyle = palette.ink;
          ctx.beginPath();
          ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          const pulse = Math.sin(tau * 4 + i) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * pulse})`;
          ctx.beginPath();
          ctx.arc(bx, by, 5 + pulse * 4, 0, Math.PI * 2);
          ctx.fill();
      }
  }

  // 8. The Glass Jar Outline & Thick Reflections
  ctx.strokeStyle = palette.ink;
  ctx.lineWidth = 1.5;
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

  // Glass Reflections (wobbly, parallel to the curves)
  ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - jarWidth * 0.32, baseY - jarHeight * 0.1);
  ctx.bezierCurveTo(cx - jarWidth * 0.38, cy, cx - jarWidth * 0.28, topY + jarHeight * 0.1, cx - jarWidth * 0.1, topY + jarHeight * 0.05);
  ctx.stroke();
  
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - jarWidth * 0.28, baseY - jarHeight * 0.15);
  ctx.bezierCurveTo(cx - jarWidth * 0.34, cy, cx - jarWidth * 0.24, topY + jarHeight * 0.15, cx - jarWidth * 0.08, topY + jarHeight * 0.1);
  ctx.stroke();

  ctx.restore();
}
