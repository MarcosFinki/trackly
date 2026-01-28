import { useEffect, useState } from "react";
import type { WorkSession } from "../domain/session";

interface Props {
  session: WorkSession;
}

export default function SessionTimer({ session }: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (session.status !== "running") return;

    const updateElapsed = () => {
        const now = Date.now();
        const start = new Date(session.startTime).getTime();
        setElapsedMs(now - start);
    };

    updateElapsed();
    const intervalId = setInterval(updateElapsed, 1000);

    return () => clearInterval(intervalId);
    }, [session]);

    useEffect(() => {
    if (session.status === "paused" && session.endTime) {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        setElapsedMs(end - start);
    }
    }, [session]);

  return (
    <span
      style={{
        fontFamily: "monospace",
        fontSize: "1.1rem",
        color: "var(--color-text)",
      }}
    >
      {formatDuration(elapsedMs)}
    </span>
  );
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .join(":");
}