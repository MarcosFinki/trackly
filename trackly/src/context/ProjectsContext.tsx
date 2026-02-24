import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getProjects,
  createProject as apiCreate,
  updateProject as apiUpdate,
  deleteProject as apiDelete
} from "../services/projectService";
import type { Project } from "../types/project";

const ACTIVE_KEY = "trackly:activeProjectId";
const DEFAULT_COLOR = "#2e86ab";

interface ProjectsContextType {
  projects: Project[];
  activeProject: Project | null;
  activeProjectId: number | null;
  selectProject: (id: number | null) => void;
  createProject: (name: string, color: string) => Promise<void>;
  updateProject: (
    id: number,
    data: { name: string; color: string }
  ) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  reload: () => Promise<void>;
}

const ProjectsContext = createContext<
  ProjectsContextType | undefined
>(undefined);

function applyTheme(color: string | null) {
  document.documentElement.style.setProperty(
    "--color-primary",
    color ?? DEFAULT_COLOR
  );
}

export function ProjectsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] =
    useState<number | null>(null);

  /* ===========================
     INITIAL LOAD
  =========================== */

  useEffect(() => {
    const load = async () => {
      const data = await getProjects();
      setProjects(data);

      const saved = localStorage.getItem(ACTIVE_KEY);
      if (saved) {
        const id = Number(saved);
        setActiveProjectId(id);
      }
    };

    load();
  }, []);

  /* ===========================
     ACTIVE PROJECT
  =========================== */

  const activeProject =
    projects.find((p) => p.id === activeProjectId) ??
    null;

  useEffect(() => {
    if (activeProject) {
      applyTheme(activeProject.color);
      localStorage.setItem(
        ACTIVE_KEY,
        String(activeProject.id)
      );
    } else {
      applyTheme(null);
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeProject]);

  const selectProject = (id: number | null) => {
    setActiveProjectId(id);
  };

  /* ===========================
     CRUD
  =========================== */

  const reload = async () => {
    const data = await getProjects();
    setProjects(data);
  };

  const createProject = async (
    name: string,
    color: string
  ) => {
    const project = await apiCreate(name, color);
    await reload();
    setActiveProjectId(project.id);
  };

  const updateProject = async (
    id: number,
    data: { name: string; color: string }
  ) => {
    await apiUpdate(id, data);
    await reload();
  };

  const deleteProject = async (id: number) => {
    await apiDelete(id);
    await reload();

    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        activeProject,
        activeProjectId,
        selectProject,
        createProject,
        updateProject,
        deleteProject,
        reload,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error(
      "useProjects must be used inside ProjectsProvider"
    );
  }
  return ctx;
}