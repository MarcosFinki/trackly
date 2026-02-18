import { useEffect, useState } from "react";

const KEY = "trackly:activeProject";
const DEFAULT_COLOR = "#2e86ab";

interface StoredProject {
  id: number;
  color: string;
}

function applyTheme(color: string | null) {
  const root = document.documentElement;

  root.style.setProperty(
    "--color-primary",
    color ?? DEFAULT_COLOR
  );
}

export function useActiveProject() {
  const [project, setProject] = useState<StoredProject | null>(null);

  /* ===========================
     LOAD INITIAL STATE
  =========================== */

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);

      if (!raw) {
        applyTheme(null);
        return;
      }

      const parsed: StoredProject = JSON.parse(raw);

      if (
        typeof parsed.id === "number" &&
        typeof parsed.color === "string"
      ) {
        setProject(parsed);
        applyTheme(parsed.color);
      } else {
        localStorage.removeItem(KEY);
        applyTheme(null);
      }
    } catch {
      localStorage.removeItem(KEY);
      applyTheme(null);
    }
  }, []);

  /* ===========================
     SELECT PROJECT
  =========================== */

  const selectProject = (id: number | null, color?: string) => {
    if (id === null) {
      setProject(null);
      localStorage.removeItem(KEY);
      applyTheme(null);
    } else {
      if (!color) {
        console.warn("Project color missing");
        return;
      }

      const data: StoredProject = { id, color };

      setProject(data);
      localStorage.setItem(KEY, JSON.stringify(data));
      applyTheme(color);
    }

    window.dispatchEvent(
      new CustomEvent("trackly:project-change", {
        detail: { projectId: id },
      })
    );
  };

  /* ===========================
     EXTERNAL SYNC
  =========================== */

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<{ projectId: number | null }>;

      if (custom.detail.projectId === null) {
        setProject(null);
        applyTheme(null);
      }
    };

    window.addEventListener("trackly:project-change", handler);

    return () =>
      window.removeEventListener("trackly:project-change", handler);
  }, []);

  return {
    projectId: project?.id ?? null,
    selectProject,
  };
}