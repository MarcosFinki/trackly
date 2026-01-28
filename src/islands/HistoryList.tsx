import { useEffect, useState } from "react";
import type { WorkSession } from "../domain/session";
import { getSessions } from "../services/storage";

export default function HistoryList() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  if (sessions.length === 0) {
    return <p>No sessions yet.</p>;
  }

  const sorted = [...sessions].sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
  );

  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {sorted.map((session) => (
        <li
          key={session.id}
          style={{
            background: "var(--color-surface)",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          <SessionItem session={session} />
        </li>
      ))}
    </ul>
  );
}

/* ---------- Helpers ---------- */

function SessionItem({ session }: { session: WorkSession }) {
  const durationMs =
    session.endTime && session.startTime
      ? session.endTime.getTime() - session.startTime.getTime()
      : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <strong>{formatDate(session.startTime)}</strong>

      <span>
        Duration: <b>{formatDuration(durationMs)}</b>
      </span>

      <p>{session.description}</p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {session.tags.map((tag) => (
          <span
            key={tag}
            style={{
              background: "var(--color-primary)",
              color: "white",
              padding: "0.25rem 0.6rem",
              borderRadius: "999px",
              fontSize: "0.75rem",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}