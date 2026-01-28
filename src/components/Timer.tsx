import { useEffect, useState } from "react";

type ActiveSession =
  | { active: false }
  | {
      active: true;
      sessionId: number;
      projectId: number;
      startTime: string;
      elapsedSeconds: number;
    };

export default function Timer() {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [seconds, setSeconds] = useState(0);
  const running = session?.active === true;

  // 🔁 cargar estado real al montar
  useEffect(() => {
    fetch("http://localhost:3001/sessions/active")
      .then(res => res.json())
      .then(data => {
        setSession(data);
        if (data.active) {
          setSeconds(data.elapsedSeconds);
        }
      });
  }, []);

  // ⏱️ timer visual
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [running]);

  async function start() {
    await fetch("http://localhost:3001/sessions/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: 1 })
    });

    const res = await fetch("http://localhost:3001/sessions/active");
    const data = await res.json();

    setSession(data);
    setSeconds(data.elapsedSeconds ?? 0);
  }

  async function stop() {
    await fetch("http://localhost:3001/sessions/stop", {
      method: "POST"
    });

    setSession({ active: false });
    setSeconds(0);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>⏱️ {format(seconds)}</h2>

      {!running ? (
        <button onClick={start}>Start</button>
      ) : (
        <button onClick={stop}>Stop</button>
      )}
    </div>
  );
}

function format(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return `${h}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}