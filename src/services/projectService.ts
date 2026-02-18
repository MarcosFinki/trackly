import { invoke } from "@tauri-apps/api/core";

export interface Project {
  id: number;
  name: string;
  color: string;
}

export async function getProjects(): Promise<Project[]> {
  try {
    return await invoke<Project[]>("get_projects");
  } catch {
    throw new Error("FAILED_TO_LOAD_PROJECTS");
  }
}

export async function createProject(
  name: string,
  color: string
): Promise<Project> {
  try {
    return await invoke<Project>("create_project", {
      input: { name, color },
    });
  } catch {
    throw new Error("FAILED_TO_CREATE_PROJECT");
  }
}

export async function updateProject(
  id: number,
  updates: {
    name?: string;
    color?: string;
  }
): Promise<void> {
  try {
    await invoke("update_project", {
      input: { id, ...updates },
    });
  } catch {
    throw new Error("FAILED_TO_UPDATE_PROJECT");
  }
}

export async function deleteProject(
  id: number
): Promise<void> {
  try {
    await invoke("delete_project", { id });
  } catch {
    throw new Error("FAILED_TO_DELETE_PROJECT");
  }
}