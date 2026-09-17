export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function computeProgress(remainingSeconds: number, totalSeconds: number): number {
  if (totalSeconds <= 0) return 1.0;
  const elapsed = totalSeconds - remainingSeconds;
  return Math.min(1.0, Math.max(0.0, elapsed / totalSeconds));
}
