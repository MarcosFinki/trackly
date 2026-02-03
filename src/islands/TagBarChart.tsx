import type { SessionForStats } from "../domain/stats";
import { getDurationByTag } from "../domain/stats";

interface Props {
  sessions: SessionForStats[];
}

export default function TagBarChart({ sessions }: Props) {
  const byTag = getDurationByTag(sessions);

  // convertir a minutos (float, para proporción de barras)
  const entries = Object.entries(byTag).map(([tag, ms]) => {
    const minutes = ms / 60000;
    return [tag, minutes] as const;
  });

  if (entries.length === 0) {
    return <p>No data yet.</p>;
  }

  const max = Math.max(...entries.map(([, minutes]) => minutes));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {entries.map(([tag, minutes]) => {
        const percent = (minutes / max) * 100;

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
              <span>{formatHoursMinutes(minutes)}</span>
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

/* ---------- Helpers ---------- */

/**
 * SOLO horas y minutos.
 * Nunca segundos.
 * Mínimo: 1m
 */
function formatHoursMinutes(minutes: number): string {
  const totalMinutes = Math.floor(minutes);

  if (totalMinutes < 1) {
    return "1m";
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  return `${mins}m`;
}