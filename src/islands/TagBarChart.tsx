import type { WorkSession } from "../domain/session";
import { getDurationByTag } from "../domain/stats";

interface Props {
  sessions: WorkSession[];
}

export default function TagBarChart({ sessions }: Props) {
  const byTag = getDurationByTag(sessions);

  const entries = Object.entries(byTag);
  if (entries.length === 0) {
    return <p>No data yet.</p>;
  }

  const max = Math.max(...entries.map(([, ms]) => ms));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {entries.map(([tag, ms]) => {
        const percent = (ms / max) * 100;

        return (
          <div key={tag}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.25rem",
                fontSize: "0.85rem",
              }}
            >
              <span>{tag}</span>
              <span>{formatDuration(ms)}</span>
            </div>

            <div
              style={{
                height: "10px",
                background: "rgba(0,0,0,0.08)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${percent}%`,
                  height: "100%",
                  background: "var(--color-primary)",
                  borderRadius: "999px",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}