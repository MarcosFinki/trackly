import { useState } from "react";
import {
  type WorkSession,
  pauseSession,
  resumeSession,
  startSession,
  finalizeSession,
} from "../domain/session";
import SessionTimer from "./SessionTimer";
import SessionModal from "./SessionModal";
import { saveSession } from "../services/storage";

export default function StartStopButton() {
  const [session, setSession] = useState<WorkSession | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleStart = () => {
    setSession(startSession());
  };


  const handleStopClick = () => {
    if (!session) return;

    const paused = pauseSession(session); // endTime fijo acá
    setSession(paused);
    setShowModal(true);
  };

  const handleConfirm = (description: string, tags: string[]) => {
    if (!session) return;

    const finished = finalizeSession(session, description, tags);
    saveSession(finished);

    setSession(null);
    setShowModal(false);
  };

  const handleCancel = () => {
    if (!session) return;

    const resumed = resumeSession(session);
    setSession(resumed);
    setShowModal(false);
  };

  return (
    <>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          onClick={session ? handleStopClick : handleStart}
          style={{
                backgroundColor: "var(--color-primary)",
                color: "white",
                padding: "2.5rem 3.5rem",
                borderRadius: "999px",
                border: "none",
                fontSize: "1.25rem",
                fontWeight: 600,
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                cursor: "pointer",
              }}
        >
          {session ? "Stop session" : "Start session"}
        </button>

        {session && (
          <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
            <SessionTimer session={session} />
          </div>
        )}
      </div>

      {showModal && (
        <SessionModal
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}