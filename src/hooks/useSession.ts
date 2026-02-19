import { useEffect, useState, useCallback } from "react";
import {
  getActiveSession,
  startSession,
  finalizeSession,
  cancelSession,
} from "../services/sessionService";

import {
  adaptActiveSessionFromApi,
} from "../infra/adapters/sessionAdapter";

import type { ActiveSession } from "../types/session";

import { invalidateStats } from "./useStatsInvalidation";

export function useSession() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStopping, setIsStopping] = useState(false);

  /* =========================
     REFRESH (DTO → DOMAIN)
  ========================== */

  const refresh = useCallback(async () => {
    try {
      const dto = await getActiveSession();

      if (!dto) {
        setSession(null);
        return;
      }

      const adapted = adaptActiveSessionFromApi(dto);
      setSession(adapted);
    } catch (err) {
      console.error("[SESSION_REFRESH_ERROR]", err);
      setSession(null);
    }
  }, []);

  /* =========================
     INITIAL LOAD
  ========================== */

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  /* =========================
     START
  ========================== */

  const start = async (projectId?: number) => {
    try {
      await startSession(projectId);
      await refresh();
    } catch (err) {
      console.error("[SESSION_START_ERROR]", err);
    }
  };

  /* =========================
     STOP (UI ONLY)
  ========================== */

  const stop = () => {
    setIsStopping(true);
  };

  const cancelStop = () => {
    setIsStopping(false);
  };

  /* =========================
     FINALIZE
  ========================== */

  const confirmFinalize = async (
    description: string,
    tags: string[]
  ) => {
    if (!session) return;

    try {
      await finalizeSession(session.id, description, tags);

      setSession(null);
      setIsStopping(false);

      invalidateStats();
    } catch (err) {
      console.error("[SESSION_FINALIZE_ERROR]", err);
    }
  };

  /* =========================
     CANCEL
  ========================== */

  const cancel = async () => {
    if (!session) return;

    try {
      await cancelSession();

      setSession(null);
      setIsStopping(false);
    } catch (err) {
      console.error("[SESSION_CANCEL_ERROR]", err);
    }
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