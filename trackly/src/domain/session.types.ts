export type TimerStatus = "running" | "paused";

export interface SessionTimerState {
  startTime: Date;
  pausedAt: Date | null;
  status: TimerStatus;
}