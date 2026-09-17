import { TIMER_PRESETS } from "./timer-types";
import type { TimerMode, TimerStatus, TimerSnapshot, TickListener, MilestoneListener, CompleteListener } from "./timer-types";
import { formatDuration, computeProgress } from "./timer-format";

export class TimerEngine {
  private mode: TimerMode = "focus-25";
  private status: TimerStatus = "idle";
  private remainingSeconds: number = TIMER_PRESETS["focus-25"].seconds;
  private timerId: number | null = null;
  private lastTimestamp: number = 0;
  private milestonesEmitted = new Set<number>();

  private tickListeners: TickListener[] = [];
  private milestoneListeners: MilestoneListener[] = [];
  private completeListeners: CompleteListener[] = [];

  constructor(initialMode: TimerMode = "focus-25") {
    this.setMode(initialMode);
  }

  public getSnapshot(): TimerSnapshot {
    const totalSeconds = TIMER_PRESETS[this.mode].seconds;
    return {
      mode: this.mode,
      status: this.status,
      remainingSeconds: this.remainingSeconds,
      totalSeconds,
      progress: computeProgress(this.remainingSeconds, totalSeconds),
      formattedTime: formatDuration(this.remainingSeconds),
    };
  }

  public setMode(newMode: TimerMode): void {
    this.pause();
    this.mode = newMode;
    this.remainingSeconds = TIMER_PRESETS[newMode].seconds;
    this.status = "idle";
    this.milestonesEmitted.clear();
    this.notifyTick();
  }

  public start(): void {
    if (this.status === "running") return;
    if (this.status === "completed") this.reset();
    this.status = "running";
    this.lastTimestamp = performance.now();
    this.timerId = window.setInterval(() => this.tick(), 250);
    this.notifyTick();
  }

  public pause(): void {
    if (this.status !== "running") return;
    this.status = "paused";
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.notifyTick();
  }

  public reset(): void {
    this.pause();
    this.remainingSeconds = TIMER_PRESETS[this.mode].seconds;
    this.status = "idle";
    this.milestonesEmitted.clear();
    this.notifyTick();
  }

  public onTick(cb: TickListener): () => void {
    this.tickListeners.push(cb);
    return () => (this.tickListeners = this.tickListeners.filter((l) => l !== cb));
  }

  public onMilestone(cb: MilestoneListener): () => void {
    this.milestoneListeners.push(cb);
    return () => (this.milestoneListeners = this.milestoneListeners.filter((l) => l !== cb));
  }

  public onComplete(cb: CompleteListener): () => void {
    this.completeListeners.push(cb);
    return () => (this.completeListeners = this.completeListeners.filter((l) => l !== cb));
  }

  private tick(): void {
    const now = performance.now();
    const elapsedSec = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    this.remainingSeconds = Math.max(0, this.remainingSeconds - elapsedSec);
    this.checkMilestones();
    this.notifyTick();

    if (this.remainingSeconds <= 0) {
      this.complete();
    }
  }

  private checkMilestones(): void {
    const p = this.getSnapshot().progress;
    const thresholds = [0.25, 0.5, 0.75];
    for (const t of thresholds) {
      if (p >= t && !this.milestonesEmitted.has(t)) {
        this.milestonesEmitted.add(t);
        const snap = this.getSnapshot();
        this.milestoneListeners.forEach((fn) => fn(t, snap));
      }
    }
  }

  private complete(): void {
    this.pause();
    this.status = "completed";
    const snap = this.getSnapshot();
    this.completeListeners.forEach((fn) => fn(snap));
  }

  private notifyTick(): void {
    const snap = this.getSnapshot();
    this.tickListeners.forEach((fn) => fn(snap));
  }
}
