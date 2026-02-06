import type {
  FinishedSession as ApiFinishedSession,
} from "../../services/sessionService";

import type {
  FinishedSession,
} from "../../types/finishedSession";

/**
 * Adapts finished sessions coming from the API (DTO)
 * into frontend-friendly domain types.
 */
export function adaptFinishedSessionsFromApi(
  sessions: ApiFinishedSession[]
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