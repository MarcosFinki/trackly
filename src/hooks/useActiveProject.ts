import { useEffect, useState } from "react";

const KEY = "trackly:activeProject";

export function useActiveProject() {
  const [projectId, setProjectId] = useState<number | null>(null);

  // load from storage
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setProjectId(Number(raw));
  }, []);

  const selectProject = (id: number | null) => {
    setProjectId(id);

    if (id === null) {
      localStorage.removeItem(KEY);
    } else {
      localStorage.setItem(KEY, String(id));
    }

    window.dispatchEvent(
      new CustomEvent("trackly:project-change", {
        detail: { projectId: id },
      })
    );
  };

  // sync from external changes
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ projectId: number | null }>;
      setProjectId(custom.detail.projectId);
    };

    window.addEventListener("trackly:project-change", handler);
    return () =>
      window.removeEventListener("trackly:project-change", handler);
  }, []);

  return {
    projectId,
    selectProject,
  };
}