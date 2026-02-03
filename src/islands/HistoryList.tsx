import { useEffect, useState } from "react";
import { getFinishedSessions } from "../services/sessionService";
import { adaptFinishedSessions } from "../services/sessionAdapter";
import type { FinishedSession } from "../types/finishedSession";

export default function HistoryList() {
  const [sessions, setSessions] = useState<FinishedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinishedSessions()
      .then(adaptFinishedSessions)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading history…</p>;
  if (sessions.length === 0) return <p>No sessions yet.</p>;

  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {sessions.map((s) => (
        <li
          key={s.id}
          style={{
            background: "var(--color-surface)",
            padding: "1rem",
            borderRadius: "10px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
          }}
        >
          <strong>{s.description || "No description"}</strong>

          <div style={{ fontSize: "0.85rem", opacity: 0.7 }}>
            {formatDate(s.startTime)} · {formatDuration(s)}
          </div>

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {s.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "var(--color-primary)",
                  color: "white",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "999px",
                  fontSize: "0.75rem",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatDuration(s: FinishedSession) {
  const ms = s.endTime.getTime() - s.startTime.getTime();
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}