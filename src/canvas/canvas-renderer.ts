import { drawPaperBackground } from "./paper-texture";
import { drawLakeScene } from "./scene-lake";
import { drawBotanicalScene } from "./scene-botanical";
import { drawOrreryScene } from "./scene-orrery";
import { drawTerrariumScene } from "./scene-terrarium";
import { drawSeasonsScene } from "./scene-seasons";
import { PALETTES, type VisualLook, type Palette } from "./palettes";

export type SceneId = "lake" | "botanical" | "orrery" | "terrarium" | "seasons";

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private progress = 0;
  private isRunning = false;
  private activeLook: VisualLook = "paper-ink";
  private activeScene: SceneId = "lake";
  private frameIndex = 0;
  private lastTime = 0;
  private rafId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());
    this.startLoop();
  }

  public setProgress(progress: number, isRunning: boolean): void {
    this.progress = progress;
    this.isRunning = isRunning;
  }

  public setLook(look: VisualLook): void {
    this.activeLook = look;
  }

  public setScene(scene: SceneId): void {
    this.activeScene = scene;
  }

  public getPalette(): Palette {
    return PALETTES[this.activeLook];
  }

  private handleResize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private startLoop(): void {
    const frameInterval = 1000 / 12; // 12 fps on twos
    const render = (time: number) => {
      this.rafId = requestAnimationFrame(render);
      if (time - this.lastTime < frameInterval) return;
      this.lastTime = time - ((time - this.lastTime) % frameInterval);
      this.frameIndex++;
      this.draw();
    };
    this.rafId = requestAnimationFrame(render);
  }

  private draw(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const palette: Palette = PALETTES[this.activeLook];
    const tau = this.frameIndex * 0.08 * (this.isRunning ? 1.0 : 0.4);

    this.ctx.clearRect(0, 0, w, h);
    drawPaperBackground(this.ctx, w, h);

    if (this.activeScene === "lake") {
      drawLakeScene(this.ctx, w, h, tau, this.progress, palette, this.frameIndex % 8);
    } else if (this.activeScene === "botanical") {
      drawBotanicalScene(this.ctx, w, h, tau, this.progress, palette);
    } else if (this.activeScene === "orrery") {
      drawOrreryScene(this.ctx, w, h, tau, this.progress, palette, this.frameIndex % 8);
    } else if (this.activeScene === "terrarium") {
      drawTerrariumScene(this.ctx, w, h, tau, this.progress, palette);
    } else if (this.activeScene === "seasons") {
      drawSeasonsScene(this.ctx, w, h, tau, this.progress, palette);
    }
  }

  public destroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }
}
