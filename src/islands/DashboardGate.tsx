import { useEffect, useState } from "react";
import StartStopButton from "./StartStopButton";
import StatsSummary from "./StatsSummary";

const API_URL = import.meta.env.PUBLIC_API_URL;

export default function DashboardGate() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_URL}/sessions/active`, {
          credentials: "include",
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        setAuthorized(true);
      } catch {
        window.location.href = "/login";
      }
    };

    checkSession();
  }, []);

  if (authorized === null) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="center">
        <StartStopButton />
      </div>

      <div className="stats">
        <StatsSummary />
      </div>
    </div>
  );
}