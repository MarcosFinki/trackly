import "./StatsSummary.css";
import { useEffect, useState } from "react";
import { getFinishedSessions } from "../services/sessionService";
import { adaptFinishedSessions } from "../services/sessionAdapter";
import type { FinishedSession } from "../types/finishedSession";
import {
  getSessionsInLastDays,
  getTotalDurationMs,
  getDurationByTag,
} from "../domain/stats";
import TagBarChart from "./TagBarChart";


export default function StatsSummary() {
  const [sessions, setSessions] = useState<FinishedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinishedSessions()
      .then(adaptFinishedSessions)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading stats…</p>;
  if (sessions.length === 0) return <p>No data yet.</p>;

  const last7 = getSessionsInLastDays(sessions, 7);
  const last30 = getSessionsInLastDays(sessions, 30);

  return (
    <div className="stats-grid">
      <StatBlock title="Last 7 days" sessions={last7} />
      <StatBlock title="Last 30 days" sessions={last30} />
    </div>
  );
}

function StatBlock({
  title,
  sessions,
}: {
  title: string;
  sessions: FinishedSession[];
}) {
  const totalMs = getTotalDurationMs(sessions);

  return (
    <section className="stat-card"
    >
      <h3>{title}</h3>
      <p>
        Total time: <b>{formatTotal(totalMs)}</b>
      </p>

      {sessions.length > 0 && (
        <TagBarChart sessions={sessions} />
      )}
    </section>
  );
}

function formatTotal(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);

  if (totalMinutes < 1) return "1m";

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return `${mins}m`;
}