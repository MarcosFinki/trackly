import { useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";
import type { PublicUser } from "../services/authService";

export function useAuth() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        const result: PublicUser | null = await getCurrentUser();

        if (mounted) {
          setUser(result);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchMe();

    const refresh = () => {
      fetchMe();
    };

    window.addEventListener("trackly:user-updated", refresh);

    return () => {
      mounted = false;
      window.removeEventListener("trackly:user-updated", refresh);
    };
  }, []);

  return { user, loading };
}