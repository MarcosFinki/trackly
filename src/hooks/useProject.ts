import { useEffect, useState } from "react";
import { getProjects, type Project } from "../services/projectService";

export function useProject(projectId: number | null) {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (projectId === null) {
        if (mounted) setProject(null);
        return;
      }

      try {
        const projects = await getProjects();
        const found = projects.find((p) => p.id === projectId);

        if (mounted) {
          setProject(found ?? null);
        }
      } catch {
        if (mounted) {
          setProject(null);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  return project;
}