import { useEffect, useState } from "react";
import type { WorkSession } from "../domain/session";
import { getSessions } from "../services/storage";
import {
  getFinishedSessions,
  getSessionsInLastDays,
  getTotalDurationMs,
} from "../domain/stats";
import TagBarChart from "./TagBarChart";

export default function StatsSummary() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);

  useEffect(() => {
    const data = getSessions();
    setSessions(data);
    console.log("All sessions (raw):", data);
  }, []);

  const finished = getFinishedSessions(sessions);
  const last7 = getSessionsInLastDays(finished, 7);
  const last30 = getSessionsInLastDays(finished, 30);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
  sessions: WorkSession[];
}) {
  const totalMs = getTotalDurationMs(sessions);

  return (
    <section
      style={{
        background: "var(--color-surface)",
        padding: "1.25rem",
        borderRadius: "12px",
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      }}
    >
      <h2>{title}</h2>

      <p>
        Total time: <b>{formatDuration(totalMs)}</b>
      </p>

      {sessions.length > 0 && (
        <>
          <h4 style={{ marginTop: "1rem" }}>By tag</h4>
          <TagBarChart sessions={sessions} />
        </>
      )}
    </section>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}