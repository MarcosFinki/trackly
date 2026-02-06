import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./SidebarShell.css";
import CreateProjectModal from "./CreateProjectModal";
import { createProject } from "../services/projectService";
import { useActiveProject } from "../hooks/useActiveProject";
import HeaderTitle from "../components/HeaderTitle";

export default function SidebarShell({
    children,
  }: {
    children: React.ReactNode;
  }) {
  const [open, setOpen] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { selectProject } = useActiveProject();

  useEffect(() => {
    if (showCreateProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showCreateProject]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCreateProject = async (name: string) => {
  const project = await createProject(name);

  selectProject(project.id);

  window.dispatchEvent(new Event("trackly:projects-changed"));

  setShowCreateProject(false);
  setOpen(false);
};

  return (
    <>
      <header className="app-header">
        <button className="hamburger" onClick={() => setOpen(true)}>
          ☰
        </button>

        <HeaderTitle />

        <div style={{ width: 24 }} />
      </header>

      <main className="app-main">{children}</main>

      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar-drawer ${open ? "open" : ""}`}>
        <Sidebar onClose={() => setOpen(false)} onCreateProject={() => setShowCreateProject(true)} />
      </aside>

      {showCreateProject && (
        <CreateProjectModal
          onConfirm={handleCreateProject}
          onCancel={() => setShowCreateProject(false)}
        />
      )}

    </>
  );
}