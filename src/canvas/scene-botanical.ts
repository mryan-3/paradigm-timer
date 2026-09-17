import type { Palette } from "./palettes";
import { rng } from "./canvas-math";

export function drawBotanicalScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  tau: number,
  progress: number,
  palette: Palette
): void {
  ctx.save();
  const cx = w * 0.5;
  const baseY = h * 0.85;
  const maxDepth = 8; // Number of recursive levels
  
  // Base scale for the tree
  const maxLen = Math.min(w, h) * 0.22;

  // Check focus for the "messy scribbles" feature
  const isFocused = typeof document !== "undefined" ? document.hasFocus() : true;

  // Draw pot base
  ctx.fillStyle = palette.ink;
  ctx.beginPath();
  ctx.ellipse(cx, baseY, 50, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Grow tree recursively
  // Using progress to drive the growth of the tree
  drawBranch(
    ctx, 
    cx, 
    baseY, 
    -Math.PI / 2, 
    maxLen, 
    0, 
    maxDepth, 
    progress, 
    tau, 
    palette,
    1337, // Fixed seed for deterministic procedural drawing
    isFocused
  );

  ctx.restore();
}

function drawBranch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  len: number,
  depth: number,
  maxDepth: number,
  progress: number,
  tau: number,
  palette: Palette,
  seed: number,
  isFocused: boolean
) {
  if (depth > maxDepth) return;

  const r = rng(seed + depth * 100);
  
  // Calculate when this specific branch should start growing based on its depth
  // The whole tree grows as progress goes from 0 to 1
  const branchStartProgress = (depth / maxDepth) * 0.8; // Use 80% of progress for growth
  const branchEndProgress = ((depth + 1) / maxDepth) * 0.8;
  
  // If we haven't reached this branch's growth phase yet, don't draw it
  if (progress < branchStartProgress && depth > 0) return;

  // Calculate how much this branch has grown (0 to 1)
  let growth = 1;
  if (depth > 0) {
      if (progress < branchEndProgress) {
          growth = (progress - branchStartProgress) / (branchEndProgress - branchStartProgress);
          // Easing function for smoother growth
          growth = Math.sin(growth * Math.PI / 2);
      }
  }

  // Wiggle angle over time
  const sway = Math.sin(tau * (0.5 + depth * 0.1) + seed) * (0.02 * depth);
  const finalAngle = angle + sway;

  const currentLen = len * growth;
  const endX = x + Math.cos(finalAngle) * currentLen;
  const endY = y + Math.sin(finalAngle) * currentLen;

  // Stroke style
  ctx.lineWidth = Math.max(1, (maxDepth - depth) * 1.5 * growth);
  ctx.strokeStyle = palette.ink;

  // Draw branch segment
  ctx.beginPath();
  ctx.moveTo(x, y);
  
  // Adding organic curvature
  const curveIntensity = (r() - 0.5) * 0.4;
  const cpX = x + Math.cos(finalAngle + curveIntensity) * (currentLen * 0.6);
  const cpY = y + Math.sin(finalAngle + curveIntensity) * (currentLen * 0.6);
  
  ctx.quadraticCurveTo(cpX, cpY, endX, endY);
  ctx.stroke();

  // Bark texture (shading with graphite lines)
  if (depth < maxDepth - 2 && growth > 0.5) {
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = palette.secondary;
      const barkLines = Math.floor(3 * growth);
      const barkRng = rng(seed + 999);
      for(let i = 0; i < barkLines; i++) {
         const t = barkRng() * 0.8 + 0.1;
         const bx = x + (endX - x) * t + (barkRng() - 0.5) * 3;
         const by = y + (endY - y) * t + (barkRng() - 0.5) * 3;
         
         ctx.beginPath();
         ctx.moveTo(bx, by);
         const lengthBark = isFocused ? 5 : 15; // Messy scribbles if not focused
         const angleBark = finalAngle + (barkRng() - 0.5) * (isFocused ? 0.2 : 2.0);
         ctx.lineTo(bx + Math.cos(angleBark) * lengthBark, by + Math.sin(angleBark) * lengthBark);
         ctx.stroke();
      }
  }

  // Draw foliage (leaves/blossoms) at the ends
  if (depth >= maxDepth - 2 && growth > 0.8) {
      const leafProgress = (growth - 0.8) * 5; // 0 to 1
      ctx.fillStyle = depth === maxDepth ? palette.accent : palette.wash;
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 1;
      
      const numLeaves = isFocused ? 1 : 3; // chaotic scribbly leaves if blurred
      
      for(let i=0; i<numLeaves; i++) {
          const lX = endX + (r() - 0.5) * 10 * (isFocused ? 1 : 2);
          const lY = endY + (r() - 0.5) * 10 * (isFocused ? 1 : 2);
          const leafScale = leafProgress * (2 + r() * 2) * (isFocused ? 1 : 1.5);
          
          ctx.beginPath();
          ctx.arc(lX, lY, leafScale, 0, Math.PI * 2);
          ctx.fill();
          if (!isFocused) ctx.stroke(); // Messier outline when out of focus
      }
  }

  // Recursive call for child branches
  if (growth === 1) { // Only spawn children if fully grown
      const childCount = r() > 0.2 ? 2 : 3;
      for (let i = 0; i < childCount; i++) {
        const angleOffset = (r() - 0.5) * 1.0; // Spread of branches
        const lengthFactor = 0.7 + r() * 0.15; // Shrink per depth
        
        drawBranch(
          ctx,
          endX,
          endY,
          finalAngle + angleOffset,
          len * lengthFactor,
          depth + 1,
          maxDepth,
          progress,
          tau,
          palette,
          seed + i * 420,
          isFocused
        );
      }
  }
}
