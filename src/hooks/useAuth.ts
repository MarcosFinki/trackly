import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
}

export function useAuth() {
  const [user, setUser] =
    useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(
          "http://localhost:3001/auth/me",
          { credentials: "include" }
        );

        if (!res.ok) {
          console.error(
            "[useAuth] /auth/me failed:",
            res.status,
            res.statusText
          );
          setUser(null);
          return;
        }

        const data = await res.json();

        if (!data?.user) {
          console.error(
            "[useAuth] Invalid response:",
            data
          );
          setUser(null);
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error(
          "[useAuth] Network or parsing error:",
          err
        );
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