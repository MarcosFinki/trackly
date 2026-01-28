import type { WorkSession } from "./session";

export function getFinishedSessions(
  sessions: WorkSession[]
): WorkSession[] {
  return sessions.filter(
    (s) =>
      s.endTime !== null &&
      typeof s.description === "string" &&
      s.description.length > 0
  );
}

export function getSessionsInLastDays(
  sessions: WorkSession[],
  days: number
): WorkSession[] {
  const now = Date.now();
  const limit = now - days * 24 * 60 * 60 * 1000;

  return sessions.filter((s) => {
    if (!s.endTime) return false;
    return s.endTime.getTime() >= limit;
  });
}

export function getTotalDurationMs(
  sessions: WorkSession[]
): number {
  return sessions.reduce((acc, s) => {
    if (!s.endTime) return acc;
    return acc + (s.endTime.getTime() - s.startTime.getTime());
  }, 0);
}

export function getDurationByTag(
  sessions: WorkSession[]
): Record<string, number> {
  const result: Record<string, number> = {};

  sessions.forEach((session) => {
    if (!session.endTime) return;

    const duration =
      session.endTime.getTime() - session.startTime.getTime();

    session.tags.forEach((tag) => {
      result[tag] = (result[tag] ?? 0) + duration;
    });
  });

  return result;
}