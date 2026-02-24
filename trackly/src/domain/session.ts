import type { SessionTimerState } from "./session.types";

export function startTimer(startTime: Date): SessionTimerState {
  return {
    startTime,
    pausedAt: null,
    status: "running",
  };
}

export function pauseTimer(
  timer: SessionTimerState
): SessionTimerState {
  if (timer.status !== "running") {
    throw new Error("Timer is not running");
  }

  return {
    ...timer,
    pausedAt: new Date(),
    status: "paused",
  };
}

export function resumeTimer(
  timer: SessionTimerState
): SessionTimerState {
  if (timer.status !== "paused" || !timer.pausedAt) {
    throw new Error("Timer is not paused");
  }

  const pausedDuration =
    Date.now() - timer.pausedAt.getTime();

  return {
    startTime: new Date(
      timer.startTime.getTime() + pausedDuration
    ),
    pausedAt: null,
    status: "running",
  };
}

export function getElapsedMs(
  timer: SessionTimerState
): number {
  const end =
    timer.status === "paused" && timer.pausedAt
      ? timer.pausedAt
      : new Date();

  return end.getTime() - timer.startTime.getTime();
}