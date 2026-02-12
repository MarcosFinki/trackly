import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  getProjects,
  deleteProject,
  updateProject,
  type Project,
} from "../services/projectService";
import { useActiveProject } from "../hooks/useActiveProject";
import ProjectModal from "../islands/ProjectModal";
import "./Sidebar.css";
import ConfirmModal from "../components/ConfirmModal";

export default function Sidebar({
  onClose,
  onCreateProject,
}: {
  onClose: () => void;
  onCreateProject: () => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);

  const [toDelete, setToDelete] = useState<Project | null>(null);

  const { projectId, selectProject } = useActiveProject();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    getProjects().then(setProjects);
  };

  const handleSelectProject = (
    id: number | null,
    color?: string
  ) => {
    selectProject(id, color);
    onClose();
  };

  const handleDelete = (project: Project) => {
    setToDelete(project);
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <span>Projects</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="sidebar-content">
          <ul className="project-list">
            <li>
              <button
                className={
                  !projectId
                    ? "project-btn active"
                    : "project-btn"
                }
                onClick={() =>
                  handleSelectProject(null)
                }
              >
                Global
              </button>
            </li>

            {projects.map((p) => (
              <li key={p.id}>
                <div className="project-item">
                  <button
                    className={
                      projectId === p.id
                        ? "project-btn active"
                        : "project-btn"
                    }
                    onClick={() =>
                      handleSelectProject(
                        p.id,
                        p.color
                      )
                    }
                  >
                    <div className="project-row">
                      <span
                        className="project-dot"
                        style={{
                          backgroundColor:
                            p.color,
                        }}
                      />
                      {p.name}
                    </div>
                  </button>

                  <div className="project-actions">
                    <button
                      onClick={() =>
                        setEditing(p)
                      }
                    >
                      ✏
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(p)
                      }
                    >
                      🗑
                    </button>
                  </div>
                </div>
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

      {/* 🔥 MODAL CON PORTAL */}
      {editing &&
        createPortal(
          <ProjectModal
            mode="edit"
            initialName={editing.name}
            initialColor={editing.color}
            onConfirm={async (name, color) => {
              await updateProject(editing.id, {
                name,
                color,
              });

              if (projectId === editing.id) {
                selectProject(editing.id, color);
              }

              setEditing(null);
              loadProjects();
            }}
            onCancel={() =>
              setEditing(null)
            }
          />,
          document.body
        )}

        {toDelete && (
          <ConfirmModal
            title="Delete project"
            message={`Are you sure you want to delete "${toDelete.name}"? This cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onCancel={() => setToDelete(null)}
            onConfirm={async () => {
              await deleteProject(toDelete.id);

              if (projectId === toDelete.id) {
                selectProject(null);
              }

              setToDelete(null);
              loadProjects();
            }}
          />
        )}
    </>
  );
}