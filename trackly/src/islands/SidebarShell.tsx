import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import "./SidebarShell.css";
import ProjectModal from "./ProjectModal";
import HeaderTitle from "../components/HeaderTitle";
import UserMenu from "../components/UserMenu";
import { useProjects } from "../context/ProjectsContext";

export default function SidebarShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showCreateProject, setShowCreateProject] =
    useState(false);

  const { createProject } = useProjects();

  /* ===========================
     LOCK SCROLL WHEN MODAL OPEN
  =========================== */

  useEffect(() => {
    document.body.style.overflow = showCreateProject
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showCreateProject]);

  /* ===========================
     ESC KEY HANDLER
  =========================== */

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

  /* ===========================
     CREATE PROJECT
  =========================== */

  const handleCreateProject = async (
    name: string,
    color: string
  ) => {
    try {
      await createProject(name, color);

      setShowCreateProject(false);
      setOpen(false);
    } catch (e) {
      console.error("CREATE_PROJECT_ERROR", e);
    }
  };

  /* ===========================
     RENDER
  =========================== */

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