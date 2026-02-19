import { invoke } from "@tauri-apps/api/core";
import type { PublicUserDTO } from "../types/user.dto";

/* =========================
   AUTH (DTO ONLY)
========================= */

export async function login(
  email: string,
  password: string
): Promise<PublicUserDTO> {
  return await invoke<PublicUserDTO>("login", {
    input: { email, password },
  });
}

export async function register(
  email: string,
  password: string
): Promise<PublicUserDTO> {
  return await invoke<PublicUserDTO>("register_user", {
    input: { email, password },
  });
}

export async function getCurrentUser(): Promise<PublicUserDTO | null> {
  try {
    return await invoke<PublicUserDTO>("get_current_user");
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await invoke("logout_user");
}

/* =========================
   UPDATE PROFILE
========================= */

export async function updateProfile(data: {
  displayName?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
}): Promise<PublicUserDTO> {
  const payload = {
    display_name: data.displayName,
    email: data.email,
    password: data.password,
    current_password: data.currentPassword,
  };

  return await invoke<PublicUserDTO>("update_user_profile", {
    input: payload,
  });
}

/* =========================
   AVATAR UPLOAD
========================= */

export async function uploadAvatar(
  file: File
): Promise<string> {
  const bytes = await file.arrayBuffer();

  return await invoke<string>("upload_avatar", {
    bytes: Array.from(new Uint8Array(bytes)),
  });
}