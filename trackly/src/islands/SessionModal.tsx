import { useEffect, useState } from "react";
import "./SessionModal.css";

interface Props {
  onConfirm: (description: string, tags: string[]) => void;
  onCancel: () => void;
}

const AVAILABLE_TAGS = [
  "planning",
  "frontend",
  "backend",
  "debugging",
  "deploy",
];

export default function SessionModal({ onConfirm, onCancel }: Props) {


  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [closing, setClosing] = useState(false);

  /* ---------- reset al montar ---------- */
  useEffect(() => {
    setDescription("");
    setSelectedTags([]);
    setClosing(false);
  }, []);

  /* ---------- ESC para cerrar ---------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const canConfirm =
    description.trim().length > 0 && selectedTags.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canConfirm || closing) return;
    onConfirm(description.trim(), selectedTags);
  };

  const handleCancel = () => {
    if (closing) return; // 🔒 evita doble ejecución
    setClosing(true);
  };

  const handleAnimationEnd = () => {
    if (closing) onCancel();
  };


  return (

    
    <div
      className={`session-overlay ${
        closing ? "overlay-out" : "overlay-in"
      }`}
      onClick={handleCancel}
    >
      
      <div
        className={`session-modal ${
          closing ? "modal-out" : "modal-in"
        }`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        <h2>End session</h2>

        <label className="session-field">
          <span>What did you work on?</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            autoFocus
          />
        </label>

        <div>
          <p>Tags</p>
          <div className="session-tags">
            {AVAILABLE_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`session-tag ${active ? "active" : ""}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div className="session-actions">
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm || closing) return;
              onConfirm(description.trim(), selectedTags);
            }}
          >
            Save session
          </button>
        </div>
      </div>
    </div>
  );
}