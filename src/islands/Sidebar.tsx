import { useState } from "react";
import { createPortal } from "react-dom";
import { useProjects } from "../context/ProjectsContext";
import ProjectModal from "../islands/ProjectModal";
import ConfirmModal from "../components/ConfirmModal";
import "./Sidebar.css";

export default function Sidebar({
  onClose,
  onCreateProject,
}: {
  onClose: () => void;
  onCreateProject: () => void;
}) {
  const {
    projects,
    activeProjectId,
    selectProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [editing, setEditing] = useState<typeof projects[number] | null>(null);
  const [toDelete, setToDelete] = useState<typeof projects[number] | null>(null);

  const handleSelectProject = (id: number | null) => {
    selectProject(id);
    onClose();
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
            {/* GLOBAL */}
            <li>
              <button
                className={
                  !activeProjectId
                    ? "project-btn active"
                    : "project-btn"
                }
                onClick={() => handleSelectProject(null)}
              >
                Global
              </button>
            </li>

            {/* PROJECTS */}
            {projects.map((p) => (
              <li key={p.id}>
                <div className="project-item">
                  <button
                    className={
                      activeProjectId === p.id
                        ? "project-btn active"
                        : "project-btn"
                    }
                    onClick={() => handleSelectProject(p.id)}
                  >
                    <div className="project-row">
                      <span
                        className="project-dot"
                        style={{
                          backgroundColor: p.color,
                        }}
                      />
                      {p.name}
                    </div>
                  </button>

                  <div className="project-actions">
                    <button onClick={() => setEditing(p)}>
                      ✏
                    </button>

                    <button onClick={() => setToDelete(p)}>
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

      {/* EDIT MODAL */}
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

              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />,
          document.body
        )}

      {/* DELETE CONFIRM */}
      {toDelete && (
        <ConfirmModal
          title="Delete project"
          message={`Are you sure you want to delete "${toDelete.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onCancel={() => setToDelete(null)}
          onConfirm={async () => {
            await deleteProject(toDelete.id);
            setToDelete(null);
          }}
        />
      )}
    </>
  );
}