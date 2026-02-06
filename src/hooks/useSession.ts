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

  // 🔹 UI only
  const [isStopping, setIsStopping] = useState(false);

  const refresh = async () => {
    const fresh = await getActiveSession();
    setSession(fresh);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  // ▶️ START (backend)
  const start = async (projectId?: number) => {
    await startSession(projectId);
    await refresh();
  };

  // ⏸️ STOP (solo UI)
  const stop = () => {
    setIsStopping(true);
  };

  // ❌ Cancelar modal → seguir sesión
  const cancelStop = () => {
    setIsStopping(false);
  };

  // ✅ Guardar sesión
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

  // ❌ Cancelar sesión sin guardar (backend)
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