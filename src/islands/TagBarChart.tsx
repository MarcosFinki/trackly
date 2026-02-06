import { useState } from "react";
import type { SessionForStats } from "../domain/stats";
import { getDurationByTag } from "../domain/stats";
import AllTagsModal from "../components/AllTagsModal";
import "./TagBarChart.css";

interface Props {
  sessions: SessionForStats[];
}

export default function TagBarChart({ sessions }: Props) {
  const [showAll, setShowAll] = useState(false);

  const byTag = getDurationByTag(sessions);

  const entries = Object.entries(byTag)
    .map(([tag, ms]) => ({
      tag,
      minutes: ms / 60000,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  if (entries.length === 0) {
    return <p className="tag-empty">No tags</p>;
  }

  const max = entries[0].minutes;
  const visible = entries.slice(0, 3);

  return (
    <>
      <div className="tag-bars">
        {visible.map(({ tag, minutes }) => {
          const percent = (minutes / max) * 100;

          return (
            <div key={tag} className="tag-row">
              <div className="tag-row-header">
                <span className="tag-name">{tag}</span>
                <span className="tag-time">
                  {formatHoursMinutes(minutes)}
                </span>
              </div>

              <div className="tag-bar-bg">
                <div
                  className="tag-bar-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {entries.length > 3 && (
        <button
          className="view-all-tags"
          onClick={() => setShowAll(true)}
        >
          View all tags
        </button>
      )}

      {showAll && (
        <AllTagsModal
          entries={entries}
          onClose={() => setShowAll(false)}
        />
      )}
    </>
  );
}

/* ---------- Helpers ---------- */

function formatHoursMinutes(minutes: number): string {
  const total = Math.floor(minutes);
  if (total < 1) return "1m";

  const h = Math.floor(total / 60);
  const m = total % 60;

  return h > 0 ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}