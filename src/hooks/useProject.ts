// hooks/useProject.ts
import { getProjects } from "../services/projectService";
import { useEffect, useState } from "react";

export function useProject(projectId: number | null) {
  const [project, setProject] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (projectId === null) {
      setProject(null);
      return;
    }

    getProjects().then((projects) => {
      const p = projects.find((p) => p.id === projectId);
      setProject(p ?? null);
    });
  }, [projectId]);

  return project;
}