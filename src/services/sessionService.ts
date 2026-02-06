const API_URL = "http://localhost:3001";

export type SessionStatus =
  | "running"
  | "finished"
  | "cancelled";

/**
 * Active session DTO as returned by the API
 */
export interface ActiveSession {
  id: number;
  projectId: number | null;
  startTime: string;
  endTime?: string | null;
  description?: string | null;
  status: SessionStatus; // always "running"
}

/**
 * Finished session DTO as returned by the API
 */
export interface FinishedSession {
  id: number;
  projectId: number | null;
  startTime: string;
  endTime: string;
  description: string | null;
  tags: string[];
}

/**
 * Load active session
 */
export async function getActiveSession(): Promise<ActiveSession | null> {
  const res = await fetch(`${API_URL}/sessions/active`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_LOAD_ACTIVE_SESSION");
  }

  const data = await res.json();

  if (!data.active) return null;
  return data.session;
}

/**
 * Start new session
 */
export async function startSession(
  projectId?: number
): Promise<void> {
  const res = await fetch(`${API_URL}/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ projectId }),
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_START_SESSION");
  }
}

/**
 * Finalize (save) session
 */
export async function finalizeSession(
  sessionId: number,
  description: string,
  tags: string[]
): Promise<void> {
  const res = await fetch(`${API_URL}/sessions/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      sessionId,
      description,
      tags,
    }),
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_FINALIZE_SESSION");
  }
}

/**
 * Cancel active session without saving
 */
export async function cancelSession(): Promise<void> {
  const res = await fetch(`${API_URL}/sessions/cancel`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_CANCEL_SESSION");
  }
}

/**
 * Load finished sessions
 */
export async function getFinishedSessions(): Promise<FinishedSession[]> {
  const res = await fetch(`${API_URL}/sessions/finished`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_LOAD_FINISHED_SESSIONS");
  }

  const data = await res.json();
  return data.sessions;
}