import { useState } from "react";

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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const canConfirm =
    description.trim().length > 0 && selectedTags.length > 0;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>End session</h2>

        <label>
          What did you work on?
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: "100%" }}
          />
        </label>

        <div>
          <p>Tags</p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {AVAILABLE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "0.4rem 0.75rem",
                  borderRadius: "999px",
                  border: "1px solid var(--color-primary)",
                  backgroundColor: selectedTags.includes(tag)
                    ? "var(--color-primary)"
                    : "transparent",
                  color: selectedTags.includes(tag)
                    ? "white"
                    : "var(--color-text)",
                  cursor: "pointer",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={() => onConfirm(description, selectedTags)} disabled={!canConfirm}>
            Save session
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg)",
  padding: "1.5rem",
  borderRadius: "8px",
  width: "100%",
  maxWidth: "420px",
};