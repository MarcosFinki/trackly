import { useEffect, useState } from "react";
import { getProjects, createProject } from "../services/projectService";
import { useActiveProject } from "../hooks/useActiveProject";
import "./Sidebar.css";

interface Project {
  id: number;
  name: string;
}

export default function Sidebar({
  onClose,
  onCreateProject,
}: {
  onClose: () => void;
  onCreateProject: () => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { projectId, selectProject } = useActiveProject();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    getProjects().then(setProjects);
  };

  const handleSelectProject = (id: number | null) => {
    selectProject(id);
    onClose();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span>Projects</span>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="sidebar-content">
        <ul className="project-list">
          <li>
            <button
              className={!projectId ? "project-btn active" : "project-btn"}
              onClick={() => handleSelectProject(null)}
            >
              Global
            </button>
          </li>

          {projects.map((p) => (
            <li key={p.id}>
              <button
                className={
                  projectId === p.id
                    ? "project-btn active"
                    : "project-btn"
                }
                onClick={() => handleSelectProject(p.id)}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <button
        className="new-project-btn"
        onClick={onCreateProject}
      >
        + New project
      </button>
      </div>
    </aside>
  );
}