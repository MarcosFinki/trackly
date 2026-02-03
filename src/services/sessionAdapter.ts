import type { FinishedSession as ApiSession } from "../services/sessionService";
import type { FinishedSession } from "../types/finishedSession";

export function adaptFinishedSessions(
  sessions: ApiSession[]
): FinishedSession[] {
  return sessions.map((s) => ({
    id: s.id,
    projectId: s.projectId,
    startTime: new Date(s.startTime),
    endTime: new Date(s.endTime),
    description: s.description,
    tags: s.tags,
  }));
}