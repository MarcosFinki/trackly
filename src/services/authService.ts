const API_URL = import.meta.env.PUBLIC_API_URL;

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("INVALID_CREDENTIALS");
  }
}

export async function register(
  email: string,
  password: string
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error("USER_EXISTS");
    }

    throw new Error("REGISTER_FAILED");
  }
}

export async function updateProfile(data: {
  display_name?: string;
  avatar_url?: string;
  email?: string;
  password?: string;
  current_password?: string;
}) {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error || "UPDATE_FAILED");
  }

  return json;
}