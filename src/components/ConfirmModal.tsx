import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./ConfirmModal.css";

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: Props) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleClose = () => {
    setClosing(true);
  };

  const handleAnimationEnd = () => {
    if (closing) onCancel();
  };

  return ReactDOM.createPortal(
    <div
      className={`confirm-overlay ${
        closing ? "overlay-out" : "overlay-in"
      }`}
      onClick={handleClose}
    >
      <div
        className={`confirm-modal ${
          closing ? "modal-out" : "modal-in"
        }`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        <h3>{title}</h3>

        <p>{message}</p>

        <div className="confirm-actions">
          <button onClick={handleClose}>
            {cancelLabel}
          </button>

          <button
            className="danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}