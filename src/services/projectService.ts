const API_URL = "http://localhost:3001";

export interface Project {
  id: number;
  name: string;
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`);
  const data = await res.json();
  return data.projects;
}

export async function createProject(name: string): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  const data = await res.json();
  return data.project;
}

export async function deleteProject(id: number) {
  await fetch(`${API_URL}/projects/${id}`, { method: "DELETE" });
}