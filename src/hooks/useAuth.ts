import { useEffect, useState } from "react";

const API_URL = import.meta.env.PUBLIC_API_URL;

interface User {
  id: number;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(
          `${API_URL}/auth/me`,
          { credentials: "include" }
        );

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();

        if (!data?.user) {
          setUser(null);
          return;
        }

        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();

    const refresh = () => {
      fetchMe();
    };

    window.addEventListener(
      "trackly:user-updated",
      refresh
    );

    return () =>
      window.removeEventListener(
        "trackly:user-updated",
        refresh
      );
  }, []);

  return { user, loading };
}