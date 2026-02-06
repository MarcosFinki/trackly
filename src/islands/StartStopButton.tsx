import { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import SessionTimer from "../components/SessionTimer";
import SessionModal from "./SessionModal";
import { useActiveProject } from "../hooks/useActiveProject";
import { useProject } from "../hooks/useProject";
import "./StartStopButton.css";

export default function StartStopButton() {
  const {
    session,
    loading,
    isStopping,
    start,
    stop,
    cancel,
    cancelStop,
    confirmFinalize,
  } = useSession();

  const { projectId } = useActiveProject();
  const project = useProject(projectId);

  const isRunning = !!session;

  const [feedback, setFeedback] =
    useState<"start" | "stop" | null>(null);

  useEffect(() => {
    if (isRunning) setFeedback("start");
    if (isStopping) setFeedback("stop");
    if (!session) setFeedback(null);
  }, [isRunning, isStopping, session]);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 280);
    return () => clearTimeout(id);
  }, [feedback]);

  const handleClick = () => {
    if (isRunning) {
      stop(); // solo UI
    } else {
      start(projectId ?? undefined);
    }
  };

  if (loading) return null;

  return (
    <>
      <div className="session-center">
        <span className="active-project">
          {project ? project.name : "Global"}
        </span>

        <div className={`session-button-wrapper ${isRunning ? "running" : ""}`}>
          <button
            onClick={handleClick}
            disabled={isStopping}
            className={[
              "session-button",
              isRunning && "running",
              feedback === "start" && "feedback-start",
              feedback === "stop" && "feedback-stop",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {isRunning ? (
              <div className="session-button-content">
                <SessionTimer session={session} />
                <span className="stop-label">Stop session</span>
              </div>
            ) : (
              "Start session"
            )}
          </button>

          {isRunning && (
            <button
              className="cancel-session-btn"
              onClick={cancel}
              title="Cancel session (won’t be saved)"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {session && isStopping && (
        <SessionModal
          onConfirm={confirmFinalize}
          onCancel={cancelStop}
        />
      )}
    </>
  );
}