import { invoke } from "@tauri-apps/api/core";
import type {
  ActiveSessionDTO,
  FinishedSessionDTO,
} from "../types/session.dto";

/* =========================
   ACTIVE (DTO)
========================= */

export async function getActiveSession(): Promise<ActiveSessionDTO | null> {
  try {
    return await invoke<ActiveSessionDTO | null>("get_active_session");
  } catch {
    return null;
  }
}

/* =========================
   START
========================= */

export async function startSession(
  projectId?: number
): Promise<void> {
  await invoke("start_session", {
    project_id: projectId ?? null,
  });
}

/* =========================
   FINALIZE
========================= */

export async function finalizeSession(
  sessionId: number,
  description: string,
  tags: string[]
): Promise<void> {
  await invoke("finalize_session", {
    session_id: sessionId,
    description,
    tags,
  });
}

/* =========================
   CANCEL
========================= */

export async function cancelSession(): Promise<void> {
  await invoke("cancel_session");
}

/* =========================
   FINISHED (DTO)
========================= */

export async function getFinishedSessions(): Promise<FinishedSessionDTO[]> {
  return await invoke<FinishedSessionDTO[]>("get_finished_sessions");
}