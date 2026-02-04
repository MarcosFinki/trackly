import { useEffect, useState } from "react";

interface User {
  id: number;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/auth/me", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setUser(data.user))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}