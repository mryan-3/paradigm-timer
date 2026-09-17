export type TimerMode = "focus-25" | "focus-50" | "break-5" | "break-10";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export interface TimerSnapshot {
  readonly mode: TimerMode;
  readonly status: TimerStatus;
  readonly remainingSeconds: number;
  readonly totalSeconds: number;
  readonly progress: number; // 0.0 (start) to 1.0 (finish)
  readonly formattedTime: string;
}

export type TickListener = (snapshot: TimerSnapshot) => void;
export type StateListener = (status: TimerStatus, snapshot: TimerSnapshot) => void;
export type MilestoneListener = (milestone: number, snapshot: TimerSnapshot) => void;
export type CompleteListener = (snapshot: TimerSnapshot) => void;

export const TIMER_PRESETS: Record<TimerMode, { label: string; seconds: number; isBreak: boolean }> = {
  "focus-25": { label: "25m Focus", seconds: 25 * 60, isBreak: false },
  "focus-50": { label: "50m Deep Work", seconds: 50 * 60, isBreak: false },
  "break-5": { label: "5m Rest", seconds: 5 * 60, isBreak: true },
  "break-10": { label: "10m Rest", seconds: 10 * 60, isBreak: true },
};
