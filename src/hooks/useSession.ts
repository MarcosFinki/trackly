import { useEffect, useState } from "react";
import {
  getActiveSession,
  startSession,
  stopSession,
  cancelSession,
  finalizeSession,
  type ActiveSession,
} from "../services/sessionService";

export function useSession() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveSession()
      .then(setSession)
      .finally(() => setLoading(false));
  }, []);

  const start = async (projectId?: number) => {
    await startSession(projectId);
    const fresh = await getActiveSession();
    setSession(fresh);
  };

  const stop = async () => {
    await stopSession();
    const fresh = await getActiveSession();
    setSession(fresh);
  };

  const cancel = async () => {
    try {
      await cancelSession();
    } finally {
      setSession(null);
    }
  };

  const finalize = async (
    description: string,
    tags: string[]
  ) => {
    if (!session) return;

    await finalizeSession(session.id, description, tags);
    setSession(null);
  };

  return {
    session,
    loading,
    start,
    stop,
    cancel,
    finalize,
  };
}