import "./AllTagsModal.css";

interface Entry {
  tag: string;
  minutes: number;
}

interface Props {
  entries: Entry[];
  onClose: () => void;
}

export default function AllTagsModal({ entries, onClose }: Props) {
  const max = Math.max(...entries.map(e => e.minutes));

  return (
    <div className="modal-overlay overlay-in">
      <div className="modal modal-in">
        <header className="modal-header">
          <h3>All tags</h3>
          <button onClick={onClose}>✕</button>
        </header>

        <div className="all-tags-list">
          {entries.map(({ tag, minutes }) => {
            const percent = (minutes / max) * 100;

            return (
              <div key={tag} className="tag-row">
                <div className="tag-row-header">
                  <span>{tag}</span>
                  <span>{format(minutes)}</span>
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
      </div>
    </div>
  );
}

function format(minutes: number): string {
  const total = Math.floor(minutes);
  if (total < 1) return "1m";

  const h = Math.floor(total / 60);
  const m = total % 60;

  return h > 0 ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}