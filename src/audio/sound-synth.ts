import type { ChimeType, SoundOptions } from "./audio-types";
import { playHarmonicChime } from "./harmonic-bell";
import { AmbientTexture } from "./ambient-texture";

export class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambient: AmbientTexture | null = null;
  private isMuted: boolean = false;

  constructor(options: SoundOptions = {}) {
    this.isMuted = options.muted ?? false;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0.0001 : 1.0;
      this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playChime(type: ChimeType): void {
    if (this.isMuted) return;
    this.ensureContext();
    if (this.ctx && this.masterGain) {
      playHarmonicChime(this.ctx, this.masterGain, type);
    }
  }

  public startAmbientFocus(): void {
    if (this.isMuted) return;
    this.ensureContext();
    if (this.ctx && this.masterGain && !this.ambient) {
      this.ambient = new AmbientTexture(this.ctx, this.masterGain);
    }
    this.ambient?.start();
  }

  public stopAmbientFocus(): void {
    this.ambient?.stop();
  }

  private ensureContext(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : 1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }
}
