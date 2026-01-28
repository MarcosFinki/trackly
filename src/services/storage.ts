import type { WorkSession } from "../domain/session";

const STORAGE_KEY = "trackly:sessions";

export function getSessions(): WorkSession[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as WorkSession[];

    // Convertir strings a Date
    return parsed.map((session) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null,
    }));
  } catch {
    return [];
  }
}

export function saveSession(session: WorkSession): void {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}