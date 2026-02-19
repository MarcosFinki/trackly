import { invoke } from "@tauri-apps/api/core";
import type { Project } from "../types/project";

/* =========================
   GET
========================= */

export async function getProjects(): Promise<Project[]> {
  return await invoke<Project[]>("get_projects");
}

/* =========================
   CREATE
========================= */

export async function createProject(
  name: string,
  color: string
): Promise<Project> {
  return await invoke<Project>("create_project", {
    input: { name, color },
  });
}

/* =========================
   UPDATE
========================= */

export async function updateProject(
  id: number,
  updates: {
    name?: string;
    color?: string;
  }
): Promise<void> {
  await invoke("update_project", {
    input: { id, ...updates },
  });
}

/* =========================
   DELETE
========================= */

export async function deleteProject(
  id: number
): Promise<void> {
  await invoke("delete_project", { id });
}