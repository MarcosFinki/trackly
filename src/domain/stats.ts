/**
 * Minimal contract required for stats calculations
 */
export interface SessionForStats {
  startTime: Date;
  endTime: Date;
  tags: string[];
}

/**
 * Filter sessions that ended in the last N days
 * Preserves the original type (generic)
 */
export function getSessionsInLastDays<T extends SessionForStats>(
  sessions: T[],
  days: number
): T[] {
  const now = Date.now();
  const limit = now - days * 24 * 60 * 60 * 1000;

  return sessions.filter(
    (s) => s.startTime.getTime() >= limit
  );
}

/**
 * Total duration in milliseconds
 */
export function getTotalDurationMs(
  sessions: SessionForStats[]
): number {
  return sessions.reduce((acc, s) => {
    const duration =
      s.endTime.getTime() - s.startTime.getTime();
    return acc + duration;
  }, 0);
}

/**
 * Aggregate duration by tag
 */
export function getDurationByTag(
  sessions: SessionForStats[]
): Record<string, number> {
  const result: Record<string, number> = {};

  sessions.forEach((session) => {
    const duration =
      session.endTime.getTime() - session.startTime.getTime();

    session.tags.forEach((tag) => {
      result[tag] = (result[tag] ?? 0) + duration;
    });
  });

  return result;
}