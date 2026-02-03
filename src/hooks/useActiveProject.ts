import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";

const KEY = "trackly:activeProject";

export function useActiveProject() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setProjectId(Number(raw));
  }, []);

  useEffect(() => {
    if (projectId === null) {
      setProjectName(null);
      return;
    }

    getProjects().then((projects) => {
      const p = projects.find((p) => p.id === projectId);
      setProjectName(p?.name ?? null);
    });
  }, [projectId]);

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
    projectName,
    selectProject,
  };
}