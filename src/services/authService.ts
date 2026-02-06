const API_URL = "http://localhost:3001";

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