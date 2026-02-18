import { invoke } from "@tauri-apps/api/core";

/* =========================
   Types
========================= */

export interface PublicUser {
  id: number;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified?: boolean;
}

/* =========================
   AUTH
========================= */

export async function login(
  email: string,
  password: string
): Promise<PublicUser> {
  try {
    return await invoke<PublicUser>("login", {
      input: { email, password },
    });
  } catch {
    throw new Error("INVALID_CREDENTIALS");
  }
}

export async function register(
  email: string,
  password: string
): Promise<PublicUser> {
  try {
    return await invoke<PublicUser>("register_user", {
      input: { email, password },
    });
  } catch {
    throw new Error("REGISTER_FAILED");
  }
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  try {
    return await invoke<PublicUser>("get_current_user");
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await invoke("logout_user");
  } catch {
    // noop
  }
}

/* =========================
   UPDATE PROFILE
========================= */

export async function updateProfile(data: {
  display_name?: string;
  email?: string;
  password?: string;
  current_password?: string;
}): Promise<PublicUser> {
  try {
    return await invoke<PublicUser>("update_user_profile", {
      input: data,
    });
  } catch (err: any) {
    throw new Error(err?.message || "UPDATE_FAILED");
  }
}

/* =========================
   AVATAR UPLOAD
========================= */

export async function uploadAvatar(
  file: File
): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();

    return await invoke<string>("upload_avatar", {
      bytes: Array.from(new Uint8Array(bytes)),
    });
  } catch {
    throw new Error("UPLOAD_FAILED");
  }
}