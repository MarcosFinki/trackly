export type SessionStatus = "idle" | "running" | "paused" | "finished";

export interface WorkSession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  description: string | null;
  tags: string[];
  status: SessionStatus;
}

export function startSession(): WorkSession {
  return {
    id: crypto.randomUUID(),
    startTime: new Date(),
    endTime: null,
    description: null,
    tags: [],
    status: "running",
  };
}

export function finalizeSession(
  session: WorkSession,
  description: string,
  tags: string[]
): WorkSession {
  if (session.status !== "paused" || !session.endTime) {
    throw new Error("Session must be paused before finalizing");
  }

  return {
    ...session,
    description,
    tags,
    status: "finished",
  };
}

export function getSessionDurationMs(session: WorkSession): number {
  if (!session.endTime) return 0;
  return session.endTime.getTime() - session.startTime.getTime();
}

export function pauseSession(session: WorkSession): WorkSession {
  if (session.status !== "running") {
    throw new Error("Cannot pause a session that is not running");
  }

  return {
    ...session,
    endTime: new Date(),
    status: "paused",
  };
}

export function resumeSession(session: WorkSession): WorkSession {
  if (session.status !== "paused" || !session.endTime) {
    throw new Error("Cannot resume a session that is not paused");
  }

  const pausedDuration =
    new Date().getTime() - session.endTime.getTime();

  return {
    ...session,
    startTime: new Date(
      session.startTime.getTime() + pausedDuration
    ),
    endTime: null,
    status: "running",
  };
}