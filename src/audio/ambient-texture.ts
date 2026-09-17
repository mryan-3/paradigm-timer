export class AmbientTexture {
  private ctx: AudioContext;
  private destination: AudioNode;
  private noiseSource: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gain: GainNode | null = null;
  private isRunning = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.destination = destination;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    const buffer = this.createNoiseBuffer();
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "bandpass";
    this.filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.gain = this.ctx.createGain();
    this.gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.gain.gain.linearRampToValueAtTime(0.025, this.ctx.currentTime + 1.2);

    this.noiseSource.connect(this.filter);
    this.filter.connect(this.gain);
    this.gain.connect(this.destination);

    this.noiseSource.start();
  }

  public stop(): void {
    if (!this.isRunning || !this.gain || !this.noiseSource) return;
    this.isRunning = false;
    const now = this.ctx.currentTime;
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    this.gain.gain.linearRampToValueAtTime(0.0001, now + 0.6);

    setTimeout(() => {
      this.noiseSource?.stop();
      this.noiseSource?.disconnect();
      this.noiseSource = null;
    }, 700);
  }

  private createNoiseBuffer(): AudioBuffer {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
    }
    return buffer;
  }
}
