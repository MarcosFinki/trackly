import { invoke } from "@tauri-apps/api/core";

export type SessionStatus =
  | "running"
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

export interface FinishedSession {
  id: number;
  projectId: number | null;
  startTime: string;
  endTime: string;
  description: string | null;
  tags: string[];
}

/* =========================
   ACTIVE
========================= */

export async function getActiveSession(): Promise<ActiveSession | null> {
  try {
    return await invoke<ActiveSession | null>("get_active_session");
  } catch {
    throw new Error("FAILED_TO_LOAD_ACTIVE_SESSION");
  }
}

/* =========================
   START
========================= */

export async function startSession(
  projectId?: number
): Promise<void> {
  try {
    await invoke("start_session", { projectId });
  } catch {
    throw new Error("FAILED_TO_START_SESSION");
  }
}

/* =========================
   FINALIZE
========================= */

export async function finalizeSession(
  sessionId: number,
  description: string,
  tags: string[]
): Promise<void> {
  try {
    await invoke("finalize_session", {
      input: { sessionId, description, tags },
    });
  } catch {
    throw new Error("FAILED_TO_FINALIZE_SESSION");
  }
}

/* =========================
   CANCEL
========================= */

export async function cancelSession(): Promise<void> {
  try {
    await invoke("cancel_session");
  } catch {
    throw new Error("FAILED_TO_CANCEL_SESSION");
  }
}

/* =========================
   FINISHED
========================= */

export async function getFinishedSessions(): Promise<FinishedSession[]> {
  try {
    return await invoke<FinishedSession[]>("get_finished_sessions");
  } catch {
    throw new Error("FAILED_TO_LOAD_FINISHED_SESSIONS");
  }
}