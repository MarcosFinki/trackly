import { ProjectsProvider } from "../context/ProjectsContext";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProjectsProvider>{children}</ProjectsProvider>;
}