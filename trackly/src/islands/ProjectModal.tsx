import { useEffect, useState } from "react";
import ColorPicker from "../components/ColorPicker";
import "./ProjectModal.css";

interface Props {
  mode: "create" | "edit";
  initialName?: string;
  initialColor?: string;
  onConfirm: (name: string, color: string) => void;
  onCancel: () => void;
}

export default function ProjectModal({
  mode,
  initialName = "",
  initialColor = "#2e86ab",
  onConfirm,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();

      if (e.key === "Enter" && name.trim()) {
        onConfirm(name.trim(), color);
      }
    };

    window.addEventListener("keydown", handler);
    return () =>
      window.removeEventListener("keydown", handler);
  }, [name, color, onCancel, onConfirm]);

  return (
    <div
      className="modal-overlay overlay-in"
      onClick={onCancel}
    >
      <div
        className="modal modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>
          {mode === "create"
            ? "New project"
            : "Edit project"}
        </h3>

        <input
          autoFocus
          placeholder="Project name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <div>
          <label
            style={{
              fontSize: "0.75rem",
              opacity: 0.7,
            }}
          >
            Color
          </label>

          <ColorPicker
            value={color}
            onChange={setColor}
          />
        </div>

        <div className="modal-actions">
          <button onClick={onCancel}>
            Cancel
          </button>

          <button
            className="primary"
            disabled={!name.trim()}
            onClick={() =>
              onConfirm(name.trim(), color)
            }
          >
            {mode === "create"
              ? "Create"
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}