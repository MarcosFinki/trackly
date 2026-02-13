const API_URL = import.meta.env.PUBLIC_API_URL;

export interface Project {
  id: number;
  name: string;
  color: string;
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
  name: string,
  color: string
): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, color }),
  });

  if (!res.ok) {
    throw new Error("FAILED_TO_CREATE_PROJECT");
  }

  const data = await res.json();
  return data.project;
}

export async function updateProject(
  id: number,
  updates: {
    name?: string;
    color?: string;
  }
): Promise<void> {
  const res = await fetch(
    `${API_URL}/projects/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) {
    throw new Error("FAILED_TO_UPDATE_PROJECT");
  }
}

export async function deleteProject(
  id: number
): Promise<void> {
  const res = await fetch(
    `${API_URL}/projects/${id}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!res.ok) {
    throw new Error("FAILED_TO_DELETE_PROJECT");
  }
}