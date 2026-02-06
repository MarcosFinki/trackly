const API_URL = "http://localhost:3001";

export interface Project {
  id: number;
  name: string;
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_LOAD_PROJECTS");
  }

  const data = await res.json();
  return data.projects;
}

export async function createProject(
  name: string
): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_CREATE_PROJECT");
  }

  const data = await res.json();
  return data.project;
}

export async function deleteProject(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/projects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_DELETE_PROJECT");
  }
}