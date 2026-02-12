import { useEffect, useState } from "react";

const KEY = "trackly:activeProject";
const DEFAULT_COLOR = "#2e86ab";

interface StoredProject {
  id: number;
  color: string;
}

function applyTheme(color: string | null) {
  const root = document.documentElement;

  if (!color) {
    root.style.setProperty(
      "--color-primary",
      DEFAULT_COLOR
    );
    return;
  }

  root.style.setProperty(
    "--color-primary",
    color
  );
}

export function useActiveProject() {
  const [project, setProject] =
    useState<StoredProject | null>(null);

  // 🔁 Load from storage
  useEffect(() => {
    const raw = localStorage.getItem(KEY);

    if (!raw) {
      applyTheme(null);
      return;
    }

    try {
      const parsed: StoredProject =
        JSON.parse(raw);

      setProject(parsed);
      applyTheme(parsed.color);
    } catch {
      applyTheme(null);
    }
  }, []);

  const selectProject = (
    id: number | null,
    color?: string
  ) => {
    if (id === null) {
      setProject(null);
      localStorage.removeItem(KEY);
      applyTheme(null);
    } else {
      if (!color) return;

      const data: StoredProject = {
        id,
        color,
      };

      setProject(data);

      localStorage.setItem(
        KEY,
        JSON.stringify(data)
      );

      applyTheme(color);
    }

    window.dispatchEvent(
      new CustomEvent("trackly:project-change", {
        detail: { projectId: id },
      })
    );
  };

  // 🔁 Sync external changes
  useEffect(() => {
    const handler = (e: Event) => {
      const custom =
        e as CustomEvent<{ projectId: number | null }>;

      if (custom.detail.projectId === null) {
        setProject(null);
        applyTheme(null);
        return;
      }

      // ⚠ Si cambian proyecto desde otro lugar
      // pero no tenemos color, no podemos aplicar theme.
      // En tu app no debería pasar.
    };

    window.addEventListener(
      "trackly:project-change",
      handler
    );

    return () =>
      window.removeEventListener(
        "trackly:project-change",
        handler
      );
  }, []);

  return {
    projectId: project?.id ?? null,
    selectProject,
  };
}