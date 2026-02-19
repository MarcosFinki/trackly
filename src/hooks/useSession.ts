// hooks/useSession.ts
import { useEffect, useState } from "react";
import {
  getActiveSession,
  startSession,
  finalizeSession,
  cancelSession,
  type ActiveSession,
} from "../services/sessionService";
import { invalidateStats } from "./useStatsInvalidation";

export function useSession() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStopping, setIsStopping] = useState(false);

  const refresh = async () => {
    try {
      const fresh = await getActiveSession();
      setSession(fresh);
    } catch (err) {
      console.error("Active session error:", err);
      setSession(null);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const start = async (projectId?: number) => {
    await startSession(projectId);
    await refresh();
  };

  const stop = () => {
    setIsStopping(true);
  };

  const cancelStop = () => {
    setIsStopping(false);
  };

  const confirmFinalize = async (
    description: string,
    tags: string[]
  ) => {
    if (!session) return;

    await finalizeSession(session.id, description, tags);
    setSession(null);
    setIsStopping(false);
    invalidateStats();
  };

  const cancel = async () => {
    if (!session) return;

    await cancelSession();
    setSession(null);
    setIsStopping(false);
  };

  return {
    session,
    loading,
    isStopping,
    start,
    stop,
    cancel,
    cancelStop,
    confirmFinalize,
  };
}