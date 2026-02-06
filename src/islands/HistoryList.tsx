import { useEffect, useState } from "react";
import { getFinishedSessions } from "../services/sessionService";
import { adaptFinishedSessionsFromApi } from "../infra/adapters/sessionAdapter";
import type { FinishedSession } from "../types/finishedSession";
import "./HistoryList.css";

export default function HistoryList() {
  const [sessions, setSessions] = useState<FinishedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinishedSessions()
      .then(adaptFinishedSessionsFromApi)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading history…</p>;
  if (sessions.length === 0) return <p>No sessions yet.</p>;

  return (
    <ul className="history-list">
      {sessions.map((s) => (
        <li key={s.id} className="history-item">
          <strong>{s.description || "No description"}</strong>

          <div className="history-meta">
            {formatDate(s.startTime)} · {formatDuration(s)}
          </div>

          <div className="history-tags">
            {s.tags.map((tag) => (
              <span key={tag} className="history-tag">
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