export interface SoundOptions {
  muted?: boolean;
  masterVolume?: number; // 0.0 to 1.0
}

export type ChimeType = "start" | "milestone" | "complete" | "click";
