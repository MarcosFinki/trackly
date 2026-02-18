import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import StartStopButton from "./StartStopButton";
import StatsSummary from "./StatsSummary";

export default function DashboardGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  useEffect(() => {
  if (!loading && !user) {
    window.location.href = "/login";
  }
}, [loading, user]);


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