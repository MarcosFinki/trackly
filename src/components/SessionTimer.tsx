import { useEffect, useState } from "react";
import type { ActiveSession } from "../services/sessionService";
import "./SessionTimer.css";

interface Props {
  session: ActiveSession;
}

export default function SessionTimer({ session }: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const updateElapsed = () => {
      const now = Date.now();
      const start = new Date(session.startTime).getTime();
      setElapsedMs(now - start);
    };

    updateElapsed();
    const intervalId = setInterval(updateElapsed, 1000);

    return () => clearInterval(intervalId);
  }, [session.startTime]);

  return (
    <span className="session-timer">
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