const API_URL = "http://localhost:3001";

export type SessionStatus =
  | "running"
  | "stopping"
  | "finished"
  | "cancelled";

export interface ActiveSession {
  id: number;
  projectId: number | null;
  startTime: string;
  endTime?: string | null;
  description?: string | null;
  status: SessionStatus;
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  const res = await fetch(`${API_URL}/sessions/active`);
  const data = await res.json();

  if (!data.active) return null;
  return data.session;
}

export async function startSession(projectId?: number) {
  const res = await fetch(`${API_URL}/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });

  if (!res.ok) throw new Error("Failed to start session");
  return res.json();
}

export async function stopSession() {
  const res = await fetch(`${API_URL}/sessions/stop`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to stop session");
  return res.json();
}

export async function cancelSession() {
  const res = await fetch(`${API_URL}/sessions/cancel-without-save`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to cancel session");
  return res.json();
}

export async function finalizeSession(
  sessionId: number,
  description: string,
  tags: string[]
) {
  const res = await fetch(`${API_URL}/sessions/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, description, tags }),
  });

  if (!res.ok) throw new Error("Failed to finalize session");
  return res.json();
}

export interface FinishedSession {
  id: number;
  projectId: number | null;
  startTime: string;
  endTime: string;
  description: string | null;
  tags: string[];
}

export async function getFinishedSessions(): Promise<FinishedSession[]> {
  const res = await fetch(`${API_URL}/sessions/finished`);
  if (!res.ok) throw new Error("Failed to load sessions");

  const data = await res.json();
  return data.sessions;
}