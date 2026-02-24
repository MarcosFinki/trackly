import type {
  ActiveSessionDTO,
  FinishedSessionDTO,
} from "../../types/session.dto";

import type {
  ActiveSession,
  FinishedSession,
} from "../../types/session";

/* =========================
   Helpers
========================= */

function parseDate(value: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/* =========================
   Active
========================= */

export function adaptActiveSessionFromApi(
  dto: ActiveSessionDTO
): ActiveSession {
  return {
    id: dto.id,
    projectId: dto.project_id,
    startTime: parseDate(dto.start_time) ?? new Date(0), // fallback seguro
    endTime: parseDate(dto.end_time),
    description: dto.description ?? null,
    status: dto.status,
  };
}

/* =========================
   Finished
========================= */

export function adaptFinishedSessionsFromApi(
  dtos: FinishedSessionDTO[]
): FinishedSession[] {
  return dtos.map((dto) => ({
    id: dto.id,
    projectId: dto.project_id,
    startTime: parseDate(dto.start_time) ?? new Date(0),
    endTime: parseDate(dto.end_time) ?? new Date(0),
    description: dto.description ?? null,
    tags: dto.tags ?? [],
  }));
}