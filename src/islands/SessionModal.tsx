import { useEffect, useState } from "react";

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

  useEffect(() => {
    setDescription("");
    setSelectedTags([]);
  }, []);

  // ESC to close
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
    if (!canConfirm) return;
    onConfirm(description.trim(), selectedTags);
  };

  const handleCancel = () => {
    setClosing(true);
  };

  const handleAnimationEnd = () => {
    if (closing) onCancel();
  };

  return (
    <div
      style={overlayStyle}
      onClick={handleCancel}
      className={closing ? "overlay-out" : "overlay-in"}
    >
      <form
        style={modalStyle}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
        className={closing ? "modal-out" : "modal-in"}
      >
        <h2>End session</h2>

        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
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
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {AVAILABLE_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    ...tagStyle,
                    backgroundColor: active
                      ? "var(--color-primary)"
                      : "transparent",
                    color: active ? "white" : "var(--color-text)",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div style={actionsStyle}>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
          <button type="submit" disabled={!canConfirm}>
            Save session
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Styles ---------- */

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg)",
  padding: "1.5rem",
  borderRadius: "14px",
  width: "100%",
  maxWidth: "420px",
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
};

const tagStyle: React.CSSProperties = {
  padding: "0.4rem 0.75rem",
  borderRadius: "999px",
  border: "1px solid var(--color-primary)",
  cursor: "pointer",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "1rem",
};