import { useEffect, useState } from "react";

type Listener = () => void;

let listeners: Listener[] = [];

export function useStatsInvalidation() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const listener = () => {
      setVersion(v => v + 1);
    };

    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return version;
}

export function invalidateStats() {
  listeners.forEach(l => l());
}