import "./StatsSummary.css";
import { useEffect, useState } from "react";
import { getFinishedSessions } from "../services/sessionService";
import { adaptFinishedSessionsFromApi } from "../infra/adapters/sessionAdapter";
import type { FinishedSession } from "../types/finishedSession";
import {
  getSessionsInLastDays,
  getTotalDurationMs,
} from "../domain/stats";
import TagBarChart from "./TagBarChart";
import { useActiveProject } from "../hooks/useActiveProject";
import { useStatsInvalidation } from "../hooks/useStatsInvalidation";

export default function StatsSummary() {
  const [sessions, setSessions] = useState<FinishedSession[]>([]);
  const [loading, setLoading] = useState(true);

  const { projectId } = useActiveProject();
  const statsVersion = useStatsInvalidation();

  useEffect(() => {
    setLoading(true);

    getFinishedSessions()
      .then(adaptFinishedSessionsFromApi)
      .then((all) => {
        const filtered =
          projectId == null
            ? all
            : all.filter((s) => s.projectId === projectId);

        setSessions(filtered);
      })
      .finally(() => setLoading(false));
  }, [projectId, statsVersion]);

  if (loading) return <p>Loading stats…</p>;
  if (sessions.length === 0) return <p>No data yet.</p>;

  const last7 = getSessionsInLastDays(sessions, 7);
  const last30 = getSessionsInLastDays(sessions, 30);

  return (
    <div className="stats-grid">
      <StatCard title="Last 7 days" sessions={last7} />
      <StatCard title="Last 30 days" sessions={last30} />
    </div>
  );
}

/* ---------- Card ---------- */

function StatCard({
  title,
  sessions,
}: {
  title: string;
  sessions: FinishedSession[];
}) {
  const totalMs = getTotalDurationMs(sessions);

  return (
    <section className="stat-card">
      <header className="stat-header">
        <h3>{title}</h3>
        <span className="stat-total">
          {formatTotal(totalMs)}
        </span>
      </header>

      <p className="stat-meta">
        {sessions.length} session{sessions.length !== 1 ? "s" : ""}
      </p>

      {sessions.length > 0 && (
        <TagBarChart sessions={sessions} />
      )}
    </section>
  );
}

/* ---------- Helpers ---------- */

function formatTotal(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return "1m";

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return hours > 0
    ? mins > 0
      ? `${hours}h ${mins}m`
      : `${hours}h`
    : `${mins}m`;
}