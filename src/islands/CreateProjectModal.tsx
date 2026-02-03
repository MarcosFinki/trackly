import { useEffect, useState } from "react";
import "./CreateProjectModal.css";

interface Props {
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function CreateProjectModal({ onConfirm, onCancel }: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && name.trim()) {
        onConfirm(name.trim());
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [name, onCancel, onConfirm]);

  return (
    <div
      className="modal-overlay overlay-in"
      onClick={onCancel}              // 👈 click fuera cierra
    >
      <div
        className="modal modal-in"
        onClick={(e) => e.stopPropagation()} // 👈 click dentro NO cierra
      >
        <h3>New project</h3>

        <input
          autoFocus
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onCancel}>Cancel</button>
          <button
            className="primary"
            disabled={!name.trim()}
            onClick={() => onConfirm(name.trim())}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}