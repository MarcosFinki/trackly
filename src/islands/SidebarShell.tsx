import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./SidebarShell.css";
import ProjectModal from "./ProjectModal";
import { createProject } from "../services/projectService";
import { useActiveProject } from "../hooks/useActiveProject";
import HeaderTitle from "../components/HeaderTitle";
import UserMenu from "../components/UserMenu";

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showCreateProject, setShowCreateProject] =
    useState(false);

  const { selectProject } = useActiveProject();

  // 🔒 Bloquear scroll cuando modal abierto
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

  // ⌨ Escape solo cierra sidebar si NO hay modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCreateProject) return;
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () =>
      window.removeEventListener("keydown", handler);
  }, [showCreateProject]);

  const handleCreateProject = async (
    name: string,
    color: string
  ) => {
    const project = await createProject(
      name,
      color
    );

    // seleccionar nuevo proyecto
    selectProject(project.id, project.color);

    // cerrar todo correctamente
    setShowCreateProject(false);
    setOpen(false);

    // notificar sidebar
    window.dispatchEvent(
      new Event("trackly:projects-changed")
    );
  };

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <button
            className="hamburger"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>

        <div className="header-title-wrapper">
          <HeaderTitle />
        </div>

        <div className="header-right">
          <UserMenu />
        </div>
      </header>

      <main className="app-main">
        {children}
      </main>

      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`sidebar-drawer ${
          open ? "open" : ""
        }`}
      >
        <Sidebar
          onClose={() => setOpen(false)}
          onCreateProject={() =>
            setShowCreateProject(true)
          }
        />
      </aside>

      {showCreateProject && (
        <ProjectModal
          mode="create"
          onConfirm={handleCreateProject}
          onCancel={() =>
            setShowCreateProject(false)
          }
        />
      )}
    </>
  );
}