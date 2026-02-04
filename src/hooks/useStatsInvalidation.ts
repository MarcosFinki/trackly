import { useState } from "react";

let invalidate = () => {};

export function useStatsInvalidation() {
  const [version, setVersion] = useState(0);

  invalidate = () => {
    setVersion(v => v + 1);
  };

  return version;
}

export function invalidateStats() {
  invalidate();
}