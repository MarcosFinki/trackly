import { ProjectsProvider } from "../context/ProjectsContext";
import SidebarShell from "./SidebarShell";
import DashboardGate from "./DashboardGate";

export default function AppRoot() {
  return (
    <ProjectsProvider>
      <SidebarShell>
        <DashboardGate />
      </SidebarShell>
    </ProjectsProvider>
  );
}