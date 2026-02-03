import { useEffect, useState } from "react";
import { useSession } from "../hooks/useSession";
import SessionTimer from "./SessionTimer";
import SessionModal from "./SessionModal";
import { useActiveProject } from "../hooks/useActiveProject";
import "./StartStopButton.css";

export default function StartStopButton() {
  const {
    session,
    loading,
    start,
    stop,
    cancel,
    finalize,
  } = useSession();

  const { projectId, projectName } = useActiveProject();
  const [feedback, setFeedback] = useState<"start" | "stop" | null>(null);

  const isRunning = session?.status === "running";
  const isStopping = session?.status === "stopping";

  // ✅ Hooks SIEMPRE arriba, sin returns antes
  useEffect(() => {
    if (session?.status === "running") {
      setFeedback("start");
    }

    if (session?.status === "stopping") {
      setFeedback("stop");
    }

    if (!session) {
      setFeedback(null);
    }
  }, [session?.status]);

  useEffect(() => {
    if (!feedback) return;

    const id = setTimeout(() => {
      setFeedback(null);
    }, 280);

    return () => clearTimeout(id);
  }, [feedback]);

  const handleClick = () => {
    if (isRunning) stop();
    else start(projectId ?? undefined);
  };

  // ✅ Ahora sí, return condicional
  if (loading) return null;

  return (
    <>
      <div className="session-center">
        <span className="active-project">
          {projectName ?? "Global"}
        </span>

        <div
          className={[
            "session-button-wrapper",
            isRunning && "running",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            onClick={handleClick}
            disabled={isStopping}
            className={[
              "session-button",
              isRunning && "running",
              isStopping && "stopping",
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

          {/* ❌ cancelar sin guardar */}
          {isRunning && (
            <button
              className="cancel-session-btn"
              onClick={cancel}
              title="Cancel session (won’t be saved)"
              aria-label="Cancel session without saving"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {session && isStopping && (
        <SessionModal
          onConfirm={finalize}
          onCancel={cancel}
        />
      )}
    </>
  );
}