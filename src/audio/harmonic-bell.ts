import type { ChimeType } from "./audio-types";

export function playHarmonicChime(ctx: AudioContext, master: GainNode, type: ChimeType): void {
  const t = ctx.currentTime;
  const freqs = getFrequencies(type);

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t + idx * 0.12);

    const startTime = t + idx * 0.12;
    const duration = type === "complete" ? 3.0 : 1.8;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.18 / (idx + 1), startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(master);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  });
}

function getFrequencies(type: ChimeType): number[] {
  switch (type) {
    case "start":
      return [392.0, 587.33]; // G4 -> D5 rising
    case "milestone":
      return [523.25, 659.25]; // C5 -> E5 gentle harmonic
    case "complete":
      return [261.63, 392.0, 523.25, 659.25]; // C4, G4, C5, E5 resonant chord
    case "click":
    default:
      return [880.0];
  }
}
